import { ok, fail, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { managerGetSellerMetrics } from "@/src/server/services/managerService";

export const runtime = "nodejs";

async function getId(params: any): Promise<number> {
  const p = params && typeof params.then === "function" ? await params : params;
  const raw = p?.id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : NaN;
}

// SK10 Metrike prodaje po prodavcu (query: ?from=...&to=...).
export async function GET(req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const url = new URL(req.url);
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;

    const result = await managerGetSellerMetrics(id, from, to);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
