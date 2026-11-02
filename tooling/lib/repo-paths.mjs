import path from "node:path";

/** Repository root (parent of `tooling/`) */
export const repoRoot = path.resolve(import.meta.dirname, "..", "..");
