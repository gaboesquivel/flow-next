---
name: explore
description: Understand the problem, users, and open questions before planning or building, interviewing with a guess on each question or stress-testing a plan. Use when the user says "explore this", "what are we missing", "interview me", "ask me questions", "grill me", "grill this", or "poke holes in it".
disable-model-invocation: false
---

# Explore

Learn what the user wants, test whether it holds up, and record what is durable. Recover facts with tools; ask only about intent and choices you cannot infer.

## Read first

While the first question waits, read the sources that exist: root context, relevant code, glossary, and the decisions and specs the request may conflict with, each labeled by status and location (`write-agents` Context freshness). Subagents never ask the user.

## Direction changes

This is the gate's one home. When the user's goal would reverse or narrow an Accepted decision, an accepted or implemented spec, or a `PRODUCT.md` fact, stop: name each conflicting file, quote its position, say whether the change supersedes or amends it, and continue only on an explicit yes. Candidate and draft specs and Proposed decisions do not gate; when unsure, name the possible conflict in one line and continue. On a no, explore within the current direction.

On the yes, changing an Accepted decision gets a new decision record with status **Proposed** and `Supersedes [NNNN]` or `Amends [NNNN]` (with scope) on its Status line. A conflict only with a spec or `PRODUCT.md` gets a record only when it passes `to-spec`'s decision test. Show the record with the brief and write it on the same yes; a killed run writes none. Never edit the old record, spec, or `PRODUCT.md` here: `to-spec` (or `build`, with no spec) writes the back-pointers.

## Proportion

Match the request; never ask for depth.

- **Fix or small change:** no questions and no writes beyond the gate; hand back.
- **Feature:** clear intent, the journeys it changes (one line each), agent users or "none", the metric it should move, if any, and the delivery constraint: appetite (a time target), first verifiable increment, non-goals, and any material model or infrastructure cost limit. Ask at most two questions, for what is missing and consequential. They belong to the increment, never to `PRODUCT.md`.
- **New product:** the feature's items plus the vision and core journeys, which may be broad; the **first useful release**, the outcome that makes it worth using; a stress test (below), short when the vision is settled; one main metric ("unknown, measure first" is acceptable); and alternatives including the status quo.

**Metrics.** Keep existing definitions. Define a new one by the journey outcome it observes, what counts, population, window, source, baseline (or "unknown"), and target; an unevidenced target is a hypothesis.

## Questions

Ask when who it is for, why now, success, or the binding constraint is missing and you would otherwise fill it in silently.

- Open with a one-sentence hypothesis of what the user wants and an honest confidence percentage; below about 70%, name what is missing. Update both as you go.
- Put **a guess on each question**, with its reasoning. Open questions go one per message; batch up to three closed ones per form in the host's question UI, marking your guess and each option's tradeoff. Sometimes leave a guess unmarked or guess where you expect pushback, so agreement is not mere politeness.
- When an answer sounds like what a good answer should (buzzwords, "I should probably"), ask what they would want without justifying it. Re-ask "whatever you think" as a choice between two concrete options.
- Stop when you can predict the user's reaction to the next three questions. If confidence stops rising, say so and suggest stepping back.

When the user asked only to be interviewed, restate intent in their words, one line each: outcome, user, why now, success, constraint, out of scope. "Sounds good" or silence is not a yes; ask what they would refine.

## Stress test

For a new product, or on "grill" or "poke holes". With intent clear, do not re-extract it; challenge only the riskiest claims.

- **Pre-mortem**, once: assume it failed six months from now and list the likeliest reasons. From them name the riskiest assumptions, each with a confidence, and a **kill criterion**: the observation that would end the work.
- Gather evidence for each risky claim, then ask a small round of focused questions, each with a recommended answer and its tradeoff. Stop when outcome, constraints, and next action are clear; never re-approve settled decisions.

When a new surface's look is not settled by `DESIGN.md`, suggest `design` in one line.

## Outcome and write gate

End in one outcome, all valid: **brief**, **clearer** (intent sharpened; writes only a confirmed direction-change record), or **killed** (writes nothing).

For a brief, show the exact text once and ask once:

- **New product:** the full `PRODUCT.md` brief: problem, who (including agent users or "none"), why now, riskiest assumptions with confidence, main metric and kill criterion, core journeys (one line each; steps belong in `DESIGN.md`), first useful release, alternatives, out of scope.
- **Feature:** a diff of durable product facts only (a new user, journey, or metric); with no `PRODUCT.md`, propose creating it.

Label unproven items hypotheses. An explicit yes to the shown text authorizes that write in the same turn; fold corrections in and show it again.

**Branch.** Write on one non-default branch named for the work; commit only these writes and report branch and commit.

**After `start`.** Write nothing until the bootstrap reports its initial commit, even after a yes; then branch from it, and the yes carries over. The brief replaces the baseline `PRODUCT.md`'s product sections and keeps its template facts. If the bootstrap failed, keep everything in conversation.

## Spec-ready

Spec-ready when the brief is confirmed and committed and, for a new product, the first useful release, riskiest assumption, and kill criterion are named; otherwise say what is missing. Close with known facts, open assumptions, guesses accepted unchanged, and the next step ("build it", or `to-spec` for tracked work), and wait.

**New product specs.** Only on "spec it", `to-spec` bounds the first useful release: the active spec in full, later ones as `candidate` stubs. A spec tests an assumption when one is consequential, and metric instrumentation is proportional: manual or existing measurement can come first. With agent users in the brief, define their capabilities contract-first, with an MCP tool.

Discussion, interviews, and stress tests do not authorize implementation.
