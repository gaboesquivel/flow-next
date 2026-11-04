---
name: flow
description: Align the project's PRODUCT.md, DESIGN.md, GLOSSARY.md, and ARCHITECTURE.md after meaningful changes, and write the Flow block on request. Use when the user says "update the docs", "sync the docs", or "set up Flow here".
disable-model-invocation: false
---

# Flow

**Preserve intent** for the project you are in. Align its root context when work changes what that product is, how it behaves, how it is built, or how the team names important concepts. This skill runs no other skill, authorizes no implementation, and is not project initialization (`start` is).

## Whose product

- **Adopter project:** `PRODUCT.md` is that project's product identity. Update only the sections the change affected.
- **This flow-skills repository:** `PRODUCT.md` is Flow's methodology identity. Do not copy it into another repository.

Never replace a project's product identity with Flow's tagline, mission, principles, or strategic chain, or scaffold starter trees or a Flow-branded `PRODUCT.md`.

## Process

1. Read `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when present. Read `docs/specs/` and `docs/decisions/` records only when they clarify the area. Align root files to accepted intent only; a draft spec or Proposed decision is labeled as a proposal, never written in as current (`write-agents` Context freshness).
2. Update only affected sections, one writer per root file. Keep `DESIGN.md` consistent with what shipped; choosing a new visual direction is `design`'s. Keep one home per fact; link instead of duplicating.
3. Create a root file only when it would hold meaningful content. No empty trees, methodology boilerplate, or parallel trackers (no PRD/PDR/ADR folders).

**Goals.** When `PRODUCT.md` is missing or has no brief (problem, who, riskiest assumption, main metric and kill criterion, core journeys), align what exists and name `explore` once as the next step.

## Flow block

"Set up Flow here" opts the project into Flow mode; deleting the block opts out. The block needs Git: outside a repository, offer `git init` and stop on a no.

**Delivery.** The mode is inferred (`build`'s Delivery mode), so the block's `Delivery:` line is an optional override: write it only when the user names `local` or `github`, and keep a recorded one unless the user names another. Never ask for it.

**Write** with [`lib/flow-block.mjs`](lib/flow-block.mjs): `node <skill-dir>/lib/flow-block.mjs <absolute-project-path> [local|github]`. The helper owns the layout: which file holds the block, the `@AGENTS.md` import, markers, the pointer, keeping the recorded value, and refusing malformed markers or symlinked, out-of-project, or shared instruction files. Never touch text outside the markers and that import line. Report its output and relay any warning.

## Boundaries

- Edit adopter instruction files only for the Flow block and the `@AGENTS.md` import, and write the block only when the user asks or `start` runs.
- Alignment edits are not permission to implement unrelated code; that is `build`.
- Never write a session registry, live roster, or shared progress log; coordination is Git evidence.
- Create no `docs/specs/` or `docs/decisions/` records here; that is `to-spec` or explicit decision work.

## Completion

State which root files changed and whose product they now reflect. Note unresolved assumptions and whether a spec or decision record may be wanted.
