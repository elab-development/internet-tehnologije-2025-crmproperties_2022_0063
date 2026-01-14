// src/app/pages/auth/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Field from "@/src/client/components/Field";
import Slider from "@/src/client/components/Slider";

import type { Role } from "@/src/client/types/roles";
import type { ApiOk } from "@/src/client/types/apiOk";
import type { ApiFail } from "@/src/client/types/apiFail";
import type { LoginResponse } from "@/src/client/types/loginResponse";
import type { RegisterResponse } from "@/src/client/types/registerResponse";
import type { Mode } from "@/src/client/types/mode";

// Pomocna funkcija za POST JSON.
// Drzimo je u istom fajlu da pocetnicima bude lakse da prate tok.
async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Vazno: cookie sesija se cuva u browseru.
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as ApiOk<T> | ApiFail;

  if (!json.ok) {
    throw new Error(json.message || "Something went wrong.");
  }

  return json.data;
}

// Preusmeravanje po ulozi nakon uspesnog login/register-a.
function redirectByRole(router: ReturnType<typeof useRouter>, role: Role) {
  if (role === "admin") router.replace("/pages/admin/home");
  else if (role === "manager") router.replace("/pages/manager/home");
  else router.replace("/pages/seller/home");
}

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");

  // Register polja (First/Last -> name).
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Shared polja.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register-only polje.
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  function switchMode(next: Mode) {
    // Resetujemo greske i lozinke kad menjamo tab.
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Jednostavna klijentska provera (da pocetnicima bude jasnije).
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const data = await postJson<LoginResponse>("/api/auth/login", { email, password });
        redirectByRole(router, data.user.role);
        return;
      }

      const data = await postJson<RegisterResponse>("/api/auth/register", {
        name: fullName,
        email,
        password,
        confirmPassword,
      });

      redirectByRole(router, data.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      {/* Jednostavna pozadina bez “neon vibe” efekata. */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-black via-[#0b0b10] to-[#0f1020]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur xl:grid-cols-2">
          {/* LEFT PANEL: samo logo + slider (bez dodatnog teksta) */}
          <aside className="relative hidden p-10 xl:block">
            <div className="absolute inset-0 bg-white/[0.02]" />

            <div className="relative">
              {/* Logo (bez teksta pored, jer je tekst na logou) */}
              <div className="relative h-16 w-56">
                <Image
                  src="/logo.png"
                  alt="CRM Properties logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Slider */}
              <div className="mt-8">
                <Slider className="border border-white/10 shadow-2xl shadow-black/40" />
              </div>
            </div>
          </aside>

          {/* RIGHT PANEL: forma */}
          <main className="p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              {/* Header + tabs */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {mode === "login" ? "Sign in" : "Create account"}
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    {mode === "login"
                      ? "Use your email and password to access your dashboard."
                      : "Fill the form to create your account."}
                  </p>
                </div>

                {/* Tabs (cistije, bez gradijenata) */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-1">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      disabled={loading}
                      className={[
                        "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                        mode === "login"
                          ? "bg-white text-black"
                          : "text-white/70 hover:text-white",
                      ].join(" ")}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      disabled={loading}
                      className={[
                        "rounded-xl px-4 py-2 text-xs font-semibold transition",
                        mode === "register"
                          ? "bg-white text-black"
                          : "text-white/70 hover:text-white px-4",
                      ].join(" ")}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={onSubmit}
                className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30"
              >
                {mode === "register" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="First name">
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading}
                        required
                        autoComplete="given-name"
                        placeholder="Jane"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Last name">
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading}
                        required
                        autoComplete="family-name"
                        placeholder="Doe"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  <Field label="Email">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Password">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      type="password"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      placeholder="Enter your password"
                      className={inputClass}
                    />
                  </Field>

                  {mode === "register" && (
                    <Field label="Confirm password">
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        className={inputClass}
                      />
                    </Field>
                  )}
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {/* Dugme (bez gradijenta, modernije i “cistije”) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                </button>

                <p className="mt-4 text-center text-xs text-white/60">
                  {mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        disabled={loading}
                        className="font-semibold text-white underline underline-offset-4 hover:text-white/90"
                      >
                        Register
                      </button>
                      .
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        disabled={loading}
                        className="font-semibold text-white underline underline-offset-4 hover:text-white/90"
                      >
                        Login
                      </button>
                      .
                    </>
                  )}
                </p>
              </form>

              <p className="mt-5 text-center text-xs text-white/45">
                By continuing you agree to our{" "}
                <span className="text-white/70 underline underline-offset-4">Terms</span> and{" "}
                <span className="text-white/70 underline underline-offset-4">Privacy Policy</span>.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Tailwind input klase izdvajamo u konstantu da JSX ostane citak.
const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-70";
