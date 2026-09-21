---
title: Git Operations Require Explicit Authorization
impact: HIGH
impactDescription: no history is written or published without the owner saying so
tags: architecture, process, git
---

## Git Operations Require Explicit Authorization

No git operation that records or rewrites history runs without the project owner's
explicit authorization, given for that specific operation.

Requires authorization every time:

- `git commit`, including amending an existing commit.
- `git merge`, `git rebase`, `git cherry-pick`, `git reset`, `git revert`.
- `git push`, tag creation, branch deletion.
- The equivalent through any other tool, for example `gh pr merge` or a GUI.

Does not require authorization:

- Editing, creating and deleting files in the working tree as part of the requested
  task.
- Read-only inspection: `git status`, `git diff`, `git log`, `git show`.

Authorization is per operation. Approving one commit does not approve the next one, and
finishing a piece of work is not itself a reason to commit it. The correct way to end a
task is to leave the changes in the working tree, state what changed, and offer to
commit.

**Incorrect:** finishing a feature and committing it "to keep the history tidy", or
rebasing onto `main` before asking.

**Correct:** "The 27 rule files are written and the paths are fixed. Want me to commit?"

Reference: standing instruction from the project owner
