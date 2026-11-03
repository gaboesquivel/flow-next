---
name: council
description: Get independent expert views and an evidence-based synthesis on a consequential decision; advisory only. Use when the user says "ask the council", "get a second opinion", or "what would experts say".
disable-model-invocation: false
---

# Council

Improve decision quality through independent, adversarial expert review. Advisory only: it does not implement, approve, or change decisions.

**Quick** (default): three perspectives, one round. **Deep** ("deep council"): up to five perspectives, then one rebuttal round per material disagreement, each seeing only the findings it answers. **Review** ("council review of the spec"): the subject is a spec or file.

## Evidence packet

Read the relevant specs, decision records, implementation, and constraints. Build one shared packet that states the decision under review and separates accepted requirements from assumptions and proposals. Every reviewer starts from it, without the others' conclusions. Ask any clarifying question before reviewers launch.

## Reviewers

Pick specialists for the question (product value, UX, architecture, reliability, security, a simpler alternative). At least one seat is adversarial: it challenges the proposal and the user's and agent's assumptions. Each reviewer returns:

1. Recommendation.
2. Supporting evidence.
3. Assumptions and uncertainty.
4. Risks and trade-offs.
5. Strongest viable alternative.
6. What evidence would change the recommendation.

The host runs the reviewers. Without separate contexts, label the result a single-agent multi-perspective analysis; never claim independence that did not happen.

## Synthesis

Weigh arguments and evidence, not votes. Report:

- **Verdict:** one recommendation and its evidential confidence.
- **Consensus:** findings independently produced reviews support.
- **Disagreements:** conflicting conclusions and why they differ.
- **Risks and alternatives:** failure modes and the simplest viable option.
- **Next action:** one concrete step.
- **Execution:** actual reviewers, model identifiers, evidence inspected, and limits.

## Restrictions

Read-only: no product code, tasks, or specs unless asked. Never fabricate findings or citations. A recommended choice that passes `to-spec`'s decision-record test may be recorded under `docs/decisions/` as **Proposed** only. Council completion never implies approval.
