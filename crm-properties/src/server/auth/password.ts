import bcrypt from "bcryptjs";

// Hash lozinke - nikad ne cuvamo plain tekst lozinke u bazi.
// Salt rounds = 10 je OK za demo i pocetnike (sporije = sigurnije, ali i teze za razvoj).
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}
