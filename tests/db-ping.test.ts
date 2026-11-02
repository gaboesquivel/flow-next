import assert from "node:assert/strict";
import { afterEach, test, vi } from "vitest";

import { GET } from "../app/api/db/route";
import { pingDatabase } from "../lib/db/ping";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("pingDatabase fails closed without a url", async () => {
  const result = await pingDatabase({ databaseUrl: "  " });
  assert.deepEqual(result, { ok: false, status: 503 });
});

test("pingDatabase returns ok when the query succeeds", async () => {
  let seen = "";
  const result = await pingDatabase({
    databaseUrl: "neon-connection-fixture",
    query: (databaseUrl) => {
      seen = databaseUrl;
      return [{ ok: 1 }];
    },
  });
  assert.deepEqual(result, { ok: true });
  assert.equal(seen, "neon-connection-fixture");
});

test("GET /api/db reports a missing database", async () => {
  vi.stubEnv("DATABASE_URL", undefined);
  const response = await GET();
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "database is not configured" });
});
