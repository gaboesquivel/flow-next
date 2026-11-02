import { readFileSync } from "node:fs";

// Markdown at the repository root or under docs/. Nothing in the app, tests, or build reads
// these files, so a change limited to them cannot change the production build.
// Skill and agent markdown (.agents/, agents/) is read by tests and Eve, so it never counts.
const docsPath = /^(?:[^/]+|docs\/.+)\.md$/u;

/** True when every changed path is documentation; an empty list is never docs-only. */
export function isDocsOnly(paths) {
  const files = paths.map((file) => file.trim()).filter(Boolean);
  return files.length > 0 && files.every((file) => docsPath.test(file));
}

// CLI: reads changed paths (one per line) on stdin and prints `docs_only=true|false`.
if (import.meta.url === `file://${process.argv[1]}`) {
  const paths = readFileSync(0, "utf-8").split("\n");
  console.log(`docs_only=${isDocsOnly(paths)}`);
}
