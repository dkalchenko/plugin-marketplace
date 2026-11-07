---
name: dkalchenko-git-branch
description: Use Git to name and create a local branch when the user wants a branch in the working repository.
---

# Git branch

Use an explicitly requested name. Otherwise respect required repository or host prefixes and describe the change in lowercase, hyphen-separated words using the categories below. A required prefix comes before the category, for example `codex/feature/add-offline-mode`. A breaking change takes precedence over the other categories.

| Change | Branch name example |
| --- | --- |
| Breaks compatibility with existing callers or data | `major/remove-legacy-api` |
| Adds a feature | `feature/add-offline-mode` |
| Fixes a bug or makes a small change without adding a feature | `bugfix/correct-timeout` |

Create from the requested starting point, defaulting to the current commit. Validate the name with `git check-ref-format --branch "<name>"`. Use `git branch -- "<name>" "<start-point>"` for creation alone, or `git switch -c "<name>" "<start-point>"` when the task calls for working on the new branch. If the branch already exists, report it and preserve its tip. Verify the resulting local ref with `git rev-parse --verify "refs/heads/<name>"`.
