// src/app/pages/admin/home/page.tsx
"use client";

import React from "react";
import Image from "next/image";

import Slider from "@/src/client/components/Slider";
import HomeCard from "@/src/client/components/HomeCard";

// Admin home stranica.
// Isti princip kao auth: cista pozadina, jedna kartica kao wrapper, slider + kartice.
export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      {/* Jednostavna pozadina bez “neon vibe” efekata. */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-black via-[#0b0b10] to-[#0f1020]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        {/* Wrapper card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
          {/* Header */}
          <header className="flex flex-col gap-6 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-white/70">
                  Manage users, system metrics and exports.
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {/* Slider */}
            <section>
              <Slider className="border border-white/10 shadow-2xl shadow-black/40" />
            </section>

            {/* Cards */}
            <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <HomeCard
                title="Users"
                subtitle="Roles and access."
                text="View all users, update roles, and manage accounts in a safe way."
              />
              <HomeCard
                title="System Metrics"
                subtitle="Global overview."
                text="Track totals for clients, deals and activities to monitor the whole platform."
              />
              <HomeCard
                title="Exports"
                subtitle="Download reports."
                text="Generate CSV exports for metrics and keep reporting simple for beginners."
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
