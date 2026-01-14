// src/app/pages/manager/manager-seller/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { ApiOk } from "@/src/client/types/apiOk";
import type { ApiFail } from "@/src/client/types/apiFail";

// Tipovi lokalno, da logika ostane jednostavna.
import type { SellerRow } from "@/src/client/types/sellerRow";

import type { SellersResponse } from "@/src/client/types/sellersResponse";

import type { ClientRow } from "@/src/client/types/clientRow";

type SellersClientsResponse = {
  seller: { id: number; name: string; email: string };
  clients: ClientRow[];
};

// Pomocni fetch koji ne puca ako response nema JSON body.
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

export default function ManagerSellerPage() {
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);

  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [selectedSellerMeta, setSelectedSellerMeta] = useState<{ id: number; name: string; email: string } | null>(null);

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [sellerSearch, setSellerSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const [error, setError] = useState<string | null>(null);

  // Edit forma.
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cCity, setCCity] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredSellers = useMemo(() => {
    const q = sellerSearch.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }, [sellers, sellerSearch]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const name = c.name.toLowerCase();
      const email = (c.email || "").toLowerCase();
      const city = (c.city || "").toLowerCase();
      return name.includes(q) || email.includes(q) || city.includes(q);
    });
  }, [clients, clientSearch]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  async function loadSellers() {
    setError(null);
    setLoadingSellers(true);
    try {
      const data = await fetchJson<SellersResponse>("/api/manager/sellers", { method: "GET" });
      setSellers(data.sellers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sellers.");
    } finally {
      setLoadingSellers(false);
    }
  }

  async function loadClientsForSeller(sellerId: number) {
    setError(null);
    setLoadingClients(true);
    setSelectedClientId(null);

    try {
      // Vazno: sellerId ide kao query param, ne kao /clients/1.
      const data = await fetchJson<SellersClientsResponse>(`/api/manager/sellers/clients?sellerId=${sellerId}`, {
        method: "GET",
      });

      setSelectedSellerMeta(data.seller);
      setClients(data.clients);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load clients.");
      setClients([]);
      setSelectedSellerMeta(null);
    } finally {
      setLoadingClients(false);
    }
  }

  useEffect(() => {
    // Ucitavamo prodavce na mount.
    loadSellers();
  }, []);

  useEffect(() => {
    // Kad izaberemo klijenta, popunjavamo formu.
    if (!selectedClient) {
      setCName("");
      setCEmail("");
      setCPhone("");
      setCCity("");
      return;
    }

    setCName(selectedClient.name || "");
    setCEmail(selectedClient.email || "");
    setCPhone(selectedClient.phone || "");
    setCCity(selectedClient.city || "");
  }, [selectedClient]);

  async function onSelectSeller(id: number) {
    setSelectedSellerId(id);
    await loadClientsForSeller(id);
  }

  async function onSaveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;

    setError(null);
    setSaving(true);

    try {
      // Menjamo klijenta preko manager rute.
      await fetchJson(`/api/manager/sellers/clients/${selectedClient.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: cName,
          email: cEmail || null,
          phone: cPhone || null,
          city: cCity || null,
        }),
      });

      // Reload liste klijenata da UI ostane uskladjen.
      if (selectedSellerId) {
        await loadClientsForSeller(selectedSellerId);
        setSelectedClientId(selectedClient.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update client.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-black via-[#0b0b10] to-[#0f1020]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
          {/* Header */}
          <header className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Manager · Sellers</h1>
              <p className="mt-1 text-sm text-white/80">Select a seller and manage their clients.</p>
            </div>

            <button onClick={loadSellers} disabled={loadingSellers} className={ghostBtn}>
              {loadingSellers ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          <div className="p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Sellers */}
              <section className={panel}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Sellers</h2>
                  <input
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    placeholder="Search sellers..."
                    className={inputClass}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {filteredSellers.length === 0 ? (
                    <div className={emptyBox}>{loadingSellers ? "Loading..." : "No sellers found."}</div>
                  ) : (
                    filteredSellers.map((s) => {
                      const active = s.id === selectedSellerId;
                      return (
                        <button
                          key={s.id}
                          onClick={() => onSelectSeller(s.id)}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-left transition",
                            active ? "border-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5 hover:bg-white/10",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-semibold text-white">{s.name}</div>
                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                              Active: {s.activeDeals} · Closed: {s.closedDeals}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-white/80">{s.email}</div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Clients */}
              <section className={panel}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Clients</h2>
                    <p className="mt-1 text-sm text-white/80">
                      {selectedSellerMeta ? (
                        <>
                          Seller: <span className="font-semibold text-white">{selectedSellerMeta.name}</span>{" "}
                          <span className="text-white/80">({selectedSellerMeta.email})</span>
                        </>
                      ) : (
                        "Select a seller to load clients."
                      )}
                    </p>
                  </div>

                  {selectedSellerId ? (
                    <button onClick={() => loadClientsForSeller(selectedSellerId)} disabled={loadingClients} className={ghostBtn}>
                      {loadingClients ? "Loading..." : "Reload"}
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  {/* List */}
                  <div className="space-y-3">
                    <input
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search clients..."
                      className={inputClass}
                      disabled={!selectedSellerId}
                    />

                    <div className="space-y-2">
                      {!selectedSellerId ? (
                        <div className={emptyBox}>Pick a seller to see clients.</div>
                      ) : filteredClients.length === 0 ? (
                        <div className={emptyBox}>{loadingClients ? "Loading..." : "No clients found."}</div>
                      ) : (
                        filteredClients.map((c) => {
                          const active = c.id === selectedClientId;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setSelectedClientId(c.id)}
                              className={[
                                "w-full rounded-2xl border px-4 py-3 text-left transition",
                                active ? "border-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5 hover:bg-white/10",
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold text-white">{c.name}</div>
                                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                                  Deals: {c.dealsCount}
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-white/80">
                                {c.city || "—"} · Active: {c.activeDealsCount} · Closed: {c.closedDealsCount}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="space-y-3">
                    {!selectedClient ? (
                      <div className={emptyBox}>Select a client to edit details.</div>
                    ) : (
                      <form onSubmit={onSaveClient} className="space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="font-semibold text-white">Edit client</div>
                          <div className="mt-1 text-xs text-white/80">Saved via PATCH.</div>

                          <div className="mt-4 space-y-3">
                            <input value={cName} onChange={(e) => setCName(e.target.value)} className={inputClass} placeholder="Name" required />
                            <input value={cEmail} onChange={(e) => setCEmail(e.target.value)} className={inputClass} placeholder="Email (optional)" />
                            <input value={cPhone} onChange={(e) => setCPhone(e.target.value)} className={inputClass} placeholder="Phone (optional)" />
                            <input value={cCity} onChange={(e) => setCCity(e.target.value)} className={inputClass} placeholder="City (optional)" />

                            <button type="submit" disabled={saving} className={primaryBtn}>
                              {saving ? "Saving..." : "Save changes"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const panel = "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/25";

const emptyBox = "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/60 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20";

const primaryBtn =
  "w-full rounded-2xl bg-white/10 px-4 py-3 border-white text-sm font-semibold text-white shadow-lg  transition hover:brightness-110 disabled:opacity-60";

const ghostBtn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60";
