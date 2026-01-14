// src/server/services/managerService.ts

import { prisma } from "../db/prisma";
import { requireAuth } from "../auth/requireAuth";
import { requireRole } from "../auth/requireRole";
import { dealFilterSchema } from "../validators/managerValidators";
import { httpError,  normalizeError } from "../http/errors";

// Napomena: koristi isti validator kao seller, ali bez seller ownership provere.
import { updateClientSchema } from "../validators/clientValidators";

// Pomocna funkcija: deal je zatvoren ako ima closeDate ili stage = won/lost.
function isClosed(stage: string | null, closeDate: Date | null) {
  return !!closeDate || stage === "won" || stage === "lost";
}

// Pregled klijenata za izabranog prodavca (Menadzer).
export async function managerListSellerClients(sellerId: number) {
  const session = await requireAuth();
  requireRole(session.role, ["manager", "admin"]);

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!seller || seller.role !== "seller") {
    throw httpError(404, "Seller not found.");
  }

  // Klijenti koji imaju bar jedan deal sa ovim seller-om.
  const clients = await prisma.client.findMany({
    where: { deals: { some: { userId: sellerId } } },
    orderBy: { id: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      deals: {
        where: { userId: sellerId },
        select: { stage: true, closeDate: true },
      },
    },
  });

  const rows = clients.map((c) => {
    const closed = c.deals.filter((d) => isClosed(d.stage, d.closeDate)).length;
    const active = c.deals.length - closed;

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      city: c.city,
      dealsCount: c.deals.length,
      activeDealsCount: active,
      closedDealsCount: closed,
    };
  });

  return {
    seller: { id: seller.id, name: seller.name, email: seller.email },
    clients: rows,
  };
}

// Pregled jednog klijenta (Menadzer).
export async function managerGetClient(clientId: number) {
  const session = await requireAuth();
  requireRole(session.role, ["manager", "admin"]);

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true, phone: true, city: true },
  });

  if (!client) throw httpError(404, "Client not found.");

  return { client };
}

// Azuriranje klijenta (Menadzer).
export async function managerUpdateClient(clientId: number, input: unknown) {
  const session = await requireAuth();
  requireRole(session.role, ["manager", "admin"]);

  const data = updateClientSchema.parse(input);

  const exists = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
  if (!exists) throw httpError(404, "Client not found.");

  try {
    const client = await prisma.client.update({
      where: { id: clientId },
      data,
      select: { id: true, name: true, email: true, phone: true, city: true },
    });

    return { message: "Client updated successfully.", client };
  } catch (e) {
    throw normalizeError(e);
  }
}

// SK8 Pregled prodavaca i liste njihovih dealova (Menadzer).
export async function managerListSellersWithCounts() {
  const session = await requireAuth();
  requireRole(session.role, ["manager", "admin"]);

  const sellers = await prisma.user.findMany({
    where: { role: "seller" },
    select: {
      id: true,
      name: true,
      email: true,
      deals: { select: { stage: true, closeDate: true } },
    },
  });

  const rows = sellers.map((s) => {
    const closed = s.deals.filter((d) => isClosed(d.stage, d.closeDate)).length;
    const active = s.deals.length - closed;

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      activeDeals: active,
      closedDeals: closed,
    };
  });

  return { sellers: rows };
}

// SK9 Filtriranje dealova po fazi i statusu (Menadzer).
export async function managerFilterDeals(input: unknown) {
  const session = await requireAuth();
  requireRole(session.role, ["manager", "admin"]);

  const f = dealFilterSchema.parse(input);

  const where: any = {};

  if (f.stage) where.stage = f.stage;
  if (f.sellerId) where.userId = f.sellerId;

  // Napomena: filtriramo po closeDate jer u semi nemamo createdAt.
  if (f.fromCloseDate || f.toCloseDate) {
    where.closeDate = {};
    if (f.fromCloseDate) where.closeDate.gte = new Date(f.fromCloseDate);
    if (f.toCloseDate) where.closeDate.lte = new Date(f.toCloseDate);
  }

  const deals = await prisma.deal.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, city: true } },
      property: { select: { id: true, title: true, city: true, price: true } },
    },
  });

  if (deals.length === 0) {
    return { deals: [], message: "No deals for selected filters." };
  }

  return { deals };
}

// SK10 Pregled metrika prodaje po prodavcu i periodu (Menadzer).
export async function managerGetSellerMetrics(sellerId: number, from?: string, to?: string) {
  const session = await requireAuth();
  requireRole(session.role, ["manager", "admin"]);

  const where: any = { userId: sellerId };

  if (from || to) {
    where.closeDate = {};
    if (from) where.closeDate.gte = new Date(from);
    if (to) where.closeDate.lte = new Date(to);
  }

  const deals = await prisma.deal.findMany({
    where,
    select: { id: true, stage: true, expectedValue: true, closeDate: true },
  });

  if (deals.length === 0) {
    return { message: "No data for selected period.", metrics: null };
  }

  const closed = deals.filter((d) => isClosed(d.stage, d.closeDate));
  const won = closed.filter((d) => d.stage === "won").length;
  const lost = closed.filter((d) => d.stage === "lost").length;

  const totalExpected = deals.reduce((sum, d) => sum + (d.expectedValue || 0), 0);
  const wonValue = closed
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + (d.expectedValue || 0), 0);

  return {
    metrics: {
      totalDeals: deals.length,
      closedDeals: closed.length,
      wonDeals: won,
      lostDeals: lost,
      totalExpectedValue: totalExpected,
      wonValue,
    },
  };
}

// SK11 Eksport izvestaja o ucinku prodavca (Menadzer) - CSV.
export async function managerExportSellerReportCsv(sellerId: number, from?: string, to?: string) {
  const result = await managerGetSellerMetrics(sellerId, from, to);

  if (!result.metrics) {
    throw httpError(400, "No data to export.");
  }

  const m = result.metrics;

  const csv =
    "metric,value\n" +
    Object.entries(m)
      .map(([k, v]) => `${k},${v}`)
      .join("\n") +
    "\n";

  return {
    filename: "seller-report.csv",
    contentType: "text/csv",
    content: csv,
  };
}