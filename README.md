# flow-next

Single-app agentic Next.js template: public Assistant, protected Operator, Eve, OpenUI Lang GenUI, MCP Streamable HTTP, and MCP Apps.

## Quick start

```bash
pnpm setup
pnpm dev
```

Open the Portless URL (default host `flow-next.localhost`). Configure `.env.local` from `.env.example`.

## Scripts

| Script       | Purpose                                      |
| ------------ | -------------------------------------------- |
| `pnpm setup` | Prerequisites + non-destructive `.env.local` |
| `pnpm dev`   | Development via Portless                     |
| `pnpm qa`    | Lint, types, tests                           |
| `pnpm build` | Production build (includes MCP App bundle)   |
| `pnpm eval`  | Offline GenUI eval + Eve tool smoke          |

## Surfaces

- **Assistant** — `/`, `/genui`, `/api/chat`, `/api/mcp`, `/mcp`
- **Operator** — `/operator`, `/api/operator/chat`, `/api/mcp/operator` (requires `OPERATOR_SECRET`)

Cross-template contract: [docs/INTEROP.md](./docs/INTEROP.md).

Agent skills for this stack: [docs/agent-skills.md](./docs/agent-skills.md).

`AGENTS.md` is committed. When `next dev` detects an AI coding agent, it writes the Next.js block between its `nextjs-agent-rules` markers and keeps everything else; add project instructions outside those markers. Set `agentRules: false` in `next.config.ts` to have `next dev` remove the block. `CLAUDE.md` imports `AGENTS.md`.

## Deploy

Vercel-first; `vercel.json` runs `pnpm build`. Set gateway and operator secrets in the project environment.
