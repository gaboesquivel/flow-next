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

- **Assistant** — `/`, `/api/chat`, `/api/mcp`, `/mcp`
- **Operator** — `/operator`, `/api/operator/chat`, `/api/mcp/operator` (requires `OPERATOR_ACCESS_TOKEN`)

Cross-template contract: [docs/INTEROP.md](./docs/INTEROP.md).

## Deploy

Vercel-first; `vercel.json` runs `pnpm build`. Set gateway and operator secrets in the project environment.
