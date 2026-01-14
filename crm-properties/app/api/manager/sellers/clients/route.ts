// src/app/api/manager/sellers/clients/route.ts

import { ok, fail, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { managerListSellerClients } from "@/src/server/services/managerService";

export const runtime = "nodejs";

// SK? Pregled klijenata izabranog prodavca (Menadzer).
export async function GET(req: Request) {
  try {
    // Uzimamo sellerId iz query parametra.
    const url = new URL(req.url);
    const raw = url.searchParams.get("sellerId");
    const sellerId = Number(raw);

    if (!Number.isInteger(sellerId) || sellerId <= 0) {
      return fail("sellerId query param is required.", 400);
    }

    const result = await managerListSellerClients(sellerId);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
