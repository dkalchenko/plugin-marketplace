---
name: dkalchenko-github-branch-creation
description: Use the GitHub CLI to create a remote branch from an existing GitHub commit when the requested branch is missing.
---

# Create a GitHub branch

Resolve the host, repository, and target branch. Use `gh repo view "<repository-url>" --json nameWithOwner,defaultBranchRef` to verify the repository and discover its default branch. Use the same host and owner/repo for all API calls.

1. Read the exact target with `gh api --hostname "<host>" "repos/<owner>/<repo>/git/ref/heads/<branch>"`. Encode URL-sensitive characters in branch names when building API paths. If it exists, report its tip and finish, even if it differs from the requested base. Proceed only on a branch lookup HTTP 404 in the verified repository. Surface other lookup failures.
2. Resolve the requested starting branch or commit to a full commit SHA in that repository. When no base was specified, use the default branch's current remote tip. An empty repository needs an initial commit before GitHub can create a branch this way.
3. Create the ref once using the full branch name and the resolved SHA:

   ```sh
   gh api --hostname "<host>" --method POST "repos/<owner>/<repo>/git/refs" -f "ref=refs/heads/<branch>" -f "sha=<base-sha>"
   ```

4. Verify the returned ref name and SHA. On a conflict or uncertain response, read the exact target again. Report the observed tip if someone else created the branch, or report the error if it is still missing. Never move an existing ref as part of creation.
