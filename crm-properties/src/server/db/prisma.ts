// src/server/db/prisma.ts

import { PrismaClient } from "@prisma/client";

// Prisma Client treba da bude singleton u Next.js dev modu.
// U suprotnom, hot reload moze da napravi vise konekcija ka bazi.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // Logujemo samo greske da ne bismo zatrpavali konzolu.
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
