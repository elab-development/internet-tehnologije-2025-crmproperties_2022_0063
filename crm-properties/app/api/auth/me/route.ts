// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/src/server/db/prisma";
import { requireAuth } from "@/src/server/auth/requireAuth";

export async function GET() {
  try {
    // Proveravamo da li postoji sesija i osvezavamo cookie (sliding session).
    const payload = await requireAuth();

    // Citanje korisnika iz baze (role uzimamo iz baze, to je najpouzdanije).
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, data: { user } }, { status: 200 });
  } catch (err) {
    const status = err instanceof Error && (err as any).status ? (err as any).status : 401;
    return NextResponse.json({ ok: false, message: "UNAUTHORIZED" }, { status });
  }
}
