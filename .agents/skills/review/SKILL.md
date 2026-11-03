---
name: review
description: Review work in a fresh context against intent, the spec, and root context, on top of /code-review, and repair confirmed defects; "review only" stays read-only. Use when the user says "review it", "check it against the spec", or "does this match the intent".
disable-model-invocation: false
---

# Review

## Outcome

"Review it" gets an independent read and ends in repaired work: confirmed defects fixed and verified, or left `unresolved` with the reason. The author is never the reviewer. A spec's proof is a verdict on each acceptance scenario step (`satisfied`, `unmet`, or `unresolved`), each with evidence.

Claude Code's `/code-review` hunts bugs and `/security-review` checks trust boundaries. The plugin's [`flow-reviewer`](https://github.com/gaboesquivel/flow-skills/blob/main/agents/flow-reviewer.md) agent runs them and adds Flow's checks. Without that agent or `/code-review`, run these steps yourself and label the review **single-agent**.

## Effort

`build`'s Size guard picks the tier from the change, never its author; "review it" runs Deep. Tiers map to `/code-review` levels: Quick → `low`, Standard → `medium`, Deep → `high`.

## Inspect

Scope: the working tree by default, or a branch, pull request, or spec. Run `flow-reviewer` with head, tier, and spec or request. It adds:

- scenario verdicts: no evidence means `unresolved`, and `unmet` is Important
- scope against `build`'s Scope guard
- names against `GLOSSARY.md`
- `DESIGN.md` and UI basics when the diff changes UI

Findings cite `file:line`: Important (blocks), Nit (at most three), or Pre-existing (never blocks).

## Repair

Fix each Important finding and `unmet` step on the branch, covering its whole bug class, with a check that fails without the fix. Answer every other finding: fixed, or resolved with reason. "Review only" or "don't fix" stays read-only. Inside `build`, the main thread repairs. A re-review covers only the new diff and never repeats a finding. After three rounds with an Important finding open, stop patching and rethink the approach; fix a recurring finding at its source (a lint rule, skill, or `AGENTS.md`).

## Report

A count ("2 Important, 1 Nit"), then scenario verdicts, findings by severity, repairs, and open items. On GitHub, post it as a comment, never an approval.
