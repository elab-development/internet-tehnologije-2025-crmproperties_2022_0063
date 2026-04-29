import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { InterestStatus } from "@prisma/client";

export async function GET() {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da vidi interesovanja.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Uzimamo sva interesovanja zajedno sa klijentom, nekretninom i aktivnostima.
    const interests = await prisma.clientPropertyInterest.findMany({
      include: {
        client: true,
        property: true,
        activities: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Vraćamo listu interesovanja.
    return NextResponse.json({
      success: true,
      data: interests,
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to fetch interests." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da kreira interesovanje.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Čitamo podatke iz tela zahteva.
    const body = await request.json();
    const { clientId, propertyId, status, note } = body;

    // Proveravamo obavezna polja.
    if (!clientId || !propertyId) {
      return NextResponse.json(
        { success: false, message: "Client and property are required." },
        { status: 400 }
      );
    }

    // Proveravamo da li klijent postoji.
    const existingClient = await prisma.client.findUnique({
      where: {
        id: Number(clientId),
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, message: "Client not found." },
        { status: 404 }
      );
    }

    // Proveravamo da li nekretnina postoji.
    const existingProperty = await prisma.property.findUnique({
      where: {
        id: Number(propertyId),
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, message: "Property not found." },
        { status: 404 }
      );
    }

    // Proveravamo da li isto interesovanje već postoji.
    const existingInterest = await prisma.clientPropertyInterest.findUnique({
      where: {
        clientId_propertyId: {
          clientId: Number(clientId),
          propertyId: Number(propertyId),
        },
      },
    });

    if (existingInterest) {
      return NextResponse.json(
        {
          success: false,
          message: "This interest already exists for the selected client and property.",
        },
        { status: 409 }
      );
    }

    // Kreiramo novo interesovanje.
    const interest = await prisma.clientPropertyInterest.create({
      data: {
        clientId: Number(clientId),
        propertyId: Number(propertyId),
        status: status ? (status as InterestStatus) : InterestStatus.NEW,
        note: note || null,
      },
      include: {
        client: true,
        property: true,
      },
    });

    // Vraćamo uspešan odgovor.
    return NextResponse.json(
      {
        success: true,
        message: "Interest created successfully.",
        data: interest,
      },
      { status: 201 }
    );
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to create interest." },
      { status: 500 }
    );
  }
}