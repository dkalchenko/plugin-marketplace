---
name: dkalchenko-manage-agents
description: Initialize, reconcile, or record an opt-out for AGENTS.md routing of enabled skills supplied by plugin-marketplace plugins.
---

# Manage AGENTS skill routing

Maintain task-to-skill routing for enabled skills whose supplying plugin belongs to `plugin-marketplace`. Exclude standalone skills, including this helper, and other marketplaces. This workflow does not install or enable plugins.

## Establish scope and inventory

- Read the actual task workspace's applicable `AGENTS.md` hierarchy, including nested instructions for target files. Do not substitute an installed plugin directory for the project root.
- Use the host's current enabled-skill inventory and provider metadata to verify each exact skill and `<plugin>@plugin-marketplace` identity. Names, prefixes, installed folders, and marketplace catalogs alone do not prove enablement.
- Preserve handwritten routing and explicit invocation policies. If an enabled skill's provenance is unknown, omit new rows for it and report the limitation. Do not scan unrelated directories to guess inventory.
- A partial, stale, or failed inventory cannot prove disablement. Remove rows only with a complete current inventory or explicit host/user evidence. A settings change awaits host refresh; this is not a background watcher.

## Resolve consent

- **Enabled or previously accepted routing:** synchronize without asking again.
- **Declined:** do not synchronize or prompt again unless the user explicitly reconsiders. Existing handwritten instructions and explicit skill requests still apply.
- **Explicit request to initialize or update routing:** proceed within that request.
- **No recorded decision or existing routing requirement:** ask once: "Add task-to-skill routing for enabled skills from plugin-marketplace plugins to this project's AGENTS.md? If you decline, I will record that choice in AGENTS.md so you are not asked repeatedly."

Wait for that answer before changing routing; do not repeat a pending question. A no permits only the disclosed decline record, not deletion of existing routing or disabling skills. If writing `AGENTS.md` is also refused, remember the decision for this conversation and explain that it cannot persist to new chats. Continue independent work while waiting.

## Synchronize the managed block

After acceptance, reconcile at session start and before a new user prompt. Recheck during the same turn only if inventory changes. Add newly enabled in-scope skills, update renamed skills and sources, and remove confirmed disabled, uninstalled, or out-of-scope rows. Skip unchanged writes.

Create `AGENTS.md` at the verified root if absent. Otherwise edit only the managed block; preserve unrelated content and existing unmarked routing. Report conflicts with handwritten requirements rather than overwriting them. This inventory reflects the current user's enabled plugins, not every collaborator's setup.

Record one row per exact skill with a useful task trigger and verified provider. Prefer stable, repository-relative sources; label machine-specific locations when unavoidable. Keep an empty table if no in-scope skills are enabled. Do not copy skill bodies or tool inventories into the routing table.

Enabled template:

```markdown
<!-- dkalchenko:skill-routing:start -->
## Skill routing

Skill routing: enabled

Marketplace: `plugin-marketplace`

Read applicable instructions and load only skills matching the task.

| Skill | Use when | Supplying plugin |
| --- | --- | --- |
| <exact skill name> | <task trigger> | <plugin>@plugin-marketplace |

Synchronize this block with verified enabled skills from this marketplace.
Preserve unrelated instructions; do not infer disablement from partial inventory.
<!-- dkalchenko:skill-routing:end -->
```

Decline template:

```markdown
<!-- dkalchenko:skill-routing:start -->
## Skill routing

Skill routing: declined

The user declined adding enabled-skill routing requirements to AGENTS.md.
Do not prompt again unless the user requests reconsideration.
Existing instructions and explicit skill requests still apply.
<!-- dkalchenko:skill-routing:end -->
```

Review the diff for preserved content, a single managed block, exact skill identities, and triggers matched to the verified inventory. Report changes, the recorded decision, and inventory limitations. Routing instructions and reminder hooks do not guarantee compliance.
