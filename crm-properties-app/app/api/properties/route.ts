import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PropertyStatus } from "@prisma/client";

export async function GET() {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da vidi nekretnine.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Uzimamo samo nekretnine prijavljenog agenta.
    const properties = await prisma.property.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Vraćamo listu nekretnina.
    return NextResponse.json({
      success: true,
      data: properties,
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to fetch properties." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo agent može da kreira nekretninu.
    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Čitamo podatke iz tela zahteva.
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

    // Proveravamo obavezna polja.
    if (!title || !description || !price || !address || !city || !type) {
      return NextResponse.json(
        { success: false, message: "All required fields must be filled." },
        { status: 400 }
      );
    }

    // Kreiramo novu nekretninu i vezujemo je za prijavljenog agenta.
    const property = await prisma.property.create({
      data: {
        title,
        description,
        status: status ? (status as PropertyStatus) : PropertyStatus.AVAILABLE,
        price: Number(price),
        address,
        city,
        type,
        imageUrl: imageUrl || null,
        userId: user.id,
      },
    });

    // Vraćamo uspešan odgovor.
    return NextResponse.json(
      {
        success: true,
        message: "Property created successfully.",
        data: property,
      },
      { status: 201 }
    );
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to create property." },
      { status: 500 }
    );
  }
}