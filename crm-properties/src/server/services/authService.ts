// src/server/services/authService.ts

import { prisma } from "../db/prisma";
import { hashPassword, verifyPassword } from "../auth/password";
import { setSessionCookie, clearSessionCookie } from "../auth/session";
import { signToken, type Role } from "../auth/jwt";
import { registerSchema, loginSchema } from "../validators/authValidators";
import { httpError, normalizeError } from "../http/errors";

// SK1 Registracija korisnika.
export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);

  try {
    // Provera jedinstvenosti email-a.
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw httpError(400, "Email already exists.");
    }

    const passwordHash = await hashPassword(data.password);

    // Za pocetnike: javna registracija uvek dodeljuje ulogu "seller".
    // Admin ce kasnije moci da menja uloge kroz admin funkcije.
    const role: Role = "seller";

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        role,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    // Automatska prijava nakon registracije.
    const token = signToken({ sub: user.id, role: (user.role as Role) || "seller" });
    await setSessionCookie(token);

    return { message: "User registered successfully.", user };
  } catch (e) {
    throw normalizeError(e);
  }
}

// SK2 Prijava korisnika.
export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);

  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw httpError(400, "Invalid email or password.");
  }

  const ok = await verifyPassword(data.password, user.password);

  if (!ok) {
    throw httpError(400, "Invalid email or password.");
  }

  const role = (user.role || "seller") as Role;

  const token = signToken({ sub: user.id, role });
  await setSessionCookie(token);

  return {
    message: "User logged in successfully.",
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role },
  };
}

// SK3 Logout korisnika.
export async function logoutUser() {
  await clearSessionCookie();
  return { message: "User logged out successfully." };
}
