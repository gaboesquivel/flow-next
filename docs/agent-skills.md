# Agent skills (template bundle)

This template ships a curated [Agent Skills](https://agentskills.io) lockfile for the stack in [baseline v2](https://github.com/gaboesquivel/flow-skills/blob/main/docs/specs/003-flow-templates-baseline-v2.md): Next.js, React, Eve, AI SDK / Gateway, OpenUI GenUI, MCP, shadcn, Vitest, Playwright, Portless, and Matt Pocock engineering skills for specs and implementation.

This is **not** the [Flow Skills](https://github.com/gaboesquivel/flow-skills) methodology catalog.

## Layout

| Path | Purpose |
| --- | --- |
| `.agents/skills-lock.json` | Pinned upstream skills and hashes |
| `.agents/skills/<name>/` | Symlinks for agents (after install) |
| `.agents/.agents/skills/<name>/` | Vendored skill trees (committed in the template) |

## Commands

```bash
pnpm skills:install   # refresh from lock (also runs in pnpm setup)
pnpm skills:update    # bump lock from upstream (maintainers)
```

After install, invoke skills explicitly in your agent host (for example `/to-spec`, or open `.agents/skills/eve/SKILL.md`).

## Curated skills

**Runtime and UI:** `ai-sdk`, `eve`, `typesafe-ai`, `nextjs`, `next-dev-loop`, `shadcn`, `building-components`, `nuqs`, `portless`, `vercel-cli`, `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`

**MCP and testing:** `mcp-builder`, `agent-browser`, `vitest`, `playwright`

**Engineering workflow (Matt Pocock):** `to-spec`, `to-tickets`, `implement`, `implement-spec`, `code-review`, `diagnosing-bugs`, `domain-modeling`, `grill-with-docs`, `grilling`, `prototype`, `research`, `retro`, `tdd`, `wayfinder`, `writing-for-agents`

**Process (Addy Osmani):** `documentation-and-adrs`, `spec-driven-development`, `incremental-implementation`, `test-driven-development`
