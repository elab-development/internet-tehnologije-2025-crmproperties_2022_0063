import { NextResponse } from "next/server";
import { normalizeError } from "@/src/server/http/errors";
import { failFromError } from "@/src/server/http/response";
import { managerExportSellerReportCsv } from "@/src/server/services/managerService";

export const runtime = "nodejs";

async function getId(params: any): Promise<number> {
  const p = params && typeof params.then === "function" ? await params : params;
  const raw = p?.id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : NaN;
}

// SK11 Eksport ucinka prodavca (CSV).
export async function GET(req: Request, ctx: { params: any }) {
  try {
    const id = await getId(ctx.params);
    if (!Number.isFinite(id)) {
      return new NextResponse("Invalid ID.", { status: 400 });
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;

    const file = await managerExportSellerReportCsv(id, from, to);

    return new NextResponse(file.content, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });
  } catch (e) {
    return failFromError(normalizeError(e));
  }
}
