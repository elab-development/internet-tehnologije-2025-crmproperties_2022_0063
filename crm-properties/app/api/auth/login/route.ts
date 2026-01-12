import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { loginUser } from "@/src/server/services/authService";

export const runtime = "nodejs";

// SK2 Prijava korisnika.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await loginUser(body);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
