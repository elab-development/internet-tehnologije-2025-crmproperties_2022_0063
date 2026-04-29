import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PropertyStatus } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da ažurira nekretninu.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Uzimamo id iz URL parametra.
    const { id } = await context.params;
    const propertyId = Number(id);

    // Proveravamo da li je id validan broj.
    if (Number.isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, message: "Invalid property id." },
        { status: 400 }
      );
    }

    // Proveravamo da li nekretnina postoji i da li pripada agentu.
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId: user.id,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, message: "Property not found." },
        { status: 404 }
      );
    }

    // Čitamo nove podatke iz body-ja.
    const body = await request.json();
    const {
      title,
      description,
      status,
      price,
      address,
      city,
      type,
      imageUrl,
    } = body;

    // Ažuriramo nekretninu.
    const updatedProperty = await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: {
        title,
        description,
        status: status as PropertyStatus,
        price: Number(price),
        address,
        city,
        type,
        imageUrl: imageUrl || null,
      },
    });

    // Vraćamo uspešan odgovor.
    return NextResponse.json({
      success: true,
      message: "Property updated successfully.",
      data: updatedProperty,
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to update property." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da briše nekretninu.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Uzimamo id iz URL parametra.
    const { id } = await context.params;
    const propertyId = Number(id);

    // Proveravamo da li je id validan broj.
    if (Number.isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, message: "Invalid property id." },
        { status: 400 }
      );
    }

    // Proveravamo da li nekretnina postoji i da li pripada agentu.
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId: user.id,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, message: "Property not found." },
        { status: 404 }
      );
    }

    // Brišemo nekretninu.
    await prisma.property.delete({
      where: {
        id: propertyId,
      },
    });

    // Vraćamo uspešan odgovor.
    return NextResponse.json({
      success: true,
      message: "Property deleted successfully.",
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to delete property." },
      { status: 500 }
    );
  }
}