import { z } from "zod";
import { dealStageSchema } from "./dealValidators";

// Filter za dealove (SK9).
// Napomena: filtriramo po closeDate jer u semi nemamo createdAt.
export const dealFilterSchema = z.object({
  stage: dealStageSchema.optional(),
  sellerId: z.number().int().positive("Seller ID must be a positive integer.").optional(),
  fromCloseDate: z.string().datetime("From date must be a valid ISO datetime.").optional(),
  toCloseDate: z.string().datetime("To date must be a valid ISO datetime.").optional(),
});
