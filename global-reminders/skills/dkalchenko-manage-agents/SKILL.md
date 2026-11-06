---
name: dkalchenko-manage-agents
description: Initialize or update AGENTS.md task-to-skill routing for enabled skills from plugins in `plugin-marketplace`, including recording a user's opt-out. Use when project skill-routing instructions are missing, stale, or explicitly requested; this workflow is language-neutral.
---

# Manage AGENTS skill routing

Maintain a project-owned record of which enabled skills apply to which tasks. Include a skill only when its supplying plugin is enabled and its marketplace identity is exactly `plugin-marketplace`. Exclude standalone skills (including this setup skill) and plugins from other marketplaces. Do not install or enable skills.

## Discover and decide

- Resolve the actual task workspace and read the applicable `AGENTS.md` hierarchy, including nested instructions for target files. Never use the plugin folder as the project root. Preserve unrelated instructions and edits.
- Inspect the skills exposed as enabled/available for this session by the host: names, descriptions, invocation policies, and sources. Match the host's provider metadata or full plugin selector (`<plugin>@plugin-marketplace`) to the enabled skill. A name or `dkalchenko-` prefix alone is insufficient. When provenance is unknown, skip new entries and report the uncertainty. Installed folders and marketplace catalogs alone do not establish that skills are enabled. Do not scan unrelated user directories to guess an inventory. Report incomplete host inventories; ask for missing information only when needed.
- Respect existing routing requirements, including unmarked sections. Honor an explicit decline without repeated prompts. A later explicit request to enable routing supersedes the decline.
- When neither routing requirements nor a recorded decision exist, ask once: "Add task-to-skill routing for enabled skills from plugin-marketplace plugins to this project's AGENTS.md? If you decline, I will record that choice in AGENTS.md so you are not asked repeatedly." Wait before editing routing. Continue independent work and remember the pending question so repeated hooks do not repeat it.
- An explicit request to initialize or update routing authorizes that work; do not ask again. A no authorizes only the disclosed decline record. If the user also forbids writing AGENTS.md, respect that restriction, remember the decline for this conversation, and explain that it cannot persist to new chats. Do not bypass file permissions.

## Write or merge

Create `AGENTS.md` at the verified project root if absent. Otherwise merge a focused section. Preserve all unrelated content. For a new section use the block below; when updating it preserve text outside the markers. Keep existing unmarked routing rather than duplicating or contradicting it; align a status block with the existing requirements when needed.

Once routing is accepted, keep its managed inventory synchronized at session start and before handling a new user prompt. Filter the current enabled inventory to this marketplace before comparing exact plugin and skill identities. When migrating a previously accepted all-skills block, remove confirmed out-of-scope rows from that managed block. Preserve handwritten instructions and declines. Add newly enabled skills with their task triggers; remove disabled or uninstalled skills from the managed table; update renamed skills and changed sources. Acceptance authorizes this routine synchronization without asking again. Skip writing when nothing changed, and do not repeat synchronization before every tool call in the same turn unless the inventory changes.

Only remove an entry when a complete current inventory or explicit host/user evidence establishes that it is disabled or unavailable. A partial inventory, failed lookup, or old session snapshot is not proof of disablement. If the host has not refreshed after an enable/disable action, report that synchronization awaits the refreshed inventory; do not pretend to watch settings changes in real time. Do not delete manually maintained instructions outside the managed block. If they require a disabled skill, report the conflict. Never synchronize a declined setup. A shared repository's inventory reflects this user's session, not every collaborator's configuration.

For acceptance:

```markdown
<!-- dkalchenko:skill-routing:start -->
## Skill routing

Skill routing: enabled

Marketplace: `plugin-marketplace`

Before working on a task, read applicable AGENTS.md instructions and select
the skills mapped to that task. Load only relevant skills. Explicit user
instructions and more specific project rules take precedence.

| Enabled skill | Use when | Source / disambiguation |
| --- | --- | --- |
| <exact skill name> | <specific trigger> | <plugin/provider and resolvable source> |

Synchronize this managed inventory with the authoritative enabled-skill
inventory filtered to plugins from this marketplace. At session start and before a new user prompt, add newly enabled in-scope skills
and remove confirmed disabled skills; preserve unrelated instructions.
<!-- dkalchenko:skill-routing:end -->
```

Replace the illustrative row with one row per enabled skill supplied by an enabled `plugin-marketplace` plugin. Keep the table empty if the verified scoped inventory is empty. Group rows only if each exact name and trigger remain discoverable. Do not paste skill bodies or tool inventories. Preserve explicit-only invocation policies. Listing all skills does not mean loading all skills for every task.

Prefer stable provider identities and repository-relative sources. If only machine-specific locations are available, label that limitation instead of inventing portable paths. Do not persist secrets. Disambiguate duplicate names by provider and source. Preserve known user preferences for overlapping skills; otherwise ask when a real conflict affects the task. Do not silently prioritize this marketplace.

For a decline:

```markdown
<!-- dkalchenko:skill-routing:start -->
## Skill routing

Skill routing: declined

The user declined adding enabled-skill routing requirements to AGENTS.md.
Do not prompt again unless the user requests reconsideration. Existing project
instructions and explicit skill requests still apply.
<!-- dkalchenko:skill-routing:end -->
```

A decline does not authorize deleting existing routing or disabling skills. Surface conflicts with existing requirements instead.

## Verify

Review the diff for preserved instructions, duplicate blocks, exact names and triggers matched to the inventory, and no new routing requirements in a decline. Report the file changed, recorded decision, and inventory limitations. Neither AGENTS.md nor reminder hooks guarantee compliance.
