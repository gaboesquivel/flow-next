# flow-next

Single-app agentic Next.js template (App Router, Eve, OpenUI GenUI, MCP). Node 24+, pnpm from `packageManager`.

## Commands

| Command               | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `pnpm setup`          | Dependencies, `.env.local`, optional Neon (`FLOW_PRESET`) |
| `pnpm dev`            | Development via Portless (`pnpm dev:app` for `next dev`)  |
| `pnpm qa`             | Lint, types, tests                                        |
| `pnpm lint:fix`       | Fix lint and format in place                              |
| `pnpm test`           | MCP App bundle, Vitest, node tests                        |
| `pnpm security:check` | Tracked secret-file check and dependency audit            |
| `pnpm build`          | Production build (includes the MCP App bundle)            |
| `pnpm eval`           | Offline GenUI eval and Eve tool smoke (on demand, not CI) |
| `pnpm db:migrate`     | Push the Drizzle schema to `DATABASE_URL`                 |
| `pnpm skills:update`  | Refresh committed skills from their sources (maintainers) |

## Tools

Prefer a CLI (`gh`, `vercel`, `pnpm`), then an MCP server, then a REST API, then the browser.

## Context

- Product context: `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md` at the root once `start` creates them; `README.md` and `docs/` until then.
- Skills: `.agents/skills/` (Flow methodology plus stack skills), linked from `.claude/skills`; see [docs/agent-skills.md](docs/agent-skills.md).
- Delivery follows Flow's `build` and `ship` skills: one draft pull request per spec; drafts run no CI, marking it ready runs the checks, and Vercel previews are explicit (`vercel deploy`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
