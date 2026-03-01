// src/app/pages/admin/concurrents/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { ApiOk } from "@/src/client/types/apiOk";
import type { ApiFail } from "@/src/client/types/apiFail";
import type { CompetitorsResponse } from "@/src/client/types/competitorsResponse";
import type { CompetitorStock } from "@/src/client/types/competitorStock";

type Currency = "USD" | "EUR";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  if (res.status === 401) {
    throw Object.assign(new Error("UNAUTHORIZED"), { code: 401 });
  }

  const text = await res.text();
  const json = (text ? (JSON.parse(text) as ApiOk<T> | ApiFail) : null) as ApiOk<T> | ApiFail | null;

  if (!json) throw new Error(`Request failed (${res.status}).`);
  if (!json.ok) throw new Error(json.message || "Something went wrong.");

  return (json as ApiOk<T>).data;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatMoney(v: number, currency: Currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(v || 0);
}

function pillChangeClass(p?: number | null) {
  if (!p && p !== 0) return "bg-white/5 border-white/10 text-white/70";
  return p >= 0
    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
    : "bg-red-500/10 border-red-500/30 text-red-200";
}

function mergeNote(prev: string | null, next?: string) {
  // ✅ Always return string|null (never undefined) to satisfy TS.
  if (prev) return prev;
  return next ?? null;
}

export default function AdminConcurrentsPage() {
  const router = useRouter();

  const [currency, setCurrency] = useState<Currency>("EUR");

  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const [note, setNote] = useState<string | null>(null);
  const [fxRate, setFxRate] = useState<number>(1);

  const [items, setItems] = useState<CompetitorStock[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cancelRef = useRef(false);

  const totals = useMemo(() => {
    const sumConverted = items.reduce((acc, x) => acc + (x.priceConverted || 0), 0);
    const loadedCount = items.filter((x) => x.priceUsd > 0 || x.updatedAt).length;
    return { sumConverted, loadedCount, total: items.length };
  }, [items]);

  async function loadBase() {
    setLoadingBase(true);
    try {
      setError(null);
      setNote(null);

      // 1) Get FX only.
      const fx = await fetchJson<CompetitorsResponse>(`/api/admin/competitors?currency=${currency}&fxOnly=1`);
      setFxRate(fx.fxRate);
      if (fx.note) setNote(fx.note);

      // 2) Get base list (placeholder cards).
      const base = await fetchJson<CompetitorsResponse>(
        `/api/admin/competitors?currency=${currency}&fxRate=${fx.fxRate}`,
      );

      setItems(base.items);

      // ✅ Fix #1: make sure setter never returns undefined.
      if (base.note) setNote((prev) => mergeNote(prev, base.note));
    } catch (e: any) {
      if (e?.code === 401 || e?.message === "UNAUTHORIZED") {
        router.push("/pages/auth");
        return;
      }
      setError(e?.message || "Failed to load base competitors.");
      setItems([]);
    } finally {
      setLoadingBase(false);
    }
  }

  async function loadQuotesSlowly() {
    if (items.length === 0) return;

    cancelRef.current = false;
    setLoadingQuotes(true);

    try {
      for (const x of items) {
        if (cancelRef.current) break;

        const qs = new URLSearchParams({
          currency,
          symbol: x.symbol,
          fxRate: String(fxRate),
        });

        const resp = await fetchJson<CompetitorsResponse>(`/api/admin/competitors?${qs.toString()}`);
        const one = resp.items[0];

        // ✅ Fix #2: make sure setter never returns undefined.
        if (resp.note) setNote((prev) => mergeNote(prev, resp.note));

        if (one) {
          setItems((prev) => prev.map((p) => (p.symbol === one.symbol ? one : p)));
        }

        await sleep(1400);
      }
    } catch (e: any) {
      if (e?.code === 401 || e?.message === "UNAUTHORIZED") {
        router.push("/pages/auth");
        return;
      }
      setError(e?.message || "Failed to load quotes.");
    } finally {
      setLoadingQuotes(false);
    }
  }

  async function refreshAll() {
    cancelRef.current = true;
    await loadBase();
    await loadQuotesSlowly();
  }

  useEffect(() => {
    (async () => {
      await refreshAll();
    })();

    return () => {
      cancelRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-black via-[#0b0b10] to-[#0f1020]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
          <header className="flex flex-col gap-5 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Concurrents</h1>
              <p className="mt-1 text-sm text-white/70">Multiple requests loading. FX once, then per-ticker quotes.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-[180px]">
                <label className={labelClass}>Currency</label>
                <select
                  className={inputClass}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  disabled={loadingBase || loadingQuotes}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <button className={ghostBtn} onClick={refreshAll} disabled={loadingBase || loadingQuotes}>
                {loadingBase || loadingQuotes ? "Loading…" : "Refresh"}
              </button>
            </div>
          </header>

          <div className="p-6">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoCard title="Scope" value="Competitor watchlist" hint="Quotes load gradually, one ticker per request." />
              <InfoCard title="FX rate" value={`1 USD = ${fxRate.toFixed(4)} ${currency}`} hint="Fetched once per refresh." />
              <InfoCard
                title="Progress"
                value={`${totals.loadedCount}/${totals.total}`}
                hint={`Total value (shown): ${formatMoney(totals.sumConverted, currency)}`}
              />
            </section>

            {note && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                {note}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((x) => (
                <CompetitorCard
                  key={x.symbol}
                  item={x}
                  currency={currency}
                  loading={loadingQuotes && (!x.updatedAt && x.priceUsd === 0)}
                />
              ))}
            </section>

            {!loadingBase && !error && items.length === 0 && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                No competitors returned. Check API keys / rate limits.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className={panel}>
      <div className="text-sm text-white/70">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
      <div className="mt-1 text-sm text-white/60">{hint}</div>
    </div>
  );
}

function CompetitorCard({
  item,
  currency,
  loading,
}: {
  item: CompetitorStock;
  currency: Currency;
  loading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/25">
      <div className="relative">
        <img src={item.imageUrl} alt={item.name} className="h-40 w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="text-sm text-white/70">{item.symbol}</div>
          <div className="text-lg font-semibold">{item.name}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Price ({currency})</div>

            <div className="mt-1 text-lg font-semibold">{loading ? "Loading…" : formatMoney(item.priceConverted, currency)}</div>

            <div className="mt-1 text-xs text-white/60">USD base: {loading ? "—" : formatMoney(item.priceUsd, "USD")}</div>
          </div>

          <div className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${pillChangeClass(item.changePercent)}`}>
            {loading
              ? "…"
              : item.changePercent === null || item.changePercent === undefined
                ? "—"
                : `${item.changePercent.toFixed(2)}%`}
          </div>
        </div>

        <div className="mt-3 text-xs text-white/60">
          Updated: <span className="text-white/80">{loading ? "—" : item.updatedAt || "—"}</span>
        </div>
      </div>
    </div>
  );
}

const panel = "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/25";

const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/60 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20";

const ghostBtn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60";