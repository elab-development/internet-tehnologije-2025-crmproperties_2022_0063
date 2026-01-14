import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { sellerCreateDeal, sellerListDeals } from "@/src/server/services/sellerService";

export const runtime = "nodejs";

// GET = lista dealova (potrebno za Manage Deals).
export async function GET() {
  try {
    const result = await sellerListDeals();
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}

// SK15 Kreiranje novog deala (Prodavac).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await sellerCreateDeal(body);
    return ok(result, 201);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
