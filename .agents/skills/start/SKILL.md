---
name: start
description: Initialize a new project from flow-next or flow-mono with verified setup, renamed identity, and an independent initial Git commit, while explore shapes the product. Use when the user says "start a Next.js project", "start a new project", or "start a monorepo".
disable-model-invocation: false
---

# Start

**New product.** Initialize a **new application** from [flow-next](https://github.com/gaboesquivel/flow-next) or [flow-mono](https://github.com/gaboesquivel/flow-mono) while `explore` shapes the product in the same sitting. It is the `flow` skill's "set up Flow here" plus a template bootstrap, and it is done when the first deployment is green.

Deterministic rename, destination safety, baseline docs, and commit-gating rules live in this skill's `lib/` modules. Use them instead of blind global replace or destructive Git commands.

## Gather inputs

Take what the request says. `inferTemplateFromRequest` from `lib/identity.mjs` picks the template it names (hints in `TEMPLATE_HINTS`, `lib/constants.mjs`). A project name in the request, or the current directory's name, is the name. Derive identity with `deriveProjectIdentity`: slug, `package.json` name, Portless name, and `<slug>.localhost` host; the display title stays the name the user gave.

Infer the rest and ask, in one round, only what stays open:

- **Destination:** the current directory when `assessDestination` accepts it; otherwise ask for a path. Never use a destination the user did not name or accept.
- **Template**, when not inferred: **flow-next** for a single Next.js app, **flow-mono** for Turborepo (`apps/web`, `packages/ui`).
- **GitHub repository:** offer one, private under the authenticated `gh` user and named for the slug unless the request says otherwise; one yes covers creating it and pushing to it. Skip it on a no or without `gh`. Never assume push access to an existing repository.
- **Preset.** `resolvePreset` from `lib/preset.mjs` picks `minimal` or `neon` (Neon, Drizzle, or a database in the request); ask only when it returns not ok. `neon` provisions resources, so it needs an explicit yes even when inferred.
- **Files to keep** that `assessDestination` names.

The bootstrap lane reports blockers rather than asking, so settle every question first. Anything other than an explicit yes is not one.

## Run two lanes

Once nothing is open:

- **Bootstrap lane.** A worker runs every section from "Obtain template" through "Deployment" and reports the completion facts.
- **Explore lane.** The main session hands the conversation to `explore` as a new-product run, using the user's description as its first input. Explore writes nothing until the bootstrap lane reports its initial commit.

Without independent workers, run the bootstrap first, then `explore`, and say so. Without `explore`, finish the bootstrap and suggest exploring next. A failed bootstrap does not discard the exploration: report the blocker and keep exploring.

## Obtain template (independent of upstream history)

With an authorized repository, use GitHub's template copy:

```bash
gh repo create <owner>/<repo> --private --template gaboesquivel/<template> --clone <destination>
```

Otherwise clone the template into a temporary directory and copy it into the destination with `copyTemplateInto` from `lib/git-safety.mjs`, which skips the template's `.git` and never overwrites existing files. Run `git init` when the destination has no `.git`. Run `assessDestination` and `assertNoTemplateOrigin` before writing; never keep `origin` pointing at `gaboesquivel/flow-next` or `gaboesquivel/flow-mono`, and add a remote only when the user authorized it.

**Bootstrapping in place.** A destination that holds only agent setup (`AGENT_SETUP_ENTRY_NAMES`, `lib/constants.mjs`) counts as empty; bootstrap at that root. Keep those files, adding only the Flow block and the `@AGENTS.md` import; when the template ships its own copy of a kept file, report it in `skipped`. Pass other files the user chose to keep as `preserve`.

**Stop** when the destination has unexpected files without authorization or already has Git commits. Never `reset`, `clean`, or delete history.

## Rename template identifiers

Use `renameAllowlistForTemplate`, `applyRenamesInTree`, and `scanTreeForStaleIdentifiers` from `lib/rename.mjs`; do not widen the allowlist with a global replace. Preserve package imports (`@repo/ui`, `web`) and legitimate template-repository references (`STALE_SCAN_PRESERVE_REL_PATHS` and `STALE_SCAN_SKIP_DIR_NAMES` in `lib/constants.mjs`).

## Dependencies and setup

Run the template's `pnpm setup` with `FLOW_PRESET` set to the preset. It installs the template's technical skills; do not install flow-skills into the new repository, but keep them when the user already installed them there. Do not set `FLOW_SETUP_SKIP_SKILLS` unless asked. The template's setup owns hosting and database provisioning and fails closed for `neon` without authorization.

## Baseline product documentation

Write `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `GLOSSARY.md` for **this product** with `buildBaselineDocs` from `lib/baseline-docs.mjs`: template name, commit SHA, slug and host, and the template route shell. Do not copy Flow's mission, tagline, or principles.

## Flow block

Write the Flow block with the `flow` skill's `lib/flow-block.mjs`, passing the project's absolute path; `flow`'s [Flow block](../flow/SKILL.md#flow-block) section owns the layout. Keep the helper's output, including any refusal, for the report. Touch nothing outside the markers and the import line. Without `flow`, skip the block and say so.

## Bootstrap order

The steps share one tree: run independent ones as concurrent processes, not workers, and start a step only after those whose files it reads (the renames finish before `pnpm setup`). Format every file the bootstrap wrote or renamed with the project's formatter, and run the checks after the last write.

## Verification

Record each check as **passed**, **failed**, or **unavailable**. The template's CI and the deployment cover build, evals, and the running app.

| Check | Command / action |
| --- | --- |
| setup | `pnpm setup` |
| qa | `pnpm qa` |
| identity_scan | `scanTreeForStaleIdentifiers` returns no issues |
| gitignore_artifacts | `git check-ignore` for `.env.local`, `node_modules`, `.next` |

If any check failed, report the blocker; do not claim success or create the initial commit.

## Initial commit

Commit with `chore: initialize <slug>` (`formatInitialCommitMessage`) only when `canCreateInitialCommit` from `lib/commit-gate.mjs` returns ok, the helper reports any Flow block's file tracked, and the staged files hold no secrets or build artifacts. Never use `--no-verify`. After it, `git status` is clean and no remote points at a template repository.

## Deployment

With an authorized GitHub repository, push the initial commit to it; push nowhere else, and deploy by no other means. When the repository is connected to Vercel, wait for that commit's first deployment (its GitHub deployment status) and report the URL once it is green; a failed deployment is a blocker to report. When no deployment is configured, say so: the commit is the done signal.

## Boundaries

- Edit adopter instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or equivalent) only to write the Flow block and the `@AGENTS.md` import.
- `explore` is the only hand-off; do not invoke `flow` or a delivery pipeline.

## Completion

Report the template and its commit SHA, destination, preserved and skipped files, slug and host, files created or updated, the Flow block (file, tracked, imports), each check, the initial commit SHA, the deployment URL or that none is configured, and blockers. Report the bootstrap lane when it finishes, without interrupting an open exploration question.
