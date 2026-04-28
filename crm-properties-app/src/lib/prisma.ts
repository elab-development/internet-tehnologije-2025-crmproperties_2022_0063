import { PrismaClient } from "@prisma/client";

// Pravimo globalni tip za Prisma instancu da ne bi nastajalo više konekcija u development modu.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ako već postoji Prisma instanca koristimo nju, inače pravimo novu.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

// U development modu čuvamo instancu globalno.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}