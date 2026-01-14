// src/client/types/deal.ts

export type Deal = {
  id: number;
  title: string;
  expectedValue: number | null;
  stage: string | null;
  closeDate: string | null;

  // U listi dealova mi include-ujemo client i property.
  client?: { id: number; name: string };
  property?: { id: number; title: string };
};
