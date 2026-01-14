// src/app/pages/admin/manage-users/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { ApiOk } from "@/src/client/types/apiOk";
import type { ApiFail } from "@/src/client/types/apiFail";

import type { UserRow } from "@/src/client/types/userRow";

import type { AdminUsersResponse } from "@/src/client/types/adminUsersResponse";

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

const ROLES = ["admin", "manager", "seller", "buyer"] as const;

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Edit form.
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPhone, setUPhone] = useState("");
  const [uRole, setURole] = useState<string>("seller");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedId) || null,
    [users, selectedId]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [users, search]);

  async function loadUsers() {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const data = await fetchJson<AdminUsersResponse>("/api/admin/users", { method: "GET" });
      setUsers(data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Ucitavamo korisnike na mount.
    loadUsers();
  }, []);

  useEffect(() => {
    // Kad izaberemo korisnika, popunjavamo formu.
    if (!selectedUser) {
      setUName("");
      setUEmail("");
      setUPhone("");
      setURole("seller");
      return;
    }

    setUName(selectedUser.name || "");
    setUEmail(selectedUser.email || "");
    setUPhone(selectedUser.phone || "");
    setURole(selectedUser.role || "seller");
  }, [selectedUser]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      await fetchJson(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: uName,
          email: uEmail,
          phone: uPhone || null,
          role: uRole,
        }),
      });

      setNotice("User updated successfully.");
      await loadUsers();
      setSelectedId(selectedUser.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!selectedUser) return;

    // Minimalno: browser confirm.
    // Napomena: Ako zelis custom modal, mozemo posle.
    // eslint-disable-next-line no-alert
    const okConfirm = window.confirm(`Delete user "${selectedUser.name}"? This will also delete their deals and activities.`);
    if (!okConfirm) return;

    setError(null);
    setNotice(null);
    setDeleting(true);

    try {
      await fetchJson(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
      setNotice("User deleted successfully.");

      setSelectedId(null);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user.");
    } finally {
      setDeleting(false);
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
              <h1 className="text-2xl font-semibold tracking-tight text-white">Manage Users</h1>
              <p className="mt-1 text-sm text-white/80">View, edit roles, and delete users.</p>
            </div>

            <button onClick={loadUsers} disabled={loading} className={ghostBtn}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: list */}
              <section className={panel}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Users</h2>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className={inputClass}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {filteredUsers.length === 0 ? (
                    <div className={emptyBox}>{loading ? "Loading..." : "No users found."}</div>
                  ) : (
                    filteredUsers.map((u) => {
                      const active = u.id === selectedId;
                      return (
                        <button
                          key={u.id}
                          onClick={() => setSelectedId(u.id)}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-left transition",
                            active
                              ? "border-purple-400/40 bg-purple-500/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                              {u.role || "seller"}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-white/80">{u.email}</div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Right: editor */}
              <section className={panel}>
                <h2 className="text-lg font-semibold text-white">User details</h2>
                <p className="mt-1 text-sm text-white/80">Select a user to edit their data.</p>

                {!selectedUser ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                    Select a user from the left panel.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{selectedUser.name}</div>
                          <div className="mt-1 text-xs text-white/80">ID: {selectedUser.id}</div>
                        </div>

                        <button onClick={onDelete} disabled={deleting} className={dangerBtn}>
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>

                      <form onSubmit={onSave} className="mt-4 space-y-3">
                        <input
                          value={uName}
                          onChange={(e) => setUName(e.target.value)}
                          placeholder="Name"
                          className={inputClass}
                          required
                        />

                        <input
                          value={uEmail}
                          onChange={(e) => setUEmail(e.target.value)}
                          placeholder="Email"
                          className={inputClass}
                          required
                        />

                        <input
                          value={uPhone}
                          onChange={(e) => setUPhone(e.target.value)}
                          placeholder="Phone (optional)"
                          className={inputClass}
                        />

                        <select value={uRole} onChange={(e) => setURole(e.target.value)} className={selectClass}>
                          {ROLES.map((r) => (
                            <option key={r} value={r} className="bg-[#0b0b10]">
                              {r}
                            </option>
                          ))}
                        </select>

                        <button type="submit" disabled={saving} className={primaryBtn}>
                          {saving ? "Saving..." : "Save changes"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {notice && (
                  <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {notice}
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
const panel = "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/25";

const emptyBox = "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/60 outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20";

const selectClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20";

const primaryBtn =
  "w-full rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60";

const dangerBtn =
  "rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60";

const ghostBtn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60";
