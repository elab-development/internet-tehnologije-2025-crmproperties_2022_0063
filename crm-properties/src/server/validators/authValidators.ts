import { z } from "zod";

// Validacija registracije (SK1).
// Role je opcionalan u input-u, ali ga u servisu ignorisemo i stavljamo "seller".
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must have at least 2 characters."),
    email: z.string().email("Email must be valid."),
    password: z.string().min(8, "Password must have at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm password must have at least 8 characters."),
    role: z.enum(["seller", "manager", "admin"]).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// Validacija login-a (SK2).
export const loginSchema = z.object({
  email: z.string().email("Email must be valid."),
  password: z.string().min(1, "Password is required."),
});
