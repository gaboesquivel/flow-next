# Eve agent runtime

Flow defines **how** teams build (skills under `.agents/skills/`). [Vercel Eve](https://vercel.com/eve) is the **default agent runtime** for durable product agents in this template. Official Eve docs ship in `node_modules/eve/docs/` and match the pinned `eve` version in `package.json`.

## Layout

| Path                         | Role                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| `agents/assistant/`          | Public Eve app: GenUI tools and demo data                             |
| `agents/operator/`           | Protected Eve app: same tools plus operator diagnostics               |
| `lib/agent-tools/`           | Shared typed tool implementations (`defineTool`)                      |
| `lib/agent-instrumentation/` | Shared OpenTelemetry policy for both Eve apps                         |
| `next.config.ts`             | `withEve(config, { eveRoot: "." })` mounts Eve into Next.js           |
| `.agents/skills/`            | Flow methodology and stack skills for IDE hosts (not copied into Eve) |

Each Eve app follows Eve conventions: `agent/agent.ts`, `agent/instructions.md`, `agent/tools/*.ts`, optional `agent/instrumentation/`.

## What runs where

| Surface                                   | Runtime                          | Purpose                                                |
| ----------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| `/api/mcp`, `/mcp`                        | MCP SDK + shared compose helpers | Streamable HTTP tools and MCP Apps preview for interop |
| `/api/chat`                               | Vercel AI SDK `streamText`       | Lightweight sidebar chat without a full agent loop     |
| `/api/operator/chat`, `/api/mcp/operator` | AI SDK chat + MCP with auth      | Operator diagnostics (see [INTEROP.md](./INTEROP.md))  |
| Eve sessions (CLI / future channels)      | Eve workflow                     | Durable turns, tool approval, subagents, schedules     |

Do not add a second agent framework. Extend Eve for agentic behavior; use the AI SDK only where streaming or structured output is enough.

## Local development

```bash
pnpm dev                 # Next.js via Portless (builds MCP app bundle)
pnpm build:agents        # eve build for each agents/* workspace
```

Work on one agent interactively:

```bash
cd agents/assistant
pnpm exec eve dev        # TUI, approvals, /traces
```

Model credentials: Gateway (`AI_GATEWAY_API_KEY` or Vercel OIDC on deploy), or `/login` in the Eve TUI. Override models with `EVE_AGENT_MODEL` and `EVE_OPERATOR_MODEL` (Gateway ids). For a fully local model, author a direct `LanguageModel` in `agent/agent.ts` per [Eve agent config](https://vercel.com/eve) (for example an OpenAI-compatible endpoint); Eve does not require a paid provider for local experimentation when you bring your own endpoint.

Optional zero-cost HTTP chat without Gateway: `FLOW_ALLOW_DIRECT_ANTHROPIC=1` and `ANTHROPIC_API_KEY` (sidebar routes only).

## Observability

- **Local:** `eve dev` records traces by default. Use `/traces` in the TUI or the local trace viewer Eve opens.
- **Hosted:** Vercel Agent Runs and AI Gateway session grouping when deployed on Vercel (see Eve docs on `gateway.sessionId`).
- **OpenTelemetry:** `agent/instrumentation/otel.ts` in each app re-exports `lib/agent-instrumentation/otel.ts`. By default, prompt and tool payloads are captured only in `development`; production spans still emit without raw content. Add `otelIntegration()` files per Eve docs to export to Honeycomb, Datadog, or other backends—do not build a custom dashboard in the template.

## Privacy and security

Traces and hosted run logs can include prompts, tool arguments, and tool results when capture policy allows. Treat Operator and production traces as sensitive. Operator MCP and web surfaces require `OPERATOR_SECRET` (≥16 characters) and **fail closed** when unset. The Operator Eve agent requires human approval the first time `generate_demo_data` runs in a session (`approval: once()`).

Never commit `.env.local`, API keys, or operator secrets. See `.env.example` for variable names only.

## Commands

| Command     | What it checks                                                    |
| ----------- | ----------------------------------------------------------------- |
| `pnpm eval` | Offline GenUI matrix + Eve tool smoke (`evals/eve-smoke.test.ts`) |
| `pnpm qa`   | Lint, types, unit tests (no live models)                          |

## Further reading

- [INTEROP.md](./INTEROP.md) — MCP tool names and auth contract with flow-mono
- [agent-skills.md](./agent-skills.md) — Flow Skills layout
- [flow-skills decision 0061](https://github.com/gaboesquivel/flow-skills/blob/main/docs/decisions/0061-eve-default-agent-runtime.md)
