import { z } from "zod";

// Admin menja osnovne podatke korisnika (SK5).
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters.").optional(),
  email: z.string().email("Email must be valid.").optional(),
  phone: z.string().min(3, "Phone must have at least 3 characters.").optional(),
  role: z.enum(["seller", "manager", "admin"]).optional(),
});
