import { ok, fail, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { adminDeleteUser, adminUpdateUser } from "@/src/server/services/adminUserService";

export const runtime = "nodejs";

// Pomocna funkcija za parsiranje ID-a iz parametara.
// U nekim Next verzijama params moze biti Promise, zato radimo await ako treba.
async function getId(params: any): Promise<number> {
  const p = params && typeof params.then === "function" ? await params : params;
  const raw = p?.id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : NaN;
}

// PUT = azuriraj sve (u praksi ocekujemo kompletan objekat).
export async function PUT(req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const body = await req.json();

    // Za pocetnike: minimalno trazimo name, email i role za PUT.
    if (!body?.name || !body?.email || !body?.role) {
      return fail("PUT requires name, email and role.", 400);
    }

    const result = await adminUpdateUser(id, body);
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
    const result = await adminUpdateUser(id, body);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}

// DELETE = brisanje korisnika.
export async function DELETE(_req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const result = await adminDeleteUser(id);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
