import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ActivityType } from "@prisma/client";

export async function GET() {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da vidi aktivnosti.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Uzimamo samo aktivnosti koje je uneo prijavljeni agent.
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
      },
      include: {
        interest: {
          include: {
            client: true,
            property: true,
          },
        },
        user: true,
      },
      orderBy: {
        activityDate: "desc",
      },
    });

    // Vraćamo listu aktivnosti.
    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to fetch activities." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da dodaje aktivnosti.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Čitamo podatke iz tela zahteva.
    const body = await request.json();
    const { type, description, activityDate, interestId } = body;

    // Proveravamo obavezna polja.
    if (!type || !description || !activityDate || !interestId) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    // Proveravamo da li interesovanje postoji.
    const existingInterest = await prisma.clientPropertyInterest.findUnique({
      where: {
        id: Number(interestId),
      },
      include: {
        property: true,
      },
    });

    if (!existingInterest) {
      return NextResponse.json(
        { success: false, message: "Interest not found." },
        { status: 404 }
      );
    }

    // Dodatna zaštita: agent može da dodaje aktivnost samo za nekretninu koja pripada njemu.
    if (existingInterest.property.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only add activities for your own properties.",
        },
        { status: 403 }
      );
    }

    // Kreiramo novu aktivnost.
    const activity = await prisma.activity.create({
      data: {
        type: type as ActivityType,
        description,
        activityDate: new Date(activityDate),
        userId: user.id,
        interestId: Number(interestId),
      },
      include: {
        interest: {
          include: {
            client: true,
            property: true,
          },
        },
        user: true,
      },
    });

    // Vraćamo uspešan odgovor.
    return NextResponse.json(
      {
        success: true,
        message: "Activity created successfully.",
        data: activity,
      },
      { status: 201 }
    );
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to create activity." },
      { status: 500 }
    );
  }
}