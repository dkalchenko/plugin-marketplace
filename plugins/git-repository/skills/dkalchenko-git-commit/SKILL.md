---
name: dkalchenko-git-commit
description: Use Git to review and commit task changes in the working repository when the user asks for a local commit or commit message options.
---

# Git commit

1. Establish the scope from the user's request. By default include only changes you worked on for this task. Compare `git status --short`, `git diff`, and `git diff --cached` with your edits. Read relevant untracked files too. If you cannot attribute a change, leave it out or clarify the scope.
2. Review the intended patch before staging it. Check that each hunk belongs and implements the intended behavior. Resolve blocking findings before committing.
3. Choose the prefix from the reviewed patch. Use the first matching rule:
   - `major: <summary>` for a breaking change, including a feature or fix that breaks compatibility.
   - `feat: <summary>` for a new feature.
   - `fix: <summary>` for a bug fix or a small change that adds no feature.

   Read the three latest subjects with `git log -3 --format=%s`. Use their wording and capitalization as a guide for the summary after the prefix. Use the available subjects in a shorter history, or a concise imperative summary for an initial commit. Propose **three distinct messages** using the chosen prefix. Let the user choose unless they supplied a message or delegated the choice. A request for options alone ends with the options.
4. Stage only reviewed paths or hunks, including new files and deletions. Preserve unrelated staged work. For tracked files containing only task edits, `git commit --only -m "<message>" -- <paths>` can exclude other staged paths, but it takes those files' **working-tree contents**; new files must first be added to the index. For mixed files, isolate the reviewed hunks and verify the candidate diff against HEAD. If that cannot preserve the user's index, explain the overlap before committing.
5. Recheck the candidate diff just before committing, especially after waiting for a message choice. Create the local commit with Git, then inspect `git show --stat --oneline HEAD` and `git status --short`. Report the commit hash and subject.
