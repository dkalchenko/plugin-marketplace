---
name: dkalchenko-git-push
description: Use Git to push changes that are already committed to a remote branch when the user asks to push or publish commits.
---

# Git push

Use Git to push changes that are already committed. Leave uncommitted edits untouched and report them separately. A push request alone does not call for staging files or creating a commit.

1. Inspect `git status --short --branch`, the current branch, and the configured remotes. Resolve the source commit, remote, and destination branch from the request or push configuration. Check destinations with `git remote get-url --push --all "<remote>"`. A named remote can push to multiple URLs: use an explicitly selected push URL instead if only one destination is intended. Clarify unresolved destinations before pushing.
2. Resolve the intended source to a full commit SHA with `git rev-parse --verify "<source>^{commit}"`. Use the configured Git transport and authentication. Do not require a hosting-service CLI or replace credential helpers.
3. Push that commit to the selected branch with Git, using an explicit refspec:

   ```sh
   git push --no-follow-tags "<remote>" "<source-sha>:refs/heads/<branch>"
   ```

   Use a normal fast-forward push. Do not force-push, rewrite history, or publish unrelated branches or tags. If the remote rejects the push because of divergence, branch protection, or authentication, report the rejection and stop.
4. Verify each selected destination with `git ls-remote "<push-url>" "refs/heads/<branch>"` and compare its tip to the source SHA. Use push URLs, which may differ from the fetch URL. If delivery was uncertain, check the affected ref before retrying. Report each destination's result, branch, and verified commit.
