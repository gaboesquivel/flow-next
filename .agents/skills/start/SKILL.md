---
name: start
description: Start a new project from flow-next or flow-mono with verified setup, renamed identity, and an initial Git commit. Use when the user says "start a Next.js project", "start a new project", or "start a monorepo".
disable-model-invocation: false
---

# Start

**Optional.** Initialize a new application in a clone of [flow-next](https://github.com/gaboesquivel/flow-next) or [flow-mono](https://github.com/gaboesquivel/flow-mono). Done when the initial commit exists. Discovery and delivery are separate work, and Flow needs neither this skill nor a starter.

## Ask only what is open

The usual path: the developer ran `gh repo create <owner>/<repo> --private --template gaboesquivel/<template> --clone`, then `pnpm setup` and `/start` in the clone. Take the name from the request or the directory. In one round, ask only what the lib cannot infer:

- **Preset.** `resolvePreset` (`lib/preset.mjs`) picks `minimal` or `neon`; ask when it is not ok. `neon` provisions resources, so it needs an explicit yes even when inferred.
- **Push target.** A remote that is not a template repository is the user's. With none, offer a private GitHub repository named for the slug; one yes covers creating and pushing to it. Never assume push access to another repository.
- **Not a template clone** (`assessDestination` does not return `inPlace`): the destination, the template (`inferTemplateFromRequest`; flow-next for one Next.js app, flow-mono for Turborepo), and files to keep. Copy with `copyTemplateInto` (`lib/git-safety.mjs`), which never overwrites. Stop on unexpected files or history; never `reset`, `clean`, or delete history.

Anything other than an explicit yes is not one.

## Run the bootstrap lib

Run `node <skill-dir>/lib/bootstrap.mjs <destination> <project-name> --preset <preset>` and keep its JSON. It is the one supported path: it removes template remotes, renames identity through an allowlist, runs `pnpm setup`, writes the root docs and the Flow block, runs the checks, and commits `chore: initialize <slug>` only when all pass. Exit 0 means committed with a clean tree; otherwise `blockers` names what stopped it. Never commit around a blocker or with `--no-verify`.

When the request describes the product, run `explore` alongside as a new-product run; it writes nothing until the initial commit, and a failed bootstrap does not discard it. Otherwise offer it once at the end.

| Check | Command / action |
| --- | --- |
| setup | `pnpm setup` |
| qa | `pnpm qa` |
| identity_scan | `scanTreeForStaleIdentifiers` returns no issues |
| gitignore_artifacts | `git check-ignore` for `.env.local`, `node_modules`, `.next` |

## After the commit

Push the initial commit to the authorized repository only. The plugin's guard blocks a direct push to a GitHub default branch: never work around it; hand the user the one `git push` command and report the push as pending. Once it lands on GitHub, run `node <skill-dir>/lib/github-governance.mjs <owner>/<repo>`; report its `unsupported` and `missingPermissions` and never weaken the preset. With no GitHub repository, report governance as skipped.

A deployment is delivery: report one the host already shows, or say none is connected, and never wait for it. "Deploy it" connects a host.

Edit instruction files only for the Flow block and the `@AGENTS.md` import. Report the template, destination, slug and host, each check, the initial commit SHA, the push, the governance report, the deployment state, and blockers. Offer "design this" once, and "explore this" unless it ran.
