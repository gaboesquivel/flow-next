---
name: review
description: Review work against intent, specs, and root context on five axes (correctness, readability, architecture, security, performance). Use when the user says "check it against the spec", "does this match the intent", or "alignment review".
disable-model-invocation: false
---

# Review

## Outcome

An independent read of the change against intent, the spec when there is one, and root context. The implementing agent is not this review.

**Proof.** For a spec, a verdict per acceptance scenario step: `satisfied`, `unmet`, or `unresolved`, each with evidence; without evidence it is `unresolved`, never `satisfied`. An `unmet` step is a blocking finding. Other unmet requirements are findings. Findings are ranked by impact.

One reviewer by default, separate from the implementing agent. Without separate execution, assess the axes in order and label the review **single-agent**; never claim independence or model diversity without it.

## Establish scope

Read repository instructions and inspect Git status. Outside a Git repository, review named files; when a diff is needed, offer `git init` and stop on a no.

Scope may be working tree, committed comparison, pull request, or spec (every task's change together). Escalated unspecced work uses this review against the request, without verdicts. Default to the working tree when unspecified. Ask only when scope ambiguity materially changes the work.

**Re-review** covers the commits since the last reviewed SHA and the findings they answer; earlier verdicts the fix did not touch stand. The new head becomes the reviewed head.

## Inspect

Recover intent from the request, spec, tests, and decisions. Assess every axis the change can affect:

- **Correctness:** intent match, regressions, failure paths, test coverage.
- **Readability and simplicity:** names, complexity, dead code.
- **Architecture:** boundaries, duplication, conventions.
- **Security:** trust boundaries, secrets, permissions.
- **Performance:** scaling, repeated I/O, blocking paths.

Read the reviewed commit without changing any checkout you did not create (for example `git show`, `git diff`, or a temporary worktree you remove when done).

For consequential changes, add proportional blast-radius checks when cheap tests or code can prove assumptions.

## Report

Open spec reviews with the scenario verdicts, then findings. Note stale root docs as findings. Review is read-only unless fixes are requested.
