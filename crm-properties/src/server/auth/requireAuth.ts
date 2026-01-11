import { getSessionCookie, refreshSessionCookie } from "./session";
import { verifyToken } from "./jwt";

// Proverava da li postoji validna sesija (JWT u cookie-ju).
// Ako postoji, vraca payload (userId + role).
// Ako ne postoji ili je token los, baca 401.
export async function requireAuth() {
  const token = await getSessionCookie();

  if (!token) {
    throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
  }

  const payload = verifyToken(token);

  // Sliding session: osvezavamo cookie (npr. 25 min neaktivnosti).
  await refreshSessionCookie(payload);

  return payload;
}
