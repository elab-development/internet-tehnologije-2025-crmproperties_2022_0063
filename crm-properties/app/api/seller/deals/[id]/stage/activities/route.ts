import { ok, fail, failFromError } from "@/src/server/http/response";
import { normalizeError } from "@/src/server/http/errors";
import { sellerAddActivity, sellerListActivities } from "@/src/server/services/sellerService";

export const runtime = "nodejs";

async function getId(params: any): Promise<number> {
  const p = params && typeof params.then === "function" ? await params : params;
  const raw = p?.id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : NaN;
}

// GET = pregled aktivnosti na dealu (SK17).
export async function GET(_req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const result = await sellerListActivities(id);
    return ok(result);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}

// POST = dodavanje aktivnosti (SK17).
export async function POST(req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) return fail("Invalid ID.", 400);

    const body = await req.json();
    const result = await sellerAddActivity(id, body);
    return ok(result, 201);
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
