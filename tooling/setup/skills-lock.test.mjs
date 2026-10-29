import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const lock = JSON.parse(readFileSync(path.join(root, "skills-lock.json"), "utf-8")).skills;

// Flow owns these workflow jobs; a second skill for the same job makes agents pick arbitrarily.
const flowOwned = ["debug", "domain-modeling", "explore", "prototype", "start"];
const overlapping = ["diagnosing-bugs", "research", "tdd"];

test("skills lock carries Flow and no overlapping workflow skills", () => {
  for (const name of flowOwned) assert.equal(lock[name]?.source, "gaboesquivel/flow-skills", name);
  for (const name of overlapping) assert.equal(lock[name], undefined, name);
});

test("every locked skill is committed and readable", () => {
  for (const name of Object.keys(lock))
    assert.ok(existsSync(path.join(root, ".agents/skills", name, "SKILL.md")), name);
  assert.ok(existsSync(path.join(root, ".claude/skills/start/SKILL.md")));
});
