import { createHash, timingSafeEqual } from 'crypto';
export function hashToken(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function constantTimeEqual(a: string, b: string) {
  const aa = Buffer.from(a); const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
// In-memory limiter is suitable only for local development/single instance.
// Replace with Redis or a managed edge limiter before production.
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now(); const current = buckets.get(key);
  if (!current || current.reset < now) { buckets.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (current.count >= limit) return false; current.count++; return true;
}
