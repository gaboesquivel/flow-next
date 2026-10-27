# flow-next ↔ flow-mono interoperability contract

Both templates implement [Flow Templates baseline v2](https://github.com/gaboesquivel/flow-skills/blob/main/docs/specs/003-flow-templates-baseline-v2.md). Keep these aligned when either repository changes.

## MCP

| Surface              | HTTP path           | Auth                                                               |
| -------------------- | ------------------- | ------------------------------------------------------------------ |
| Assistant (public)   | `/api/mcp`          | None                                                               |
| Public alias         | `/mcp`              | None (same handler as `/api/mcp`)                                  |
| Operator (protected) | `/api/mcp/operator` | Bearer `OPERATOR_SECRET`, `X-Operator-Secret`, or operator session |

MCP **server names** are template-specific (`flow-next` / `flow-mono` and `*-operator`); **tool names** below are shared.

## Public MCP tool names

- `health`
- `list_component_catalog`
- `compose_ui`

## Operator-only MCP tool names

- `operator_health`
- `config_status`
- `public_tool_catalog`

Public discovery (OpenAPI, `.well-known`, server card) must list **public** tools only.

## Environment variables

| Variable             | Purpose                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| `OPERATOR_SECRET`    | Enables Operator MCP (and flow-next web console) when ≥16 chars; fail-closed if unset |
| `AI_GATEWAY_API_KEY` | GenUI compose via Vercel AI Gateway                                                   |
| `ANTHROPIC_API_KEY`  | Optional direct chat for Assistant/Operator HTTP chat                                 |
| `EVE_AGENT_MODEL`    | Eve default model override                                                            |
| `TYPESAFE_API_KEY`   | Optional compose routing                                                              |
| `GENUI_MODEL`        | Optional compose model override                                                       |

`OPERATOR_ACCESS_TOKEN` is accepted in **flow-next** only as a deprecated alias for `OPERATOR_SECRET`.

## Template differences

| Capability                         | flow-next          | flow-mono            |
| ---------------------------------- | ------------------ | -------------------- |
| Operator web console (`/operator`) | Yes                | Not yet              |
| Layout                             | Single Next.js app | Turborepo `apps/web` |

## Demo behavior

- GenUI compose uses synthetic fixtures (no database).
- Assistant home demonstrates compose + public MCP catalog.
- Operator diagnostics via MCP on both; flow-next also exposes protected HTTP chat behind the same secret.
