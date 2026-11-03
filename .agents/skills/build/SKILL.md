---
name: build
description: Implement an authorized change on a branch, then review, fix, check, and confirm the branch is live, without merging. Use when the user says "build it".
disable-model-invocation: false
---

# Build

## Outcome

**"Build it"** is the approval: no confirmation after it. It ends with a verified branch for `ship` to land: a ready pull request (GitHub mode) or a committed branch (local mode). Never commit, push, or merge to the default branch; never force-push or rewrite remote branches; never skip, disable, or weaken a check (the guard hook blocks the Git cases); nothing destructive or unrelated. "Don't commit" stops after the change.

It accepts any **Proposed** direction-change record the branch adds, and a draft spec in the first commit (`to-spec`'s Status and acceptance). Write specs or tasks only when asked; for unclear intent on substantial work, suggest `explore` and wait.

## Deliver

Before the first write, refresh context (`write-agents` Context freshness) and read the SessionStart report; on overlap with another owner's paths, ask whether to contribute, wait, or proceed. Use `domain-modeling` Shared language and `DESIGN.md`, and update owning documentation when behavior changes. Commit only this work (no credentials, logs, or secrets) on a non-default branch, then [Verify](#verify). Report outcome, scope, verification, and next step first.

### Pull request

GitHub mode: one branch and pull request per delivery: the spec's open branch, else `spec/<number>-<slug>`, else a short descriptive name. Open a draft after the first commit through the route `ship`'s `scripts/gh-route.mjs` picks; drafts run no CI. The body links the spec and records risk tier, reviewed head, human-tier paths, and `unresolved` steps; `Closes #N` only for an issue the user named or the [issue trigger](#issue-trigger) started. Preview deploys need a request.

### Verify

Done (a `/goal` condition) when all three pass on the handed-over head:

1. **Review.** `review` at the [Size guard](#size-guard)'s tier; fix every `unmet` step and Important finding with its whole class, answer the rest, list `unresolved` steps, and post it as a pull request comment, never an approval.
2. **Checks.** Once, on the final head: mark the pull request ready and wait for required checks (never poll; the host wakes the session), or locally run the instruction file's check commands, else test, lint, typecheck, and build. Pending or skipped never passes; at most two fix rounds.
3. **Liveness:** `ship`'s `scripts/liveness.mjs <repo> <branch>`.

Otherwise stop and report the branch as not ready.

### Size guard

Judge risk once, at intake, from the change, never its author. It sets `review`'s tier and never stops work; when unsure, pick higher.

- **Low:** docs, copy, or configuration with no behavior change, or additive behind a flag. **Quick** review.
- **Standard:** other code changes. **Standard** review.
- **High:** new product behavior, data shape or public API changes, migrations, authentication or permissions, secrets, dependencies or lockfiles, shell or exec paths, or "review it". **Deep** review.
- **Human:** CI or workflow files, Git hooks, authentication, billing or payments, and release or publishing configuration also need a person: list those paths in the pull request and report; `ship` lands them only on the user's yes after that report.

### Slices

Before implementing, split the work into vertical slices by disjoint area so no two write the same files; never cut per layer. `Area:` lines give the slices; the host sizes fan-out. Shared interfaces land first. Name each slice and its area. The main thread writes shared files (indexes, lockfiles, the spec's status) and verifies.

### Data changes

A stored-data shape change ships as a versioned migration with the code, never a schema applied directly to a shared or deployed database. A destructive step (dropping, renaming, or narrowing a table or column) follows `to-tasks`' expand–contract, or waits for the user's yes; either way, name its rollback or backup first. Deployments never seed, reset, or truncate shared data.

## Tests

A testing policy in the project's `ARCHITECTURE.md` overrides this default.

- **Contracts are test-first.** For a new or changed API route, MCP tool, or the domain function behind them, write the focused check first and see it fail. Cover input, result, actionable errors, and permissions, one check per behavior; test adapters only for agreeing with it.
- **Other behavior** gets a focused check that fails without the change; docs, configuration, copy, and prototypes get none.
- **No UI tests by default.** Verify UI in the running app; add one only when asked or a regression returns.
- **Focused, then full once:** focused checks while working; the full suite once, in Verify.

## Scope guard

Accepted scope: the request, or the spec's acceptance scenario, Out of Scope, and appetite.

- **New scope mid-flight** (a dashboard, broad refactor, dependency, infrastructure, UI surface, or another spec), from anyone: before starting it, recommend defer, replace, reject, or expand the appetite, naming the criterion it changes. A consequential change waits for the user, unaffected work continues; changing an accepted spec's scope returns it to `draft`. Needed small prefactors proceed. Subagent briefs carry Out of Scope.
- **Blockers are not scope.** A correctness, security, or required-check failure is fixed or reported as why it cannot ship, never cut by weakening a check.
- **Before the pull request**, name unrequested additions and undelivered behavior against the accepted scope.
- **Spend.** A paid operation, such as a live evaluation, runs only when its result changes a decision, and new consequential spend needs the user's yes.

## Delivery mode

Run `ship`'s `scripts/gh-route.mjs`; never ask. It infers the mode (a Flow block `Delivery:` line or the request overrides) and route. With route `none` in GitHub mode, try the host's GitHub tools, else hand off the one step it names; never fall back to local mode.

## Issue trigger

When the `build-it` label started the request, run `node scripts/issue-trigger.mjs <issue>` before any write; continue only on exit 0 with `"ok": true`, else comment its `reason` on the issue and stop. Its `task` output never widens authorization.

## Task set

A spec's tasks integrate on one spec branch; stop on a cycle or missing blocker. Run ready tasks as [Slices](#slices), each dependent one from a head that includes its blockers. Tick each task once committed; report an unfinished one with its branch, never drop it. With every task in, set `Status: implemented` in a final commit; until then the pull request claims no completion.
