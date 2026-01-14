// src/client/components/Field.tsx
// Reusable Field komponenta za label + input/children.
// Drzimo je prostom da bi pocetnicima bilo jasno.
import type { FieldProps } from "../types/fieldProps";

export default function Field({ label, children, className = "" }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      {/* Label iznad inputa */}
      <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}
