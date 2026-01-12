import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { managerFilterDeals } from "@/src/server/services/managerService";

export const runtime = "nodejs";

// SK9 Filtriranje dealova (Menadzer).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await managerFilterDeals(body);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
