import { NextResponse } from "next/server";
import { normalizeError } from "@/src/server/http/errors";
import { failFromError } from "@/src/server/http/response";
import { adminExportGlobalMetricsCsv } from "@/src/server/services/metricsService";

export const runtime = "nodejs";

// SK7 Eksport metrika (CSV).
export async function GET() {
  try {
    const file = await adminExportGlobalMetricsCsv();

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
