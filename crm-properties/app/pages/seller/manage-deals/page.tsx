// src/app/pages/seller/manage-deals/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { ApiOk } from "@/src/client/types/apiOk";
import type { ApiFail } from "@/src/client/types/apiFail";

import type { Deal } from "@/src/client/types/deal";
import type { Activity } from "@/src/client/types/activity";
import type { SellerDealsResponse } from "@/src/client/types/sellerDealsResponse";
import type { SellerActivitiesResponse } from "@/src/client/types/sellerActivitiesResponse";

import type { Client } from "@/src/client/types/client";
import type { Property } from "@/src/client/types/property";
import type { SellerClientsResponse } from "@/src/client/types/sellerClientsResponse";
import type { SellerPropertiesResponse } from "@/src/client/types/sellerPropertiesResponse";

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

const STAGES = ["new", "negotiation", "offer_sent", "won", "lost"] as const;

export default function SellerManageDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Lookup podaci za combo box.
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Create deal form.
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [expectedValue, setExpectedValue] = useState("");
  const [createStage, setCreateStage] = useState<(typeof STAGES)[number]>("new");

  // Stage update.
  const [nextStage, setNextStage] = useState<(typeof STAGES)[number]>("new");

  // Create activity form.
  const [aSubject, setASubject] = useState("");
  const [aType, setAType] = useState("call");
  const [aDueDate, setADueDate] = useState("");
  const [aDescription, setADescription] = useState("");

  const selectedDeal = useMemo(
    () => deals.find((d) => d.id === selectedDealId) || null,
    [deals, selectedDealId]
  );

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter((d) => {
      const c = d.client?.name?.toLowerCase() || "";
      const p = d.property?.title?.toLowerCase() || "";
      return d.title.toLowerCase().includes(q) || c.includes(q) || p.includes(q);
    });
  }, [deals, search]);

  async function loadDeals() {
    setError(null);
    setLoadingDeals(true);
    try {
      const data = await fetchJson<SellerDealsResponse>("/api/seller/deals", { method: "GET" });
      setDeals(data.deals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load deals.");
    } finally {
      setLoadingDeals(false);
    }
  }

  async function loadActivities(dealId: number) {
    setError(null);
    setLoadingActivities(true);
    try {
      const data = await fetchJson<SellerActivitiesResponse>(
        `/api/seller/deals/${dealId}/stage/activities`,
        { method: "GET" }
      );
      setActivities(data.activities);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activities.");
    } finally {
      setLoadingActivities(false);
    }
  }

  async function loadLookups() {
    setError(null);
    setLoadingLookups(true);
    try {
      const [c, p] = await Promise.all([
        fetchJson<SellerClientsResponse>("/api/seller/clients", { method: "GET" }),
        fetchJson<SellerPropertiesResponse>("/api/seller/properties", { method: "GET" }),
      ]);

      setClients(c.clients);
      setProperties(p.properties);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load lists.");
    } finally {
      setLoadingLookups(false);
    }
  }

  useEffect(() => {
    // Ucitavamo dealove i lookups na mount.
    loadDeals();
    loadLookups();
  }, []);

  useEffect(() => {
    // Kad izaberemo deal, ucitamo aktivnosti.
    if (!selectedDealId) {
      setActivities([]);
      return;
    }
    loadActivities(selectedDealId);
  }, [selectedDealId]);

  useEffect(() => {
    // Kad promenimo selektovan deal, setujemo stage dropdown.
    if (!selectedDeal) return;
    setNextStage((selectedDeal.stage as any) || "new");
  }, [selectedDeal]);

  async function onCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    if (!propertyId) {
      setError("Please select a property.");
      return;
    }

    try {
      await fetchJson("/api/seller/deals", {
        method: "POST",
        body: JSON.stringify({
          title,
          clientId,
          propertyId,
          expectedValue: expectedValue ? Number(expectedValue) : undefined,
          stage: createStage,
        }),
      });

      setTitle("");
      setClientId(null);
      setPropertyId(null);
      setExpectedValue("");
      setCreateStage("new");

      await loadDeals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create deal.");
    }
  }

  async function onUpdateStage() {
    if (!selectedDeal) return;
    setError(null);

    try {
      await fetchJson(`/api/seller/deals/${selectedDeal.id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage: nextStage }),
      });

      await loadDeals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update stage.");
    }
  }

  async function onAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDeal) return;

    setError(null);

    try {
      await fetchJson(`/api/seller/deals/${selectedDeal.id}/stage/activities`, {
        method: "POST",
        body: JSON.stringify({
          subject: aSubject,
          type: aType,
          description: aDescription || undefined,
          // datetime-local -> ISO da server dobije stabilan format.
          dueDate: aDueDate ? new Date(aDueDate).toISOString() : undefined,
        }),
      });

      setASubject("");
      setAType("call");
      setADueDate("");
      setADescription("");

      await loadActivities(selectedDeal.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add activity.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Manage Deals</h1>
            <p className="mt-1 text-sm text-white/70">
              Create deals, update stages, and manage activities.
            </p>
          </div>

          <button
            onClick={loadDeals}
            disabled={loadingDeals}
            className={ghostBtn}
          >
            {loadingDeals ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-6">
              {/* Deals list */}
              <section className={panel}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Your Deals</h2>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className={inputClass}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {filteredDeals.length === 0 ? (
                    <div className={emptyBox}>
                      {loadingDeals ? "Loading..." : "No deals found."}
                    </div>
                  ) : (
                    filteredDeals.map((d) => {
                      const active = d.id === selectedDealId;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDealId(d.id)}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-left transition",
                            active
                              ? "border-purple-400/40 bg-purple-500/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-semibold">{d.title}</div>
                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                              {d.stage || "new"}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-white/55">
                            Client: {d.client?.name || "—"} · Property: {d.property?.title || "—"}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Create deal */}
              <section className={panel}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Create a new deal</h2>
                    <p className="mt-1 text-sm text-white/60">
                      Select a client and a property (IDs are submitted in the background).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadLookups}
                    disabled={loadingLookups}
                    className={ghostBtn}
                  >
                    {loadingLookups ? "Loading..." : "Reload lists"}
                  </button>
                </div>

                <form onSubmit={onCreateDeal} className="mt-4 space-y-3">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Deal title"
                    required
                    className={inputClass}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={clientId ?? ""}
                      onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : null)}
                      className={selectClass}
                      required
                    >
                      <option value="" className="bg-[#0b0b10]">
                        Select client
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0b0b10]">
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={propertyId ?? ""}
                      onChange={(e) => setPropertyId(e.target.value ? Number(e.target.value) : null)}
                      className={selectClass}
                      required
                    >
                      <option value="" className="bg-[#0b0b10]">
                        Select property
                      </option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#0b0b10]">
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(e.target.value)}
                    placeholder="Expected value (optional)"
                    className={inputClass}
                  />

                  <select
                    value={createStage}
                    onChange={(e) => setCreateStage(e.target.value as any)}
                    className={selectClass}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s} className="bg-[#0b0b10]">
                        {s}
                      </option>
                    ))}
                  </select>

                  <button type="submit" className={primaryBtn}>
                    Create deal
                  </button>
                </form>
              </section>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <section className={panel}>
                <h2 className="text-lg font-semibold">Deal details</h2>
                <p className="mt-1 text-sm text-white/60">
                  Update stage and manage activities for the selected deal.
                </p>

                {!selectedDeal ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                    Select a deal from the left panel.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold">{selectedDeal.title}</div>
                      <div className="mt-1 text-xs text-white/55">
                        Client: {selectedDeal.client?.name || "—"} · Property: {selectedDeal.property?.title || "—"}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          value={nextStage}
                          onChange={(e) => setNextStage(e.target.value as any)}
                          className={selectClass}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s} className="bg-[#0b0b10]">
                              {s}
                            </option>
                          ))}
                        </select>

                        <button onClick={onUpdateStage} className={secondaryBtn}>
                          Update stage
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Activities</div>
                        <div className="text-xs text-white/55">
                          {loadingActivities ? "Loading..." : `${activities.length} total`}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {activities.length === 0 ? (
                          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">
                            No activities yet.
                          </div>
                        ) : (
                          activities.map((a) => (
                            <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold text-sm">{a.subject}</div>
                                <div className="text-xs text-white/55">{a.type || "—"}</div>
                              </div>
                              <div className="mt-1 text-xs text-white/55">
                                Due: {a.dueDate ? new Date(a.dueDate).toLocaleString() : "—"}
                              </div>
                              {a.description ? (
                                <div className="mt-1 text-sm text-white/70">{a.description}</div>
                              ) : null}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold">Add activity</div>

                      <form onSubmit={onAddActivity} className="mt-3 space-y-3">
                        <input
                          value={aSubject}
                          onChange={(e) => setASubject(e.target.value)}
                          placeholder="Subject"
                          required
                          className={inputClass}
                        />

                        <div className="grid gap-3 sm:grid-cols-2">
                          <select value={aType} onChange={(e) => setAType(e.target.value)} className={selectClass}>
                            <option value="call" className="bg-[#0b0b10]">call</option>
                            <option value="meeting" className="bg-[#0b0b10]">meeting</option>
                            <option value="task" className="bg-[#0b0b10]">task</option>
                          </select>

                          <input
                            value={aDueDate}
                            onChange={(e) => setADueDate(e.target.value)}
                            type="datetime-local"
                            className={inputClass}
                          />
                        </div>

                        <textarea
                          value={aDescription}
                          onChange={(e) => setADescription(e.target.value)}
                          placeholder="Description (optional)"
                          className={textareaClass}
                          rows={3}
                        />

                        <button type="submit" className={primaryBtn}>
                          Add activity
                        </button>
                      </form>
                    </div>
                  </div>
                )}

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

// Tailwind klase u konstantama da JSX ostane citak.
const panel =
  "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/25 text-white";

const emptyBox =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/60 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20";

const textareaClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/60 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20";

const selectClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20";

const primaryBtn =
  "w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110";

const secondaryBtn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10";

const ghostBtn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60";
