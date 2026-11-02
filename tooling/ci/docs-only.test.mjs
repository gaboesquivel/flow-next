import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

import { isDocsOnly } from "./docs-only.mjs";

test("root and docs/ markdown are docs-only", () => {
  assert.equal(isDocsOnly(["README.md", "AGENTS.md", "docs/INTEROP.md", "docs/a/b.md"]), true);
});

test("any code, config, or workflow change runs the full build", () => {
  for (const file of [
    "app/page.tsx",
    "package.json",
    "pnpm-lock.yaml",
    ".github/workflows/ci.yml",
    "docs/diagram.png",
    "tooling/ci/docs-only.mjs",
  ])
    assert.equal(isDocsOnly(["README.md", file]), false, file);
});

test("markdown that tests or Eve read is not docs-only", () => {
  for (const file of [
    ".agents/skills/build/SKILL.md",
    "agents/assistant/agent/instructions.md",
    "app/markdown/home.md",
    "lib/README.md",
  ])
    assert.equal(isDocsOnly([file]), false, file);
});

test("an empty or unknown change list is never docs-only", () => {
  assert.equal(isDocsOnly([]), false);
  assert.equal(isDocsOnly(["", "  "]), false);
});

const run = (input) =>
  execFileSync("node", [new URL("docs-only.mjs", import.meta.url).pathname], { input })
    .toString()
    .trim();

test("CLI prints a GitHub output line", () => {
  assert.equal(run("README.md\ndocs/INTEROP.md\n"), "docs_only=true");
  assert.equal(run("README.md\napp/page.tsx\n"), "docs_only=false");
  assert.equal(run(""), "docs_only=false");
});
