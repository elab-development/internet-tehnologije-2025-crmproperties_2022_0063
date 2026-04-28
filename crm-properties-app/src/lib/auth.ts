import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

// Tip za sadržaj JWT tokena.
type TokenPayload = {
  id: number;
  email: string;
  role: "ADMIN" | "MANAGER" | "AGENT";
};

// Funkcija za potpisivanje tokena.
export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

// Funkcija za proveru tokena.
export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
}

// Funkcija za heširanje lozinke.
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Funkcija za proveru lozinke.
export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

// Funkcija koja vraća trenutno prijavljenog korisnika.
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Ako nema tokena korisnik nije prijavljen.
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);

    // Vraćamo samo osnovne podatke o korisniku.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}