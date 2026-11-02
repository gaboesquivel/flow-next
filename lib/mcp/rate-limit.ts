import { jsonError } from "@/lib/api/json-error";
import { buildRateLimitHeaders, mcpRateLimitPolicy } from "@/lib/api/rate-limit-headers";

const windowMs = mcpRateLimitPolicy.windowSeconds * 1000;
const maxPerWindow = mcpRateLimitPolicy.limit;
/** Sweep expired buckets once the map grows past this many clients, at most once per window. */
const maxBuckets = 10_000;
let nextSweepAt = 0;

const buckets = new Map<string, { count: number; resetAt: number }>();

const clientKey = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  request.headers.get("x-real-ip") ??
  "local";

const sweepExpiredBuckets = (now: number) => {
  if (buckets.size < maxBuckets || now < nextSweepAt) return;
  nextSweepAt = now + windowMs;
  for (const [key, bucket] of buckets) if (now >= bucket.resetAt) buckets.delete(key);
};

export const consumeMcpRateLimit = (request: Request) => {
  const key = clientKey(request);
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    sweepExpiredBuckets(now);
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  const headers = buildRateLimitHeaders({
    remaining: maxPerWindow - bucket.count,
    resetAt: bucket.resetAt,
  });
  if (bucket.count <= maxPerWindow) return { headers, limited: null };

  return {
    headers,
    limited: jsonError({
      code: "rate_limited",
      extraHeaders: headers,
      message: "Too many MCP requests from this client.",
      resolution: "Wait one minute and retry.",
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      status: 429,
    }),
  };
};
