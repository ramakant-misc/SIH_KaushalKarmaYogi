import type { Paginated } from "@/schemas";

/**
 * Returns fixture data as a promise with a small delay.
 *
 * The delay is deliberate: it makes loading skeletons and error states real
 * during development instead of flashing past, so we ship UI that behaves
 * correctly once a real network is involved.
 */
export function mock<T>(data: T, delayMs = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
}

/** Rejects, for exercising error states. Wire to a query param during development. */
export function mockError(message = "Mock failure", delayMs = 220): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delayMs));
}

/** Cursor pagination over an in-memory array, matching the contract's shape. */
export function paginate<T>(items: T[], cursor?: string, limit = 20): Paginated<T> {
  const start = cursor ? Number.parseInt(cursor, 10) || 0 : 0;
  const slice = items.slice(start, start + limit);
  const next = start + limit;
  return {
    items: slice,
    pageInfo: {
      nextCursor: next < items.length ? String(next) : null,
      hasMore: next < items.length,
      totalCount: items.length,
    },
  };
}
