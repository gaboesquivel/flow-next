# flow-next ↔ flow-mono interoperability contract

Both templates implement [Flow Templates baseline v2](https://github.com/gaboesquivel/flow-skills/blob/main/docs/specs/003-flow-templates-baseline-v2.md). Keep these aligned when either repository changes.

## MCP

| Surface              | HTTP path           | Auth                                                      |
| -------------------- | ------------------- | --------------------------------------------------------- |
| Assistant (public)   | `/api/mcp`          | None                                                      |
| Public alias         | `/mcp`              | None (same handler as `/api/mcp`)                         |
| Operator (protected) | `/api/mcp/operator` | Bearer `OPERATOR_ACCESS_TOKEN` or operator session cookie |

## Public MCP tool names

- `health`
- `list_component_catalog`
- `compose_ui`

## Operator-only MCP tool names

- `get_diagnostics`
- `get_config_status`

Public discovery (OpenAPI, `.well-known`, server card) must list **public** tools only.

## Environment variables

| Variable                | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `OPERATOR_ACCESS_TOKEN` | Enables Operator web, chat, and MCP when ≥16 chars; unset = fail-closed |
| `AI_GATEWAY_API_KEY`    | GenUI compose via Vercel AI Gateway                                     |
| `ANTHROPIC_API_KEY`     | Optional direct chat for Assistant/Operator HTTP chat                   |
| `EVE_AGENT_MODEL`       | Eve default model override                                              |
| `TYPESAFE_API_KEY`      | Optional compose routing                                                |
| `GENUI_MODEL`           | Optional compose model override                                         |

## Demo behavior

- GenUI compose uses synthetic fixtures (no database).
- Assistant home demonstrates compose + public MCP catalog.
- Operator console reuses the GenUI studio behind server-verified access.
