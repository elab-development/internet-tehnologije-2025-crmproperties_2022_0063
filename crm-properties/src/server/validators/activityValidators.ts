import { z } from "zod";

// Tipovi aktivnosti (SK17).
export const activityTypeSchema = z.enum(["call", "email", "meeting", "task"]);

// Dodavanje aktivnosti (SK17).
export const createActivitySchema = z.object({
  subject: z.string().min(3, "Subject must have at least 3 characters."),
  type: activityTypeSchema.optional(),
  description: z.string().optional(),
  // Ocekujemo ISO string (npr. new Date().toISOString()).
  dueDate: z.string().datetime("Due date must be a valid ISO datetime.").optional(),
});
