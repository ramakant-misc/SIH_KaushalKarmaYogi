import { z } from "zod";

/**
 * Shared primitives used by every entity in the platform.
 * These shapes ARE the contract — the backend must match them exactly.
 * See ENDPOINT_CONTRACT.md at the repository root.
 */

export const IdSchema = z.string().min(1).describe("Opaque server-generated identifier");
export const IsoDateTimeSchema = z
  .string()
  .describe("ISO-8601 UTC timestamp, e.g. 2026-09-06T11:30:00Z");

/** Standard success envelope. Every 2xx JSON response uses this shape. */
export const ApiEnvelopeSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data,
    meta: z
      .object({
        requestId: z.string(),
        generatedAt: IsoDateTimeSchema,
      })
      .partial()
      .optional(),
  });

/** Standard error envelope. Every 4xx/5xx JSON response uses this shape. */
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      "BAD_REQUEST",
      "UNAUTHENTICATED",
      "FORBIDDEN",
      "NOT_FOUND",
      "CONFLICT",
      "VALIDATION_FAILED",
      "RATE_LIMITED",
      "UPSTREAM_UNAVAILABLE",
      "INTERNAL",
    ]),
    message: z.string(),
    /** Field-level errors, keyed by dot-path. Present when code = VALIDATION_FAILED. */
    fields: z.record(z.string(), z.string()).optional(),
    requestId: z.string().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** Cursor pagination. Cursors are opaque; clients must not parse them. */
export const PageInfoSchema = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  totalCount: z.number().int().nonnegative().optional(),
});
export type PageInfo = z.infer<typeof PageInfoSchema>;

export const PaginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), pageInfo: PageInfoSchema });

export type Paginated<T> = { items: T[]; pageInfo: PageInfo };

/** Query params accepted by every list endpoint. */
export const ListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc").optional(),
});
export type ListQuery = z.infer<typeof ListQuerySchema>;
