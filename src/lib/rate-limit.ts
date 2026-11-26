import { isIP } from "node:net";
import { lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimitBuckets } from "@/db/schema";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let sharedCleanupCounter = 0;

function checkLocalRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  for (const [bucketKey, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(bucketKey);
  }
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) {
    return false;
  }
  current.count += 1;
  return true;
}

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (db) {
    const now = new Date();
    const nextReset = new Date(now.getTime() + windowMs);
    try {
      const [bucket] = await db
        .insert(rateLimitBuckets)
        .values({ key, count: 1, resetAt: nextReset })
        .onConflictDoUpdate({
          target: rateLimitBuckets.key,
          set: {
            count: sql`case when ${rateLimitBuckets.resetAt} <= ${now} then 1 else ${rateLimitBuckets.count} + 1 end`,
            resetAt: sql`case when ${rateLimitBuckets.resetAt} <= ${now} then ${nextReset} else ${rateLimitBuckets.resetAt} end`,
          },
        })
        .returning({ count: rateLimitBuckets.count });
      sharedCleanupCounter += 1;
      if (sharedCleanupCounter % 100 === 0) {
        try {
          await db
            .delete(rateLimitBuckets)
            .where(lte(rateLimitBuckets.resetAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)));
        } catch (error) {
          console.error("rate limit cleanup failed", error);
        }
      }
      return bucket.count <= limit;
    } catch (error) {
      console.error("shared rate limit unavailable; rejecting request", error);
      return false;
    }
  }
  if (process.env.NODE_ENV === "production") {
    console.error("shared rate limit unavailable in production; rejecting request");
    return false;
  }
  return checkLocalRateLimit(key, limit, windowMs);
}

export function getClientIpFromHeaders(headers: Headers): string | null {
  const configuredHeader = process.env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase();
  const isProd = process.env.NODE_ENV === "production";
  if (!configuredHeader && isProd) return null;

  const headersToTry = configuredHeader
    ? [configuredHeader]
    : ["x-real-ip", "x-forwarded-for"];
  for (const selectedHeader of headersToTry) {
    const isSupported =
      selectedHeader === "x-real-ip" ||
      selectedHeader === "x-forwarded-for" ||
      selectedHeader === "x-nf-client-connection-ip";
    if (!isSupported) {
      return isProd ? null : "unknown";
    }
    const value = headers.get(selectedHeader)?.trim();
    if (!value) continue;
    if (selectedHeader !== "x-forwarded-for") {
      if (isIP(value)) return value;
      continue;
    }

    // Only configure x-forwarded-for when the trusted proxy appends the client IP
    // at the end and removes any client-supplied forwarding chain first.
    const hops = value.split(",").map((hop) => hop.trim());
    for (let index = hops.length - 1; index >= 0; index -= 1) {
      if (isIP(hops[index])) return hops[index];
    }
  }
  return isProd ? null : "unknown";
}

export function getClientIp(request: Request): string | null {
  return getClientIpFromHeaders(request.headers);
}
