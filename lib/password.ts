import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const keyLength = 64;
const params = { N: 16384, r: 8, p: 1 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, keyLength, params).toString("base64url");
  return `scrypt$${params.N}$${params.r}$${params.p}$${salt}$${hash}`;
}

export function verifyPassword(password: string, passwordHash: string | null): boolean {
  if (!passwordHash) return false;
  const [algorithm, n, r, p, salt, storedHash] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !n || !r || !p || !salt || !storedHash) return false;
  const calculated = scryptSync(password, salt, keyLength, { N: Number(n), r: Number(r), p: Number(p) });
  const stored = Buffer.from(storedHash, "base64url");
  return stored.length === calculated.length && timingSafeEqual(stored, calculated);
}
