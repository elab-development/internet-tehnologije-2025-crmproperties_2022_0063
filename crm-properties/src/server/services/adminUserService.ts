// src/server/services/adminUserService.ts

import { prisma } from "../db/prisma";
import { requireAuth } from "../auth/requireAuth";
import { requireRole } from "../auth/requireRole";
import { updateUserSchema } from "../validators/userValidators";
import { httpError, normalizeError } from "../http/errors";

// SK4 Pregled svih korisnika i njihovih uloga (Administrator).
export async function adminListUsers() {
  const session = await requireAuth();
  requireRole(session.role, ["admin"]);

  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  // U semi nemamo "active" kolonu, pa je za demo uvek true.
  const rows = users.map((u) => ({ ...u, active: true }));

  return { users: rows };
}

// SK5 Izmena podataka korisnika (Administrator).
export async function adminUpdateUser(userId: number, input: unknown) {
  const session = await requireAuth();
  requireRole(session.role, ["admin"]);

  const data = updateUserSchema.parse(input);

  try {
    // Ako menjamo ulogu admina u nesto drugo, proveravamo da ne obrisemo poslednjeg admina.
    if (data.role) {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) throw httpError(404, "User not found.");

      if ((target.role || "seller") === "admin" && data.role !== "admin") {
        const adminCount = await prisma.user.count({ where: { role: "admin" } });
        if (adminCount <= 1) {
          throw httpError(400, "You must keep at least one admin user.");
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return { message: "User updated successfully.", user: updated };
  } catch (e) {
    throw normalizeError(e);
  }
}

// SK5 Brisanje korisnika (Administrator).
export async function adminDeleteUser(userId: number) {
  const session = await requireAuth();
  requireRole(session.role, ["admin"]);

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw httpError(404, "User not found.");

  // Ne dozvoljavamo brisanje poslednjeg admina.
  if ((target.role || "seller") === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      throw httpError(400, "You must keep at least one admin user.");
    }
  }

  // Prvo brisemo aktivnosti -> dealove -> user-a (zbog FK).
  const deals = await prisma.deal.findMany({ where: { userId }, select: { id: true } });
  const dealIds = deals.map((d) => d.id);

  await prisma.activity.deleteMany({ where: { dealId: { in: dealIds } } });
  await prisma.deal.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return { message: "User deleted successfully." };
}
