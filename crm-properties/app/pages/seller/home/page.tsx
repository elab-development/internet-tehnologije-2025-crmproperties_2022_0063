// src/app/pages/seller/home/page.tsx
"use client";

import Image from "next/image";

import Slider from "@/src/client/components/Slider";
import HomeCard from "@/src/client/components/HomeCard";

// Seller home stranica.
// Fokus: sopstveni klijenti, dealovi i aktivnosti.
export default function SellerHomePage() {
  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-black via-[#0b0b10] to-[#0f1020]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
          {/* Header */}
          <header className="flex flex-col gap-6 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">

              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Seller Dashboard</h1>
                <p className="mt-1 text-sm text-white/70">
                  Manage your clients, deals and activities in one place.
                </p>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Slider */}
            <section>
              <Slider className="border border-white/10 shadow-2xl shadow-black/40" />
            </section>

            {/* Cards */}
            <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <HomeCard
                title="My Clients"
                subtitle="Buyers you work with."
                text="View and update your own clients. Other sellers’ clients are not editable."
              />
              <HomeCard
                title="My Deals"
                subtitle="Pipeline tracking."
                text="Create deals by connecting a client and a property, then update deal stage."
              />
              <HomeCard
                title="Activities"
                subtitle="Calls, meetings, tasks."
                text="Add activities to each deal and track everything by due date for clarity."
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
