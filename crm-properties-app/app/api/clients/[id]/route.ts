import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo manager može da briše klijente.
    if (!user || user.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Uzimamo id iz URL parametra.
    const { id } = await context.params;
    const clientId = Number(id);

    // Proveravamo da li je id validan broj.
    if (Number.isNaN(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client id." },
        { status: 400 }
      );
    }

    // Proveravamo da li klijent postoji pre brisanja.
    const existingClient = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, message: "Client not found." },
        { status: 404 }
      );
    }

    // Brišemo klijenta iz baze.
    await prisma.client.delete({
      where: {
        id: clientId,
      },
    });

    // Vraćamo uspešan odgovor.
    return NextResponse.json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to delete client." },
      { status: 500 }
    );
  }
}