// src/server/services/metricsService.ts

import { prisma } from "../db/prisma";
import { requireAuth } from "../auth/requireAuth";
import { requireRole } from "../auth/requireRole";
import { httpError } from "../http/errors";

// SK6 Pregled globalnih metrika (Administrator).
export async function adminGetGlobalMetrics() {
  const session = await requireAuth();
  requireRole(session.role, ["admin"]);

  try {
    const [users, clients, properties, deals, activities] = await Promise.all([
      prisma.user.count(),
      prisma.client.count(),
      prisma.property.count(),
      prisma.deal.count(),
      prisma.activity.count(),
    ]);

    const openDeals = await prisma.deal.count({ where: { closeDate: null } });
    const closedDeals = deals - openDeals;

    return {
      metrics: {
        users,
        clients,
        properties,
        deals,
        openDeals,
        closedDeals,
        activities,
      },
    };
  } catch {
    throw httpError(500, "Metrics are not available.");
  }
}

// SK7 Eksport metrika (Administrator) - CSV format (najlakse za pocetnike).
export async function adminExportGlobalMetricsCsv() {
  const { metrics } = await adminGetGlobalMetrics();

  const csv =
    "metric,value\n" +
    Object.entries(metrics)
      .map(([k, v]) => `${k},${v}`)
      .join("\n") +
    "\n";

  return {
    filename: "global-metrics.csv",
    contentType: "text/csv",
    content: csv,
  };
}
