---
name: dkalchenko-git-commit
description: Use Git to review and commit task changes in the working repository when the user asks for a local commit or commit message options.
---

# Git commit

1. Establish the scope from the user's request. By default include only changes you worked on for this task. Compare `git status --short`, `git diff`, and `git diff --cached` with your edits. Read relevant untracked files too. If you cannot attribute a change, leave it out or clarify the scope.
2. Review the intended patch before staging it. Check that each hunk belongs and implements the intended behavior. Use an available review or security skill when the change warrants it. Surface blocking findings before committing.
3. Choose the prefix from the reviewed patch. Use the first matching rule:
   - `major: <summary>` for a breaking change, including a feature or fix that breaks compatibility.
   - `feat: <summary>` for a new feature.
   - `fix: <summary>` for a bug fix or a small change that adds no feature.

   Read the three latest subjects with `git log -3 --format=%s`. Use their wording and capitalization as a guide for the summary after the prefix. Use the available subjects in a shorter history, or a concise imperative summary for an initial commit. Propose **three distinct messages** using the chosen prefix. Let the user choose unless they supplied a message or delegated the choice. A request for options alone ends with the options.
4. Stage only the reviewed paths or hunks. If other work is already staged, preserve it. For whole files containing only task edits, `git commit --only -m "<message>" -- <paths>` can exclude unrelated staged paths, but it takes the named files' **working-tree contents**. For mixed files, isolate the reviewed hunks and verify the exact candidate diff against HEAD. If you cannot isolate them while preserving the user's index, stop and explain which edits overlap.
5. Recheck the candidate diff just before committing, especially after waiting for a message choice. Create the local commit with Git, then inspect `git show --stat --oneline HEAD` and `git status --short`. Report the commit hash and subject.
