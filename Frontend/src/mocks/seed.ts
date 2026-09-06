/**
 * Deterministic fixture helpers.
 *
 * Mock data MUST be deterministic. Next.js renders these fixtures on the server
 * and again on the client; anything derived from Math.random() or Date.now()
 * differs between the two passes and React throws a hydration mismatch. So every
 * "random" value here comes from a seeded PRNG, and every date is derived from a
 * fixed reference instant rather than the wall clock.
 */

/** Fixed "now" for all fixtures. Keeps relative dates stable across renders. */
export const NOW = new Date("2026-09-06T09:00:00.000Z");

/** mulberry32 — small, fast, deterministic. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable numeric hash of a string, so ids seed their own values. */
export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const pick = <T>(items: readonly T[], r: number): T =>
  items[Math.floor(r * items.length) % items.length] as T;

export const intBetween = (min: number, max: number, r: number): number =>
  min + Math.floor(r * (max - min + 1));

export const roundTo = (value: number, dp = 1): number =>
  Math.round(value * 10 ** dp) / 10 ** dp;

/** ISO timestamp offset from the fixed NOW. */
export const daysFromNow = (days: number): string =>
  new Date(NOW.getTime() + days * 86_400_000).toISOString();

export const hoursFromNow = (hours: number): string =>
  new Date(NOW.getTime() + hours * 3_600_000).toISOString();

/**
 * Validates a fixture against its schema during development.
 *
 * A fixture that drifts from the contract is the exact bug this whole
 * architecture exists to prevent, so we fail loudly and early rather than
 * discovering it when the real API arrives.
 */
export function validated<T>(
  schema: { parse: (v: unknown) => T },
  value: unknown,
  label: string,
): T {
  if (process.env.NODE_ENV === "production") return value as T;
  try {
    return schema.parse(value);
  } catch (error) {
    console.error(`[mocks] Fixture "${label}" does not match its schema:`, error);
    throw error;
  }
}
