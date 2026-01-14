// src/app/api/manager/sellers/clients/[id]/route.ts

import { ok, fail, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { managerGetClient, managerUpdateClient } from "@/src/server/services/managerService";

export const runtime = "nodejs";

async function getId(params: any): Promise<number> {
  const p = params && typeof params.then === "function" ? await params : params;
  const raw = p?.id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : NaN;
}

// GET = pregled jednog klijenta (Menadzer).
export async function GET(_req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const result = await managerGetClient(id);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}

// PUT = azuriraj sve podatke klijenta.
export async function PUT(req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const body = await req.json();
    if (!body?.name) return fail("PUT requires client name.", 400);

    const result = await managerUpdateClient(id, body);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}

// PATCH = azuriraj samo prosledjena polja.
export async function PATCH(req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const body = await req.json();
    const result = await managerUpdateClient(id, body);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
