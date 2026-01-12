import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { registerUser } from "@/src/server/services/authService";

export const runtime = "nodejs";

// SK1 Registracija korisnika.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await registerUser(body);
    return ok(result, 201);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
