import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { InterestStatus } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da ažurira interesovanje.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Uzimamo id iz URL parametra.
    const { id } = await context.params;
    const interestId = Number(id);

    // Proveravamo da li je id validan broj.
    if (Number.isNaN(interestId)) {
      return NextResponse.json(
        { success: false, message: "Invalid interest id." },
        { status: 400 }
      );
    }

    // Proveravamo da li interesovanje postoji.
    const existingInterest = await prisma.clientPropertyInterest.findUnique({
      where: {
        id: interestId,
      },
    });

    if (!existingInterest) {
      return NextResponse.json(
        { success: false, message: "Interest not found." },
        { status: 404 }
      );
    }

    // Čitamo podatke iz tela zahteva.
    const body = await request.json();
    const { status, note } = body;

    // Ažuriramo interesovanje.
    const updatedInterest = await prisma.clientPropertyInterest.update({
      where: {
        id: interestId,
      },
      data: {
        status: status ? (status as InterestStatus) : existingInterest.status,
        note: note !== undefined ? note : existingInterest.note,
      },
      include: {
        client: true,
        property: true,
        activities: true,
      },
    });

    // Vraćamo uspešan odgovor.
    return NextResponse.json({
      success: true,
      message: "Interest updated successfully.",
      data: updatedInterest,
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to update interest." },
      { status: 500 }
    );
  }
}