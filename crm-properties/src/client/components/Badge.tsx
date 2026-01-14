// src/client/components/Badge.tsx
import React from "react";

// Reusable Badge za male tagove.
import type { BadgeProps } from "../types/badgeProps";

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
