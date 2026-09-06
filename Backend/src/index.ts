import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { randomUUID } from "node:crypto";

/**
 * KaushalKarmaYogi API.
 *
 * Phase 0 scaffold: server, security middleware, request ids, health check.
 * Phase 5 adds Clerk authentication, the three-role RBAC middleware, the
 * onboarding + role routes and the Clerk webhook.
 *
 * Every response uses the envelope documented in ENDPOINT_CONTRACT.md.
 */
const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

/** Attach a request id so the engineer dashboard can correlate a UI error to a log line. */
app.use((req, res, next) => {
  const requestId = (req.header("x-request-id") ?? randomUUID()) as string;
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    data: { status: "ok", uptimeSeconds: Math.round(process.uptime()) },
    meta: { requestId: res.locals.requestId, generatedAt: new Date().toISOString() },
  });
});

app.use((_req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found", requestId: res.locals.requestId },
  });
});

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
