// src/client/types/competitorsResponse.ts
import type { CompetitorStock } from "./competitorStock";

export type CompetitorsResponse = {
  baseCurrency: "USD";
  convertedTo: "USD" | "EUR";
  fxRate: number; // USD -> convertedTo
  items: CompetitorStock[];
  note?: string;
};