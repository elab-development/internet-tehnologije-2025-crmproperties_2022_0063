import type { Role } from "./jwt";

// Proverava da li korisnik ima dozvoljenu ulogu.
// Ako nema, baca 403 (zabranjen pristup).
export function requireRole(currentRole: Role, allowedRoles: Role[]) {
  if (!allowedRoles.includes(currentRole)) {
    throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  }
}
