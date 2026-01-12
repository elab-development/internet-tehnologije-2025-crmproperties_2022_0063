import { ok, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { adminGetGlobalMetrics } from "@/src/server/services/metricsService";

export const runtime = "nodejs";

// SK6 Pregled globalnih metrika (Administrator).
export async function GET() {
  try {
    const result = await adminGetGlobalMetrics();
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
