// src/client/components/Feature.tsx
// Reusable Feature kartica (ikonica + naslov + opis).
import type { FeatureProps } from "../types/featureProps";

export default function Feature({ title, text, className = "" }: FeatureProps) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4",
        className,
      ].join(" ")}
    >
      {/* Ikonica kao dekoracija (ne uvodimo ikon biblioteku da bude jednostavno) */}
      <div className="mt-0.5 h-9 w-9 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-emerald-400/10" />

      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm leading-6 text-white/70">{text}</div>
      </div>
    </div>
  );
}
