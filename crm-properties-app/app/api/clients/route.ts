import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ClientStatus } from "@prisma/client";

export async function GET() {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo manager i agent mogu da vide klijente.
    if (!user || !["MANAGER", "AGENT"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Uzimamo sve klijente iz baze sortirane po datumu kreiranja.
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Vraćamo listu klijenata.
    return NextResponse.json({
      success: true,
      data: clients,
    });
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to fetch clients." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Uzimamo trenutno prijavljenog korisnika.
    const user = await getCurrentUser();

    // Samo manager može da dodaje klijente.
    if (!user || user.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    // Čitamo podatke iz tela zahteva.
    const body = await request.json();
    const { name, email, phone, status } = body;

    // Proveravamo obavezna polja.
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone are required." },
        { status: 400 }
      );
    }

    // Kreiramo novog klijenta u bazi.
    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone,
        status: status ? (status as ClientStatus) : ClientStatus.ACTIVE,
      },
    });

    // Vraćamo uspešan odgovor sa kreiranim klijentom.
    return NextResponse.json(
      {
        success: true,
        message: "Client created successfully.",
        data: client,
      },
      { status: 201 }
    );
  } catch {
    // Vraćamo generičku grešku ako nešto pođe po zlu.
    return NextResponse.json(
      { success: false, message: "Failed to create client." },
      { status: 500 }
    );
  }
}