// src/server/http/errors.ts

import { Prisma } from "@prisma/client";

// Pravimo standardizovanu gresku sa HTTP status kodom.
export function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

// Ovo pretvara razlicite greske (Prisma, JS, itd.) u jednu "nasu" gresku.
// Tako pocetnici uvek dobijaju isti format poruke i status kod.
export function normalizeError(e: unknown) {
  // Ako je vec nasa greska (ima status), samo je vratimo.
  if (typeof e === "object" && e !== null && "status" in e) {
    const status = (e as any).status;
    if (typeof status === "number") return e as any;
  }

  // Prisma poznate greske (npr. unique constraint).
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = unique constraint failed.
    if (e.code === "P2002") {
      return httpError(400, "Unique constraint failed.");
    }

    return httpError(400, "Database error.");
  }

  // Sve ostalo tretiramo kao serversku gresku.
  return httpError(500, "Server error.");
}
