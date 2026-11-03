---
name: to-spec
description: Turn the conversation into a numbered draft spec using project conventions, and accept it when approved. Use when the user says "spec it", "write a spec", "share the draft", or "accept the spec".
disable-model-invocation: false
---

# To Spec

Turn the conversation into a proportionate spec, labelling assumptions instead of inventing decisions.

Use the project's spec location, else `docs/specs/NNN-short-name.md`, numbered by `node <skill-dir>/scripts/next-number.mjs` (fetch first). Commit on the work's branch (else a new `spec/<number>-<slug>`), never the default branch.

**One bet.** A spec tests one assumption and ships as one unit; split only when a part proves something or ships safely alone, exceeds one appetite, or needs an earlier part's learning. A choice gets a decision record (`docs/decisions/NNNN-short-name.md`) only when it chose among real alternatives **and** reaches beyond this spec or is costly to reverse; otherwise it is a Decisions bullet. Records never hold scope or tasks. Write a needed record as **Proposed** and link it.

**Length.** About 1,000 words at most: link records, glossary, and code instead of restating them; split a bet that does not fit. A later bet gets a **candidate** stub: the problem and the assumption it tests.

Open no issues unless asked; the pull request closes an issue the user named (`Closes #N`).

## Status and acceptance

The status line is `Status: <candidate|draft|accepted|implemented|dropped> (YYYY-MM-DD).`, with an optional `Appetite: <time target>.`, never history beyond back-pointers. `build` sets `implemented` once every task integrates; `ship` sets it if missing, or drops a spec.

Writing a draft is not acceptance. **Acceptance** happens in one commit on "accept the spec", or as the first commit of "build it" or "ship it" on a draft:

- Set the spec to `accepted` and each linked record from **Proposed** to **Accepted**, dated.
- Back-pointers, never earlier: for each linked record that supersedes or amends an older one, append `Superseded by`, `Superseded in part by`, or `Amended by [NNNN]` with a short scope to the older record's Status line (or `superseded_by`), index row, and each changed spec; update each contradicted `PRODUCT.md` fact. A direction-change Decisions bullet gets the same, linking the spec.

A draft without an acceptance scenario, or without **Exposure** when it adds deployable behaviour, stays `draft`: name what is missing and stop. A `candidate` must become a full draft first. Changing an accepted spec's scope or a linked decision returns it to `draft`.

**Share the draft:** push the branch and open a draft pull request linking the spec (`build` reuses it), noting a public repository; locally, report the file.

## Process

1. Explore only what the conversation lacks (specs, decisions, tests, terms per `domain-modeling` Shared language), and sketch test seams, preferring existing high-level ones. Reversing or narrowing an Accepted decision, accepted spec, or `PRODUCT.md` fact needs an explicit yes (`explore`'s Direction changes) unless already confirmed.
2. Commit the spec as `draft` and any record as **Proposed**, publishing nothing and asking nothing; report the files, open assumptions, and next step: "build it", "accept the spec", or "share the draft".

<spec-template>

## Problem

Who is affected, what fails today, and the evidence.

## Solution

The change, from the user's side.

## Decisions

Only choices that shape execution, contract-first: typed API, MCP tools when agents are users, and errors and permissions an agent can act on.

**Exposure** (required for deployable behaviour): where it runs, who can reach it, and how writes behave without authentication; with authentication out of scope, writes fail closed.

**Appetite** (substantial work): the first verifiable slice, what gives way first, and any material cost limit.

A confirmed direction change without a record: the file, old position, new one.

## Acceptance

**Acceptance scenario** (required; `review` gives each step a verdict): the actor, the starting state with realistic data, and numbered steps with observable results; for agent users, also through the MCP tool. A metric the work should move gets a step proving it counts correctly.

Then invariants, each with the focused check proving it (seam and command), per `build` Tests.

## Out of Scope

What this increment does not include.

## Tasks

Written by `to-tasks`.

</spec-template>
