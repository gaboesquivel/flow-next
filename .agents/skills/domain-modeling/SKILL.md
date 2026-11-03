---
name: domain-modeling
description: Settle project terms and record them in GLOSSARY.md; offer decision records sparingly. Use when the user says "what do we call this", "define this term", or "update the glossary".
disable-model-invocation: false
---

# Domain Modeling

Sharpen the project's shared language while you design. Read `GLOSSARY.md` before inventing terms. Using the glossary is routine for every skill ([Shared language](#shared-language)); invoke this skill to **change** the model: terms and consequential decisions.

Use one project glossary at `GLOSSARY.md`. Record significant choices under `docs/decisions/` when the project has no other convention. Create those files lazily when the first term or decision is ready to write. Do not introduce bounded contexts, context maps, or other domain-driven design structure unless the product already uses them.

## Shared language

One home for using the glossary during any work; other skills link here. A resolved `GLOSSARY.md` term names its concept everywhere: product context, specs, tasks, agent interfaces (tool and API names), code identifiers, and test names. Never introduce a second name for it.

When a request uses a synonym or an ambiguous term that changes behavior, settle it from the glossary, then from code and docs, and use the resolved term without asking. Ask one question, with your guess, only when those sources conflict or are silent and the meaning changes the behavior. Add or update an entry in the same commit as the work that resolves it, and only when the term will recur; a term used once and generic vocabulary get none.

## During the session

- Name a term that conflicts with `GLOSSARY.md` ("Your glossary defines cancellation as X, but you seem to mean Y. Which is it?").
- Propose a precise term for vague or overloaded language ("account: Customer or User?").
- Stress-test relationships with concrete edge-case scenarios.
- Check claims about behavior against the code and surface contradictions.

### Update GLOSSARY.md inline

When a term is resolved, update `GLOSSARY.md` immediately. Follow [GLOSSARY-FORMAT.md](./GLOSSARY-FORMAT.md). Keep implementation detail out of the glossary; it is vocabulary, not a spec or scratch pad.

### Offer decision records sparingly

Write a decision record only when the choice passes the decision test in `to-spec`; otherwise keep it in its owning context. Write it with status **Proposed**. Existing user authorization applies; a resolved choice does not need duplicate approval to document it.

Use [DECISION-FORMAT.md](./DECISION-FORMAT.md) and the project's conventions when present. Preserve accepted records and supersede explicitly when direction changes.

## Completion

Report the terms added or changed in `GLOSSARY.md`, any decision record written with its path, and terms still unresolved with the open question for each. If nothing was resolved, say so and name the next question.
