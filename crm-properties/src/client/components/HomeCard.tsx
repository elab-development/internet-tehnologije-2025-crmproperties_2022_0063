// src/client/components/HomeCard.tsx
// Reusable kartica za Home stranice (Admin/Manager/Seller).
// Drzimo props jednostavnim da pocetnicima bude lako.
import type { HomeCardProps } from "../types/homeCardProps";

export default function HomeCard({ title, subtitle, text, className = "" }: HomeCardProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur",
        className,
      ].join(" ")}
    >
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs text-white/60">{subtitle}</div>
      <div className="mt-3 text-sm leading-6 text-white/70">{text}</div>
    </div>
  );
}
