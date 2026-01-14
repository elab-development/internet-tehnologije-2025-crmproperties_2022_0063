// src/app/api/seller/properties/route.ts
import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { sellerListProperties } from "@/src/server/services/sellerService";

export const runtime = "nodejs";

// GET = lista nekretnina za combo box.
export async function GET() {
  try {
    const result = await sellerListProperties();
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
