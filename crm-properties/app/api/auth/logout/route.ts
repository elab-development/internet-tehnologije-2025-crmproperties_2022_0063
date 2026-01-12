import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { logoutUser } from "@/src/server/services/authService";

export const runtime = "nodejs";

// SK3 Logout korisnika.
export async function POST() {
  try {
    const result = await logoutUser();
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
