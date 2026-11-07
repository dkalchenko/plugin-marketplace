---
name: dkalchenko-git-push
description: Use Git to push changes that are already committed to a remote branch when the user asks to push or publish commits.
---

# Git push

Use Git to push changes that are already committed. Leave uncommitted edits untouched and report them separately. A push request alone does not call for staging files or creating a commit.

1. Inspect `git status --short --branch`, the current branch, and the configured remotes. Resolve the source commit, remote, and destination branch from the user's request or the branch's push configuration. Check the actual push destination with `git remote get-url --push "<remote>"`. Clarify only if the destination cannot be determined unambiguously.
2. Resolve the intended source to a full commit SHA with `git rev-parse --verify "<source>^{commit}"`. Use the configured Git transport and authentication. Do not require a hosting-service CLI or replace credential helpers.
3. Push that commit to the selected branch with Git, using an explicit refspec:

   ```sh
   git push --no-follow-tags "<remote>" "<source-sha>:refs/heads/<branch>"
   ```

   Use a normal fast-forward push. Do not force-push, rewrite history, or publish unrelated branches or tags. If the remote rejects the push because of divergence, branch protection, or authentication, report the rejection and stop.
4. Verify the destination branch with `git ls-remote "<push-url>" "refs/heads/<branch>"` and compare its tip to the source SHA. Use the actual push URL, which may differ from the fetch URL. If delivery was uncertain, check that ref before retrying. Report the remote, branch, and verified published commit.
