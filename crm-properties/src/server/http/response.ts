// src/server/http/response.ts

import { NextResponse } from "next/server";

// Standardan JSON odgovor za uspeh.
export function ok(data: unknown, status = 200) {
  return NextResponse.json(
    { ok: true, data },
    { status }
  );
}

// Standardan JSON odgovor za gresku.
export function fail(message: string, status = 400) {
  return NextResponse.json(
    { ok: false, message },
    { status }
  );
}

// Pomocna funkcija koja iz normalizeError uzima status + poruku.
// Korisno u route.ts fajlovima.
export function failFromError(e: unknown) {
  const status =
    typeof e === "object" && e !== null && "status" in e && typeof (e as any).status === "number"
      ? (e as any).status
      : 500;

  const message = e instanceof Error ? e.message : "Server error.";

  return fail(message, status);
}
