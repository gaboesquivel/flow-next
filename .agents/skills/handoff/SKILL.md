---
name: handoff
description: Hand the work to a fresh agent, natively where the host can, else as a handoff document. Use when the user says "hand off" or "write a handoff".
disable-model-invocation: false
---

# Handoff

Hand the current work to a fresh agent: through the host's native hand-off when it has one, else as a compact handoff document. When the user describes what the next session is for, tailor the document to that focus.

## Native hand-off

When the next agent runs on this host and the host can move the task into a session of its own, use that instead of a document, unless the user asked for a document. Pass the remaining plan (steps, files, what done looks like), not a copy of the conversation. In a worktree, commit work in progress on the work branch first, never on the default branch: uncommitted edits stay behind. Report the new session's native reference and stop working that task here. The new session carries the task's existing authorization and gains none.

Otherwise, write the document below.

## Document

Save the document in the operating system's temporary directory (`$TMPDIR`, otherwise `/tmp`; `%TEMP%` on Windows). Do not write it into the workspace.

Include:

- The goal, what is decided, and what is still open.
- The next useful action.
- Paths or URLs for specs, plans, decisions, issues, commits, and diffs. Do not copy their contents.
- A suggested-skills section that names relevant skills. The next agent invokes a skill only when asked.

Redact secrets, credentials, and personal data.

## Completion

Report the document's absolute path. If the temporary directory is not writable, return the handoff inline in the reply and say it was not saved.

Writing the document does not authorize implementation, commits, or edits in the workspace.
