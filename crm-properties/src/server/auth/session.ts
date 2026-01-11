import { cookies } from "next/headers";
import { SESSION_TTL_MINUTES, type JwtPayload, signToken } from "./jwt";

// Naziv cookie-ja za sesiju.
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "crm_properties_session";

export async function setSessionCookie(token: string) {
  // U novijim Next verzijama cookies() vraca Promise, pa mora await.
  const c = await cookies();

  // httpOnly sprecava JS pristup cookie-ju (XSS zastita).
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * SESSION_TTL_MINUTES,
  });
}

export async function clearSessionCookie() {
  // U novijim Next verzijama cookies() vraca Promise, pa mora await.
  const c = await cookies();

  // Brisemo cookie tako sto postavimo maxAge na 0.
  c.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionCookie() {
  // U novijim Next verzijama cookies() vraca Promise, pa mora await.
  const c = await cookies();

  return c.get(COOKIE_NAME)?.value || null;
}

// Sliding session: osvezavamo cookie pri svakom request-u.
export async function refreshSessionCookie(payload: JwtPayload) {
  const freshToken = signToken(payload);
  await setSessionCookie(freshToken);
  return freshToken;
}
