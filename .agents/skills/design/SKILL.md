---
name: design
description: Compare visual directions, let the user choose, and record the chosen identity in DESIGN.md; prototype layout variants or a throwaway spike. Use when the user says "design this", "what should it look like", "prototype this", or "spike it".
disable-model-invocation: false
---

# Design

## Outcome

"Design this" ends with a visual direction the user chose from real alternatives, recorded in root `DESIGN.md`. Design owns identity (name, mark, color, type) and the look of a surface. It writes `DESIGN.md`, the canonical assets, and the theme token values the app already keeps, so record and code agree; restyling pages is `build`.

Skip it when a change fits the existing `DESIGN.md`: build it following that file. A recorded identity is extended; reopening it is a direction change only the user starts. Product intent is `explore`'s; a spike answering one question skips to [Prototypes](#prototypes).

## Read first

Read `PRODUCT.md` (the authority for purpose, users, and journeys), `DESIGN.md`, the tokens, theme, and brand assets already in code, and user references. A missing `DESIGN.md` does not erase the evidence in code. With no product brief, work from the stated intent; never block on it.

## Brief

State a short design brief: the surface and its purpose, what it must convey, constraints (existing tokens, accessibility, the sizes it renders at), and what to avoid. Ask only what stays open, in one round, including where to save explorations (a folder the project already uses, else `docs/design/`) and whether it is tracked. With nothing open, continue without waiting.

## Alternatives

Produce two to four directions that differ in concept, not only in color, in parallel when they take real work. For each: a name, the idea in one line, how it serves the brief, and its risks.

Render each so the user can judge it by eye (an image, an HTML or SVG page, a design tool, or [variants on the real route](#prototypes) for a page layout). Show it in context, never in a vacuum: an identity on the same real screen for every direction, plus the mark at 16 and 32 px and in a header, light and dark; a page at phone and desktop width with real content.

Look at each render before showing it, or say it was not seen; check contrast, small sizes, and that no mark reads as another brand.

Save exploration files where the user chose. They are evidence, never a second design authority: `DESIGN.md` holds the approved direction.

## Choose

Compare the directions against the brief; recommend one with reasons. The user chooses, combines, or asks for another round; the agent never selects. An explicit yes to the shown direction is approval.

## Record

On approval, update `DESIGN.md`, keeping its existing sections (create it when missing): purpose and expression, identity (name, concept, canonical asset paths), tokens with roles, type, usage rules and what to avoid, and how to check rendered output. Write rules an agent can verify: why each exists, how to tell whether a screen meets it, and which a check enforces versus which need someone to look; name a missing check as work for `build`. Keep one surface's detail in a linked file. Record only the approved direction: alternatives and history stay out, with no separate decision record unless the user asks. Product goals stay in `PRODUCT.md`; link to them.

Commit the canonical assets and set the token values in the app's existing theme, one source every surface reads. When cheap, name a check that asset variants (favicon, icons, social image) match that source as work for `build`. When the direction replaces a name, mark, or token, list every surface still showing the old one (pages, icons, titles, metadata) for `build`.

Write on the work's branch; on the default branch, cut one (for example `design/identity`). Commit only these writes and any explorations the user chose to track.

## Prototypes

On "prototype this" or "spike it", state the question and the observation that would answer it, then build the smallest throwaway that shows it. Mark it experimental and use in-memory or stub data, never live mutations or credentials.

- **Layout or interaction:** render two to five structurally different variants (layout, hierarchy, primary affordance; color alone is a tweak) on the real route, gated by `?variant=`, keeping the page's data fetching and swapping only the rendered subtree. Use a new route, named `prototype`, only when nothing existing can host it. Add a floating switcher that cycles variants through the URL (arrow keys too, not while a field has focus) and is hidden in production builds. Hand over the URL and keys.
- **Logic, state, or API:** a throwaway script or one self-contained HTML file answering one question, with the logic in a pure module the page only calls, so it can be lifted later. No tests, framework, or generalising.

Record the answer and its limits where the project keeps such evidence. Committing, promoting, or publishing a prototype needs its own authorization, and promoted code is rewritten to production standards.

## Completion

Report the chosen direction, the `DESIGN.md` sections and assets written, the branch and commit, the surfaces left to apply, and what was not verified (for example trademark clearance or recognition testing). Name "build it" as the next step and wait.
