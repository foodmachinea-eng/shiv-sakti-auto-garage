import "server-only";
import { createHash } from "node:crypto";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { getDb } from "./db/client";
import { rateLimitEvents } from "./db/schema";
import { ApiError } from "./api";

/** Best-effort client IP, behind Netlify / Vercel / common proxies. */
export function getClientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("x-nf-client-connection-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/** IPs are never stored in plain text — only a salted hash used for rate limiting. */
export function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET || "garage-ip-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Sliding-window limiter stored in Postgres, so it works across serverless
 * instances. Throws a 429 ApiError when the limit is exceeded.
 */
export async function enforceRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number,
  message = "Too many attempts. Please wait a few minutes and try again.",
) {
  const db = await getDb();
  const since = new Date(Date.now() - windowSeconds * 1000);
  const [row] = await db
    .select({ n: count() })
    .from(rateLimitEvents)
    .where(and(eq(rateLimitEvents.bucket, bucket), eq(rateLimitEvents.key, key), gte(rateLimitEvents.createdAt, since)));
  if (Number(row?.n ?? 0) >= limit) throw new ApiError(429, message);
  await db.insert(rateLimitEvents).values({ bucket, key });

  // Occasionally purge old rows.
  if (Math.random() < 0.05) {
    await db
      .delete(rateLimitEvents)
      .where(lt(rateLimitEvents.createdAt, sql`now() - interval '2 days'`))
      .catch(() => undefined);
  }
}

export async function clearRateLimit(bucket: string, key: string) {
  const db = await getDb();
  await db.delete(rateLimitEvents).where(and(eq(rateLimitEvents.bucket, bucket), eq(rateLimitEvents.key, key)));
}
