// src/client/components/PageInProgress.tsx
"use client";

import type { PageInProgressProps } from "../types/pageInProgressProps";

export default function PageInProgress({ className }: PageInProgressProps) {
  return (
    <div className={["min-h-screen text-white", className].filter(Boolean).join(" ")}>
      {/* Pozadina slika */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/pageInProgress.jpg')" }}
      />

      {/* Tamni overlay da tekst bude citljiv */}
      <div className="fixed inset-0 -z-10 bg-black/60" />

      {/* Sadrzaj */}
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-2xl shadow-black/40 backdrop-blur">
          <h1 className="text-3xl font-extrabold tracking-[0.25em] sm:text-4xl md:text-5xl">
            SECTION UNDER DEVELOPMENT
          </h1>
        </div>
      </div>
    </div>
  );
}
