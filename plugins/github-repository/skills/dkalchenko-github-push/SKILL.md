---
name: dkalchenko-github-push
description: Publish existing local Git commits to a GitHub branch when the user asks to push changes using the GitHub CLI.
---

# Push commits to GitHub

Resolve the intended local tip and destination branch from the request or the checked-out branch's push configuration. Check the push URL, especially in a fork. If the destination is ambiguous, clarify before publishing. Report any uncommitted edits separately.

Use `gh repo view "<repository-url>" --json url` to verify the destination and obtain its canonical HTTPS URL. Check `gh auth status --active --hostname "<host>"` for that host. Use GitHub CLI as the HTTPS credential helper for this push and Git to transfer the commit objects. With the verified URL, source commit SHA, and full destination branch name, run:

```sh
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push --no-follow-tags "<https-url>" "<source-sha>:refs/heads/<branch>"
```

Use a normal fast-forward push. If Git reports divergence or branch protection, report the rejection and stop. If delivery is uncertain, check the exact remote ref before retrying. Verify the remote tip against the source SHA and report the repository, branch, and published commit.
