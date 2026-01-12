import { ok, fail, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { sellerUpdateDealStage } from "@/src/server/services/sellerService";

export const runtime = "nodejs";

async function getId(params: any): Promise<number> {
  const p = params && typeof params.then === "function" ? await params : params;
  const raw = p?.id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : NaN;
}

// PATCH = menjamo samo stage (SK16).
export async function PATCH(req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const body = await req.json();
    const result = await sellerUpdateDealStage(id, body);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
