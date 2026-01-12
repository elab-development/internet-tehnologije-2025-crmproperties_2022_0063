import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { adminListUsers } from "@/src/server/services/adminUserService";

export const runtime = "nodejs";

// SK4 Pregled svih korisnika i njihovih uloga (Administrator).
export async function GET() {
  try {
    const result = await adminListUsers();
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
