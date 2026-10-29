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

- **Bootstrap lane.** A worker runs "Obtain template", "Bootstrap", and "Deployment" and reports the completion facts.
- **Explore lane.** The main session hands the conversation to `explore` as a new-product run, using the user's description as its first input. Explore writes nothing until the bootstrap lane reports its initial commit.

Without independent workers, run the bootstrap first, then `explore`, and say so. Without `explore`, finish the bootstrap and suggest exploring next. A failed bootstrap does not discard the exploration: report the blocker and keep exploring.

## Obtain template (independent of upstream history)

With an authorized repository, use GitHub's template copy:

```bash
gh repo create <owner>/<repo> --private --template gaboesquivel/<template> --clone <destination>
```

Otherwise clone the template into a temporary directory and copy it into the destination with `copyTemplateInto` from `lib/git-safety.mjs`, which skips the template's `.git` and never overwrites existing files. Run `git init` when the destination has no `.git`. Run `assessDestination` and `assertNoTemplateOrigin` before writing; never keep `origin` pointing at `gaboesquivel/flow-next` or `gaboesquivel/flow-mono`, and add a remote only when the user authorized it.

**Bootstrapping in place.** A destination that holds only agent setup (`AGENT_SETUP_ENTRY_NAMES`, `lib/constants.mjs`) counts as empty; bootstrap at that root. Keep those files, adding only the Flow block and the `@AGENTS.md` import; when the template ships its own copy of a kept file, report it in `skipped`. Pass other files the user chose to keep as `preserve`.

**Template checkout.** When `assessDestination` returns `inPlace` (a clean clone of flow-next or flow-mono, or a repository created from one), the destination already is the template: skip the copy, take the template from the result, and initialize at its root. Remove an `origin` that points at the template repository (`assertNoTemplateOrigin`); keep its history.

**Stop** when the destination has unexpected files without authorization or has Git commits that are not a clean template checkout. Never `reset`, `clean`, or delete history.

## Bootstrap

Once the destination holds the template, run `node <skill-dir>/lib/bootstrap.mjs <destination> <project-name> --preset <preset>` and keep its JSON output for the report. It is the one supported path; do not reimplement its steps. In order, it:

- removes remotes that point at a template repository;
- renames template identifiers through the allowlist in `lib/rename.mjs` (never a global replace; package imports such as `@repo/ui` and `web` stay);
- runs the template's `pnpm setup` with `FLOW_PRESET`, which owns hosting and database provisioning and fails closed for `neon` without authorization. The template's skills lock already carries Flow; do not install flow-skills a second time;
- writes `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `GLOSSARY.md` for this product, keeping any that exist, never Flow's mission or principles;
- writes the Flow block and the `@AGENTS.md` import with the `flow` skill's helpers (nothing outside the markers and that import line), or reports them skipped when `flow` is not installed;
- formats, runs the checks below, and commits `chore: initialize <slug>` only when every check passed, the Flow block's file is tracked, and nothing staged is a secret or build output.

Exit 0 means committed with a clean tree; otherwise `blockers` names what stopped it. Never commit around a blocker or with `--no-verify`.

## Verification

Record each check as **passed**, **failed**, or **unavailable**. The template's CI and the deployment cover build, evals, and the running app.

| Check | Command / action |
| --- | --- |
| setup | `pnpm setup` |
| qa | `pnpm qa` |
| identity_scan | `scanTreeForStaleIdentifiers` returns no issues |
| gitignore_artifacts | `git check-ignore` for `.env.local`, `node_modules`, `.next` |

If any check failed, report the blocker; do not claim success or create the initial commit. After the commit, `git status` is clean and no remote points at a template repository.

## Deployment

With an authorized GitHub repository, push the initial commit to it; push nowhere else, and deploy by no other means. When the repository is connected to Vercel, wait for that commit's first deployment (its GitHub deployment status) and report the URL once it is green; a failed deployment is a blocker to report. When no deployment is configured, say so: the commit is the done signal.

## Boundaries

- Edit adopter instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or equivalent) only to write the Flow block and the `@AGENTS.md` import.
- `explore` is the only hand-off; do not invoke `flow` or a delivery pipeline.

## Completion

Report the template and its commit SHA, destination, preserved and skipped files, slug and host, files created or updated, the Flow block (file, tracked, imports), each check, the initial commit SHA, the deployment URL or that none is configured, and blockers. Report the bootstrap lane when it finishes, without interrupting an open exploration question.
