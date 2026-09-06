/** Reads once, at module load, so every call site agrees. */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
