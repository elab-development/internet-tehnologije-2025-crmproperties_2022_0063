import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { sellerCreateClient, sellerListMyClients } from "@/src/server/services/sellerService";

export const runtime = "nodejs";

// SK12 Pregled sopstvenih klijenata (Prodavac).
export async function GET() {
  try {
    const result = await sellerListMyClients();
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}

// SK13 Dodavanje novog klijenta (Prodavac).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await sellerCreateClient(body);
    return ok(result, 201);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
