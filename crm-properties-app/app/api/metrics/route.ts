import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo admin može da vidi metrike sistema.
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Paralelno brojimo podatke iz svih važnih tabela.
    const [usersCount, clientsCount, propertiesCount, interestsCount, activitiesCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.client.count(),
        prisma.property.count(),
        prisma.clientPropertyInterest.count(),
        prisma.activity.count(),
      ]);

    // Vraćamo metrike u JSON formatu.
    return NextResponse.json({
      success: true,
      data: {
        usersCount,
        clientsCount,
        propertiesCount,
        interestsCount,
        activitiesCount,
      },
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to fetch metrics." },
      { status: 500 }
    );
  }
}