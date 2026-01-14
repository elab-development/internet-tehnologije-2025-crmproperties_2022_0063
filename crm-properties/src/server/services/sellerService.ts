// src/server/services/sellerService.ts

import { prisma } from "../db/prisma";
import { requireAuth } from "../auth/requireAuth";
import { requireRole } from "../auth/requireRole";
import { createClientSchema, updateClientSchema } from "../validators/clientValidators";
import { createDealSchema, updateDealStageSchema } from "../validators/dealValidators";
import { createActivitySchema } from "../validators/activityValidators";
import { httpError, normalizeError } from "../http/errors";

// Jednostavan redosled faza za proveru dozvoljenih prelaza (SK16).
const stageOrder = ["new", "negotiation", "offer_sent", "won", "lost"] as const;

function stageIndex(stage: string) {
  const i = stageOrder.indexOf(stage as any);
  return i === -1 ? 0 : i;
}

// SK12 Pregled sopstvenih klijenata (Prodavac).
export async function sellerListMyClients() {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  // U tvojoj semi Client nema ownerId, pa "moji klijenti" znaci:
  // klijenti koji imaju bar jedan deal sa ovim prodavcem.
  const clients = await prisma.client.findMany({
    where: { deals: { some: { userId: session.sub } } },
    orderBy: { id: "desc" },
    select: { id: true, name: true, email: true, phone: true, city: true },
  });

  if (clients.length === 0) {
    return { clients: [], message: "You have no clients yet." };
  }

  return { clients };
}

// GET lista dealova prodavca (koristi se na Manage Deals stranici).
export async function sellerListDeals() {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  // Prodavac vidi samo svoje dealove. Admin moze da vidi sve.
  const where = session.role === "admin" ? {} : { userId: session.sub };

  const deals = await prisma.deal.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      client: { select: { id: true, name: true } },
      property: { select: { id: true, title: true } },
    },
  });

  return { deals };
}

// GET lista klijenata (za combo box).
export async function sellerListClients() {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  // U ovoj verziji uzimamo sve klijente iz baze.
  // Ako kasnije budeš imala vezu "client -> seller", ovde samo promeni where uslov.
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return { clients };
}

// GET lista nekretnina (za combo box).
export async function sellerListProperties() {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  const properties = await prisma.property.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return { properties };
}

// SK13 Dodavanje novog klijenta (Prodavac).
export async function sellerCreateClient(input: unknown) {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  const data = createClientSchema.parse(input);

  try {
    const client = await prisma.client.create({
      data,
      select: { id: true, name: true, email: true, phone: true, city: true },
    });

    // Povezivanje klijenta sa prodavcem se desava kad se kreira prvi deal.
    return { message: "Client created successfully.", client };
  } catch (e) {
    throw normalizeError(e);
  }
}

// SK14 Azuriranje klijenta (Prodavac).
export async function sellerUpdateClient(clientId: number, input: unknown) {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  const data = updateClientSchema.parse(input);

  // Prodavac sme da menja klijenta samo ako vec ima deal sa njim.
  if (session.role === "seller") {
    const hasDeal = await prisma.deal.findFirst({
      where: { userId: session.sub, clientId },
      select: { id: true },
    });
    if (!hasDeal) {
      throw httpError(403, "You cannot edit this client.");
    }
  }

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

// SK15 Kreiranje novog deala (Prodavac).
export async function sellerCreateDeal(input: unknown) {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  const data = createDealSchema.parse(input);

  const [client, property] = await Promise.all([
    prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true } }),
    prisma.property.findUnique({ where: { id: data.propertyId }, select: { id: true } }),
  ]);

  if (!client) throw httpError(400, "Client not found.");
  if (!property) throw httpError(400, "Property not found.");

  try {
    const deal = await prisma.deal.create({
      data: {
        title: data.title,
        expectedValue: data.expectedValue,
        stage: data.stage || "new",
        closeDate: null,
        userId: session.sub,
        clientId: data.clientId,
        propertyId: data.propertyId,
      },
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
      },
    });

    return { message: "Deal created successfully.", deal };
  } catch (e) {
    throw normalizeError(e);
  }
}

// SK16 Promena faze i zatvaranje deala (Prodavac).
export async function sellerUpdateDealStage(dealId: number, input: unknown) {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  const data = updateDealStageSchema.parse(input);

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { id: true, userId: true, stage: true, closeDate: true },
  });

  if (!deal) throw httpError(404, "Deal not found.");

  // Prodavac moze da menja samo svoje dealove.
  if (session.role === "seller" && deal.userId !== session.sub) {
    throw httpError(403, "You cannot edit this deal.");
  }

  const currentStage = deal.stage || "new";
  const nextStage = data.stage;

  // Najjednostavnije pravilo: ne dozvoljavamo "vracanje unazad" kroz faze.
  if (stageIndex(nextStage) < stageIndex(currentStage)) {
    throw httpError(400, "Stage transition is not allowed.");
  }

  // Ako je deal "won" ili "lost", upisujemo closeDate.
  const closeDate = nextStage === "won" || nextStage === "lost" ? new Date() : null;

  const updated = await prisma.deal.update({
    where: { id: dealId },
    data: { stage: nextStage, closeDate },
  });

  return { message: "Deal stage updated successfully.", deal: updated };
}

// SK17 Dodavanje aktivnosti na deal (Prodavac).
export async function sellerAddActivity(dealId: number, input: unknown) {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  const data = createActivitySchema.parse(input);

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { id: true, userId: true },
  });

  if (!deal) throw httpError(404, "Deal not found.");

  if (session.role === "seller" && deal.userId !== session.sub) {
    throw httpError(403, "You cannot add activity to this deal.");
  }

  // Proveravamo dueDate da ne bismo slali Invalid Date u bazu.
  const due = data.dueDate ? new Date(data.dueDate) : null;
  if (due && Number.isNaN(due.getTime())) {
    throw httpError(400, "Invalid dueDate.");
  }

  const activity = await prisma.activity.create({
    data: {
      subject: data.subject,
      type: data.type,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      dealId,
    },
  });

  return { message: "Activity added successfully.", activity };
}

// SK17 Pregled aktivnosti na dealu (Prodavac).
export async function sellerListActivities(dealId: number) {
  const session = await requireAuth();
  requireRole(session.role, ["seller", "admin"]);

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { id: true, userId: true },
  });

  if (!deal) throw httpError(404, "Deal not found.");

  if (session.role === "seller" && deal.userId !== session.sub) {
    throw httpError(403, "You cannot view activities for this deal.");
  }

  const activities = await prisma.activity.findMany({
    where: { dealId },
    orderBy: { dueDate: "asc" },
  });

  return { activities };
}
