import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { managerListSellersWithCounts } from "@/src/server/services/managerService";

export const runtime = "nodejs";

// SK8 Pregled prodavaca i broja njihovih dealova (Menadzer).
export async function GET() {
  try {
    const result = await managerListSellersWithCounts();
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
