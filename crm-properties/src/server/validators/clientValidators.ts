import { z } from "zod";

// Dodavanje klijenta (SK13).
export const createClientSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters."),
  email: z.string().email("Email must be valid.").optional(),
  phone: z.string().min(3, "Phone must have at least 3 characters.").optional(),
  city: z.string().min(2, "City must have at least 2 characters.").optional(),
});

// Azuriranje klijenta (SK14).
export const updateClientSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters.").optional(),
  email: z.string().email("Email must be valid.").optional(),
  phone: z.string().min(3, "Phone must have at least 3 characters.").optional(),
  city: z.string().min(2, "City must have at least 2 characters.").optional(),
});
