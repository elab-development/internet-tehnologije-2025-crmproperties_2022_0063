// src/app/pages/manager/seller-metrics/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import type { ApiOk } from "@/src/client/types/apiOk";
import type { ApiFail } from "@/src/client/types/apiFail";

import type { SellerRow } from "@/src/client/types/sellerRow";
import type { SellersResponse } from "@/src/client/types/sellersResponse";

type SellerMetrics = {
  totalDeals: number;
  closedDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalExpectedValue: number;
  wonValue: number;
};

type SellerMetricsResponse = {
  metrics: SellerMetrics | null;
  message?: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  const text = await res.text();
  const json = (text ? (JSON.parse(text) as ApiOk<T> | ApiFail) : null) as ApiOk<T> | ApiFail | null;

  if (!json) throw new Error(`Request failed (${res.status}).`);
  if (!json.ok) throw new Error(json.message || "Something went wrong.");

  return (json as ApiOk<T>).data;
}

function formatMoney(v: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function tooltipStyle() {
  return {
    background: "rgba(15,16,32,0.95)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    color: "white",
    fontSize: 12,
  } as const;
}

export default function ManagerSellerMetricsPage() {
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);

  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);

  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metrics, setMetrics] = useState<SellerMetrics | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setError(null);
        setLoadingSellers(true);

        const data = await fetchJson<SellersResponse>("/api/manager/sellers");
        if (!alive) return;

        setSellers(data.sellers);

        if (data.sellers.length > 0) {
          setSelectedSellerId((prev) => (prev ? prev : data.sellers[0].id));
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load sellers.");
      } finally {
        if (!alive) return;
        setLoadingSellers(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  async function loadMetrics() {
    if (!selectedSellerId) return;

    try {
      setError(null);
      setMessage(null);
      setLoadingMetrics(true);

      const data = await fetchJson<SellerMetricsResponse>(`/api/manager/sellers/${selectedSellerId}/metrics`);

      setMetrics(data.metrics);
      setMessage(data.metrics ? null : data.message || "No metrics available.");
    } catch (e: any) {
      setError(e?.message || "Failed to load metrics.");
      setMetrics(null);
      setMessage(null);
    } finally {
      setLoadingMetrics(false);
    }
  }

  useEffect(() => {
    if (!selectedSellerId) return;
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSellerId]);

  const selectedSeller = useMemo(
    () => sellers.find((s) => s.id === selectedSellerId) || null,
    [sellers, selectedSellerId],
  );

  const openDeals = useMemo(() => {
    if (!metrics) return 0;
    return Math.max(0, metrics.totalDeals - metrics.closedDeals);
  }, [metrics]);

  const stageBars = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Total", value: metrics.totalDeals },
      { name: "Open", value: openDeals },
      { name: "Closed", value: metrics.closedDeals },
      { name: "Won", value: metrics.wonDeals },
      { name: "Lost", value: metrics.lostDeals },
    ];
  }, [metrics, openDeals]);

  const valueBars = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Expected (all)", value: metrics.totalExpectedValue },
      { name: "Won value", value: metrics.wonValue },
    ];
  }, [metrics]);

  const pieData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Won", value: metrics.wonDeals },
      { name: "Lost", value: metrics.lostDeals },
      { name: "Open", value: openDeals },
    ];
  }, [metrics, openDeals]);

  const ttStyle = tooltipStyle();

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-black via-[#0b0b10] to-[#0f1020]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
          <header className="flex flex-col gap-5 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Seller Metrics</h1>
              <p className="mt-1 text-sm text-white/70">
                General metrics from{" "}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-[260px]">
                <label className={labelClass}>Seller</label>
                <select
                  className={inputClass}
                  value={selectedSellerId ?? ""}
                  onChange={(e) => setSelectedSellerId(e.target.value ? Number(e.target.value) : null)}
                  disabled={loadingSellers}
                >
                  {loadingSellers && <option value="">Loading sellers…</option>}
                  {!loadingSellers && sellers.length === 0 && <option value="">No sellers found</option>}
                  {!loadingSellers &&
                    sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                </select>
              </div>

              <button className={ghostBtn} onClick={loadMetrics} disabled={!selectedSellerId || loadingMetrics}>
                {loadingMetrics ? "Loading…" : "Refresh"}
              </button>
            </div>
          </header>

          <div className="p-6">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className={panel}>
                <div className="text-sm text-white/70">Selected seller</div>
                <div className="mt-2 text-lg font-semibold">{selectedSeller ? selectedSeller.name : "—"}</div>
                <div className="mt-1 text-sm text-white/60">
                  {selectedSeller ? selectedSeller.email : "Pick a seller to load data."}
                </div>
              </div>

              <div className={panel}>
                <div className="text-sm text-white/70">Scope</div>
                <div className="mt-2 text-lg font-semibold">All-time (no filters)</div>
                <div className="mt-1 text-sm text-white/60">No closeDate / period filtering applied.</div>
              </div>

              <div className={panel}>
                <div className="text-sm text-white/70">Quick totals</div>

                {metrics ? (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <StatBox label="Total" value={metrics.totalDeals} />
                    <StatBox label="Open" value={openDeals} />
                    <StatBox label="Closed" value={metrics.closedDeals} />
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-white/70">
                    {loadingMetrics ? "Loading metrics…" : message || "No metrics loaded."}
                  </div>
                )}
              </div>
            </section>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {!error && !metrics && message && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                {message}
              </div>
            )}

            {metrics && (
              <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className={panel}>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Deal counts</h2>
                    <p className="mt-1 text-sm text-white/70">Total vs open/closed vs outcome.</p>
                  </div>

                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stageBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                        <XAxis
                          dataKey="name"
                          stroke="rgba(255,255,255,0.6)"
                          tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.6)"
                          tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={ttStyle}
                          itemStyle={{ color: "white" }}
                          labelStyle={{ color: "white" }}
                          cursor={{ fill: "rgba(255,255,255,0.06)" }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="rgba(168,85,247,0.65)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={panel}>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Pipeline composition</h2>
                    <p className="mt-1 text-sm text-white/70">Won vs lost vs still open.</p>
                  </div>

                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={ttStyle}
                          itemStyle={{ color: "white" }}
                          labelStyle={{ color: "white" }}
                        />
                        <Legend wrapperStyle={{ color: "rgba(255,255,255,0.75)" }} />
                        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} innerRadius={55} paddingAngle={2}>
                          {pieData.map((_, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                              stroke="rgba(255,255,255,0.12)"
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={panel + " lg:col-span-2"}>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Value (EUR)</h2>
                      <p className="mt-1 text-sm text-white/70">Expected value vs realized (won) value.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Pill label="Expected" value={formatMoney(metrics.totalExpectedValue)} />
                      <Pill label="Won" value={formatMoney(metrics.wonValue)} />
                    </div>
                  </div>

                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={valueBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                        <XAxis
                          dataKey="name"
                          stroke="rgba(255,255,255,0.6)"
                          tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.6)"
                          tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                          tickFormatter={(v) => (typeof v === "number" ? `${Math.round(v / 1000)}k` : String(v))}
                        />
                        <Tooltip
                          formatter={(val: any) => formatMoney(Number(val))}
                          contentStyle={ttStyle}
                          itemStyle={{ color: "white" }}
                          labelStyle={{ color: "white" }}
                          cursor={{ fill: "rgba(255,255,255,0.06)" }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="rgba(255,255,255,0.18)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
      <span className="text-white/70">{label}:</span> <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

const panel = "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/25";

const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/60 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20";

const ghostBtn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60";

const PIE_COLORS = [
  "rgba(34,197,94,0.70)", // won
  "rgba(239,68,68,0.70)", // lost
  "rgba(168,85,247,0.70)", // open
];