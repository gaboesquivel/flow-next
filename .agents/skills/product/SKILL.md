---
name: product
description: Check whether the product still matches its vision, users' problems, metrics, and roadmap, and what the metric evidence supports; read-only. Use when the user says "are we building the right thing", "has the product drifted", "measure our progress", or "how are our metrics doing".
disable-model-invocation: false
---

# Product

**Are we building the right thing, and what does the evidence say?** Compare what the product is with what it is meant to be, and each metric with the evidence you can reach. This is the what and the why, never the how: code quality is `review`, shaping a new idea is `explore`.

## Gather

A missing source is a finding, not a reason to stop or ask.

- **Intent:** `PRODUCT.md` (problem, users, core journeys, main and supporting metrics, kill criterion, riskiest assumptions, non-goals), `DESIGN.md` for journey steps, accepted specs and decisions, and any roadmap or `candidate` stubs. A Proposed record or draft spec is planned, not intended fact.
- **Reality:** code, routes, commands, and tests show what users can do; recent Git history shows where effort went. Never count a capability as implemented on a document's word alone.
- **Evidence:** metric data through whatever the host reaches: tools, local data, or exports the user supplies. Nothing is required. Measure only what is defined, and say when a definition is missing.

## Judge fit

Map each core journey and stated problem to the capabilities that serve it, each **implemented**, **partial**, **planned**, or **none**. Then:

- **Working:** journeys the implemented product serves. A shipped capability is not demonstrated value until evidence shows it.
- **Missing:** stated problems with nothing behind them, and metrics nothing in the product can observe.
- **Drift:** built work no stated problem asks for, or docs describing a product the code no longer is.
- **Complexity:** surfaces that cost more than the problem they serve.

## Judge each metric

- **Result:** baseline, current value, target, source, period, sample size, and limitations, with the calculation shown. Count each qualifying outcome once; an emitted event is not a successful outcome unless the definition says so.
- Compare only compatible definitions and populations; a before/after difference alone is not causation. Say when evidence is a fixture, sample, or test data.
- **Gap**, when there is no conclusion, blocking one first:
  - **Not collected:** nothing records it.
  - **Instrumentation missing or wrong:** raw data exists but nothing computes the metric, or collection misses, double-counts, or misattributes (for example human and agent traffic).
  - **No access:** the data likely exists but this session cannot reach it.
  - **Insufficient:** reachable but too small, short, or noisy.

**Unknown is never zero.** Missing access never hides what can be established; never invent a value. For each gap, name the smallest response: reuse existing collection, then a manual or export count, before any new service.

## Report

Lead with a visual (host UI, Mermaid, or a table): the journey-to-capability map, and a metric table (metric, result, target, source, gap) when there is more than one. Then working, missing, drift, and complexity in a few lines each, citing evidence (file, doc section, commit, or data source) and separating fact from inference. End with **up to three priorities** ranked by impact on the stated vision and metrics. Omit empty sections; say when intent is too thin to judge.

## Boundaries

Read-only: never edit, install tools, connect accounts, change tracking, or schedule work. Name the skill that would act (`flow`, `explore`, `to-spec`, `build`) and wait.
