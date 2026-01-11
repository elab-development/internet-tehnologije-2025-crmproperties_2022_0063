import jwt, { type JwtPayload as LibJwtPayload } from "jsonwebtoken";

// Ovo su uloge iz tvog sistema.
// Drzimo ih kao string radi jednostavnosti za pocetnike.
export type Role = "admin" | "manager" | "seller";

// Ovo je JWT payload koji cuvamo u tokenu.
// sub = userId (standardna JWT claim vrednost).
export type JwtPayload = {
  sub: number;
  role: Role;
};

// Tajni kljuc mora da bude u .env (JWT_SECRET).
// Default vrednost je samo za razvoj, nikad za produkciju.
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// TTL sesije: 25 minuta neaktivnosti (sliding cookie).
export const SESSION_TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES || 25);

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_TTL_MINUTES}m` });
}

function isRole(v: unknown): v is Role {
  return v === "admin" || v === "manager" || v === "seller";
}

// Verifikujemo token i normalizujemo payload.
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
    }

    const obj = decoded as LibJwtPayload & Record<string, unknown>;

    const subRaw = obj.sub;
    const sub =
      typeof subRaw === "number"
        ? subRaw
        : typeof subRaw === "string"
        ? Number(subRaw)
        : NaN;

    const role = obj.role;

    if (!Number.isInteger(sub) || sub <= 0 || !isRole(role)) {
      throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
    }

    return { sub, role };
  } catch {
    throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
  }
}
