---
name: to-tasks
description: Break a plan, spec, or conversation into verifiable vertical-slice tasks with blockers, listed in the spec's Tasks checklist. Use when the user says "break it down" or "split this into tasks".
disable-model-invocation: false
---

# To Tasks

Break a plan, spec, or conversation into **tasks**: independently verifiable vertical slices, each naming the tasks that **block** it. Outcomes, dependencies, and integration cost set the count, never a target: a first MVP may need several tasks, a small change one. Split where a slice can be demonstrated alone, needs separate review, or would not fit one session; never per layer, file, or step.

## Process

1. **Context.** Read a named spec, issue, or URL in full, and the areas touched. Use the project's terms, respect decision records, and prefactor first: make the change easy, then make the easy change.
2. **Slices.** Each delivers narrow, demoable behavior across the layers it needs and fits one fresh context.
3. **Area.** Every package or directory a task changes, never file paths, fine enough to show independence inside a shared app (`app/notes` when nothing else in `app` changes), including routes outside its main package; `build` keeps concurrent work apart by area, so disjoint areas must mean disjoint changes.
4. **Blockers.** Only a real data or file dependency, never topic order; prefer a wide frontier. A task is **ready** once its blockers are complete.

**Wide refactors** no vertical slice can land green use **expand–contract**: add the new form; migrate call sites in green batches by package, each blocked by the expand; remove the old form, blocked by every batch. Batches that cannot stay green alone share an integration branch and a final verify task.

## Record and report

"Break it down" authorizes writing the spec's Tasks section without approval, one line per task, committed on the spec's branch:

`- [ ] NN: Title. Area: a, b. Blocked by: NN.`

Omit `Blocked by` when none. Add one indented sentence only when the title cannot say what to build. The spec's Acceptance holds the checks. Without a spec, write one with `to-spec` first or return a labelled local draft. Keep paths and code out of task text.

**Task issues** open only when asked: one per task from the issue template, blockers linked once every number exists, and `(#N)` appended to each line. Say when they are public; on a retry, open only the missing ones.

Tasks are not pull requests or worktrees; `build` groups them. Report where the tasks live and the ready set, then wait for "build it".

<issue-template>

## Spec

Its link, if any.

## What to build

Area: as in the checklist line.

The end-to-end behaviour, from the user's side.

## Acceptance criteria

- [ ] Criterion 1

</issue-template>
