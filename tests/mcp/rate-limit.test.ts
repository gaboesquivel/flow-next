import assert from "node:assert/strict";
import { test } from "vitest";

import { POST as postApiMcp } from "../../app/api/mcp/route";
import { mcpRateLimitPolicy } from "../../lib/api/rate-limit-headers";
import { consumeMcpRateLimit } from "../../lib/mcp/rate-limit";

const clientRequest = (ip: string) =>
  new Request("http://app.localhost/api/mcp", {
    body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "tools/list", params: {} }),
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    method: "POST",
  });

test("MCP rate limit returns 429 with RateLimit headers after the window quota", async () => {
  const ip = "203.0.113.42";
  const { limit, windowSeconds } = mcpRateLimitPolicy;
  for (let index = 0; index < limit; index += 1) {
    assert.equal(consumeMcpRateLimit(clientRequest(ip)).limited, null);
  }

  const response = await postApiMcp(clientRequest(ip));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("RateLimit-Limit"), String(limit));
  assert.equal(response.headers.get("RateLimit-Policy"), `${limit};w=${windowSeconds}`);
  assert.equal(response.headers.get("RateLimit-Remaining"), "0");
  assert.ok(Number(response.headers.get("RateLimit-Reset")) > 0);
  assert.ok(Number(response.headers.get("Retry-After")) >= 1);
  const body = (await response.json()) as { code?: string };
  assert.equal(body.code, "rate_limited");

  const other = consumeMcpRateLimit(clientRequest("203.0.113.43"));
  assert.equal(other.limited, null);
});
