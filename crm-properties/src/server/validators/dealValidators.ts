import { z } from "zod";

// Faze deala (SK16) - drzimo string vrednosti radi jednostavnosti.
export const dealStageSchema = z.enum([
  "new",
  "negotiation",
  "offer_sent",
  "won",
  "lost",
]);

// Kreiranje deala (SK15).
export const createDealSchema = z.object({
  title: z.string().min(3, "Title must have at least 3 characters."),
  clientId: z.number().int().positive("Client ID must be a positive integer."),
  propertyId: z.number().int().positive("Property ID must be a positive integer."),
  expectedValue: z.number().nonnegative("Expected value must be 0 or greater.").optional(),
  stage: dealStageSchema.optional(),
});

// Promena faze deala (SK16).
export const updateDealStageSchema = z.object({
  stage: dealStageSchema,
});
