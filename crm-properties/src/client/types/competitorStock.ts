// src/client/types/competitorStock.ts
export type CompetitorStock = {
  symbol: string;
  name: string;
  currency: "USD";
  priceUsd: number;
  priceConverted: number;
  convertedTo: "USD" | "EUR";
  changePercent?: number | null;
  updatedAt?: string | null;
  imageUrl: string;
};