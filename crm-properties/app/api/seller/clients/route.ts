// src/app/api/seller/clients/route.ts
import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { sellerListClients } from "@/src/server/services/sellerService";

export const runtime = "nodejs";

// GET = lista klijenata za combo box.
export async function GET() {
  try {
    const result = await sellerListClients();
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
