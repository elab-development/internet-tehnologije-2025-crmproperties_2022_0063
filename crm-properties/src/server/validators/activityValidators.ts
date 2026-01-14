import { z } from "zod";

// Tipovi aktivnosti (SK17).
export const activityTypeSchema = z.enum(["call", "email", "meeting", "task"]);

// Dodavanje aktivnosti (SK17).
export const createActivitySchema = z.object({
  subject: z.string().min(3, "Subject must have at least 3 characters."),
  type: activityTypeSchema.optional(),
  description: z.string().optional(),
  // Prihvatamo ISO string, a dodatno proveravamo da Date može da ga parsira.
  dueDate: z.string().optional().refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Invalid dueDate."),
});
