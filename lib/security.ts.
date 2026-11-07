
import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function safeCompare(a: string, b: string): boolean {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  if (first.length !== second.length) return false;

  return timingSafeEqual(first, second);
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function sanitizeText(value: string): string {
  return value
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 1000);
}
