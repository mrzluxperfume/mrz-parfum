import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 120_000;
const KEY_LENGTH = 32;

export function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = pbkdf2Sync(String(password), salt, ITERATIONS, KEY_LENGTH, "sha256");
  return `pbkdf2$${ITERATIONS}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]) || ITERATIONS;
  const salt = Buffer.from(parts[2], "base64");
  const expected = Buffer.from(parts[3], "base64");
  const derived = pbkdf2Sync(
    String(password),
    salt,
    iterations,
    expected.length,
    "sha256",
  );
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function isStrongPassword(password) {
  return String(password || "").length >= 8;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function fingerprintSession(email) {
  return createHash("sha256").update(`mrz:${email}`).digest("hex").slice(0, 16);
}
