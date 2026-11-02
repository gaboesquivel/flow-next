import assert from "node:assert/strict";
import { afterEach, test, vi } from "vitest";

import { POST as postSession } from "../../app/api/operator/session/route";
import { getOperatorAccessToken } from "../../lib/auth/operator-access";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("operator session POST fails closed without OPERATOR_SECRET", async () => {
  vi.stubEnv("OPERATOR_SECRET", undefined);
  vi.stubEnv("OPERATOR_ACCESS_TOKEN", undefined);
  const response = await postSession(
    new Request("http://flow-next.localhost/api/operator/session", {
      body: JSON.stringify({ token: "anything" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
  );
  assert.equal(response.status, 503);
});

test("an empty OPERATOR_SECRET falls back to OPERATOR_ACCESS_TOKEN", () => {
  vi.stubEnv("OPERATOR_SECRET", "  ");
  vi.stubEnv("OPERATOR_ACCESS_TOKEN", "legacy-token-0123456789");
  assert.equal(getOperatorAccessToken(), "legacy-token-0123456789");
});
