import { API_BASE_URL } from "./config";
import type { ApiError } from "@/schemas";

/**
 * The single HTTP entry point. Every real API call goes through here, so auth,
 * error shape, retries and request ids are handled in exactly one place.
 */

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiError["error"]["code"] | "NETWORK",
    message: string,
    public readonly fields?: Record<string, string>,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, unknown>;
  /** Clerk session token. On the server, pass it explicitly from auth(). */
  token?: string | null;
  signal?: AbortSignal;
  retries?: number;
};

function buildQuery(query?: Record<string, unknown>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    // Array filters repeat the key: ?domain=technical&domain=statistical
    if (Array.isArray(value)) {
      for (const v of value) if (v !== undefined && v !== null) params.append(key, String(v));
    } else {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, token, signal, retries = 1 } = options;
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        let payload: ApiError | undefined;
        try {
          payload = (await response.json()) as ApiError;
        } catch {
          // Non-JSON error body; fall through to a generic message.
        }
        throw new ApiRequestError(
          response.status,
          payload?.error.code ?? "INTERNAL",
          payload?.error.message ?? `Request failed with status ${response.status}`,
          payload?.error.fields,
          payload?.error.requestId ?? response.headers.get("x-request-id") ?? undefined,
        );
      }

      if (response.status === 204) return undefined as T;
      const json = (await response.json()) as { data: T };
      return json.data;
    } catch (error) {
      lastError = error;
      // Only retry transient network failures, never a 4xx.
      const retryable = !(error instanceof ApiRequestError) && attempt < retries;
      if (!retryable) break;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }

  if (lastError instanceof ApiRequestError) throw lastError;
  throw new ApiRequestError(0, "NETWORK", "Could not reach the API. Check your connection.");
}
