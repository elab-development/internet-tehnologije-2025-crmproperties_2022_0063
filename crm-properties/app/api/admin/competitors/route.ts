// src/app/api/admin/competitors/route.ts
import { ok, failFromError } from "@/src/server/http/response";
import { requireAuth } from "@/src/server/auth/requireAuth";
import { requireRole } from "@/src/server/auth/requireRole";

import type { CompetitorsResponse } from "@/src/client/types/competitorsResponse";
import type { CompetitorStock } from "@/src/client/types/competitorStock";

type Competitor = { symbol: string; name: string };

const COMPETITORS: Competitor[] = [
  { symbol: "CBRE", name: "CBRE Group" },
  { symbol: "JLL", name: "Jones Lang LaSalle" },
  { symbol: "RMAX", name: "RE/MAX Holdings" },
  { symbol: "RDFN", name: "Redfin" },
  { symbol: "Z", name: "Zillow Group" },
];

function num(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : 0;
}

function picsumFor(symbol: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(symbol)}/640/360`;
}

function findCompetitor(symbol: string): Competitor | null {
  const s = symbol.toUpperCase().trim();
  return COMPETITORS.find((c) => c.symbol === s) || null;
}

/**
 * APILayer exchangeratesapi (exchangeratesapi.io).
 * Env:
 * - EXCHANGERATES_API_KEY
 *
 * We try:
 *  1) base=USD&symbols=EUR
 *  2) fallback EUR-base => USD->EUR = 1 / rates.USD
 */
async function getFxRateUsdTo(to: "USD" | "EUR"): Promise<{ rate: number; note?: string }> {
  if (to === "USD") return { rate: 1 };

  const key = process.env.EXCHANGERATES_API_KEY;
  if (!key) return { rate: 1, note: "Missing EXCHANGERATES_API_KEY. Using 1:1 fallback." };

  const baseUrl = "https://api.exchangeratesapi.io/v1/latest";

  // Attempt #1: base USD.
  {
    const url =
      `${baseUrl}?access_key=${encodeURIComponent(key)}` +
      `&base=USD&symbols=EUR`;

    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as any;
      const rate = num(json?.rates?.EUR);
      if (rate) return { rate };
    }
  }

  // Attempt #2: default base (EUR).
  {
    const url = `${baseUrl}?access_key=${encodeURIComponent(key)}&symbols=USD,EUR`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return { rate: 1, note: `FX request failed (${res.status}). Using 1:1 fallback.` };
    }

    const json = (await res.json()) as any;
    const eurRate = num(json?.rates?.EUR) || 1;
    const usdPerEur = num(json?.rates?.USD);

    if (!usdPerEur) return { rate: 1, note: "FX rates missing (USD). Using 1:1 fallback." };

    const usdPerEurNormalized = usdPerEur / eurRate;
    const usdToEur = 1 / usdPerEurNormalized;

    if (!Number.isFinite(usdToEur) || usdToEur <= 0) {
      return { rate: 1, note: "FX conversion invalid. Using 1:1 fallback." };
    }

    return { rate: usdToEur, note: "FX base=USD not available; used EUR-base fallback." };
  }
}

async function fetchGlobalQuote(symbol: string, apiKey: string) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
    symbol,
  )}&apikey=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Alpha Vantage failed for ${symbol} (${res.status}).`);

  return (await res.json()) as any;
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    requireRole(session.role, ["admin"]);

    const { searchParams } = new URL(req.url);

    const to = (searchParams.get("currency")?.toUpperCase() === "EUR" ? "EUR" : "USD") as "USD" | "EUR";

    // If fxOnly=1 => only return fxRate quickly (items: []).
    const fxOnly = searchParams.get("fxOnly") === "1";

    // If fxRate is provided by client, use it and skip FX call.
    const fxRateParam = num(searchParams.get("fxRate"));
    const hasClientFxRate = fxRateParam > 0;

    const fx = hasClientFxRate ? { rate: fxRateParam } : await getFxRateUsdTo(to);
    const fxRate = fx.rate;

    if (fxOnly) {
      const payload: CompetitorsResponse = {
        baseCurrency: "USD",
        convertedTo: to,
        fxRate,
        items: [],
        note: fx.note,
      };
      return ok(payload);
    }

    const alphaKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!alphaKey) {
      const payload: CompetitorsResponse = {
        baseCurrency: "USD",
        convertedTo: to,
        fxRate,
        items: [],
        note: "Missing ALPHA_VANTAGE_API_KEY in environment variables.",
      };
      return ok(payload);
    }

    // If symbol=... => return single competitor item.
    const symbol = searchParams.get("symbol");
    if (symbol) {
      const comp = findCompetitor(symbol);
      if (!comp) {
        const payload: CompetitorsResponse = {
          baseCurrency: "USD",
          convertedTo: to,
          fxRate,
          items: [],
          note: `Unknown symbol: ${symbol}.`,
        };
        return ok(payload);
      }

      const raw = await fetchGlobalQuote(comp.symbol, alphaKey);
      const q = raw?.["Global Quote"] || {};

      const priceUsd = num(q?.["05. price"]);
      const changePercentRaw = String(q?.["10. change percent"] || "").replace("%", "");
      const changePercent = changePercentRaw ? num(changePercentRaw) : null;
      const latestTradingDay = (q?.["07. latest trading day"] as string | undefined) || null;

      const item: CompetitorStock = {
        symbol: comp.symbol,
        name: comp.name,
        currency: "USD",
        priceUsd,
        priceConverted: priceUsd * fxRate,
        convertedTo: to,
        changePercent,
        updatedAt: latestTradingDay,
        imageUrl: picsumFor(comp.symbol),
      };

      const payload: CompetitorsResponse = {
        baseCurrency: "USD",
        convertedTo: to,
        fxRate,
        items: [item],
        note: fx.note,
      };

      return ok(payload);
    }

    // If no symbol => return competitor list “empty quotes” quickly for UI layout.
    // Frontend will call per-symbol requests afterwards.
    const items: CompetitorStock[] = COMPETITORS.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      currency: "USD",
      priceUsd: 0,
      priceConverted: 0,
      convertedTo: to,
      changePercent: null,
      updatedAt: null,
      imageUrl: picsumFor(c.symbol),
    }));

    const payload: CompetitorsResponse = {
      baseCurrency: "USD",
      convertedTo: to,
      fxRate,
      items,
      note: fx.note,
    };

    return ok(payload);
  } catch (e) {
    return failFromError(e);
  }
}