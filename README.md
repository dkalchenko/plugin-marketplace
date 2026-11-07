# Plugin Marketplace

Independently installable Codex plugins for `dkalchenko/plugin-marketplace`. Registering the marketplace makes plugins discoverable; install the ones you want.

| Plugin | Skills | Install selector |
| --- | --- | --- |
| Code Architecture | [Unity feature boundaries](plugins/code-architecture/skills/dkalchenko-unity-code-architecture/SKILL.md), [stale code removal](plugins/code-architecture/skills/dkalchenko-stale-code-removal/SKILL.md) | `code-architecture@plugin-marketplace` |
| Project Architecture | Unity [file placement](plugins/project-architecture/skills/dkalchenko-unity-file-placement/SKILL.md), [file naming](plugins/project-architecture/skills/dkalchenko-unity-file-naming/SKILL.md), [assemblies](plugins/project-architecture/skills/dkalchenko-unity-assemblies/SKILL.md), [stale file removal](plugins/project-architecture/skills/dkalchenko-unity-stale-files/SKILL.md) | `project-architecture@plugin-marketplace` |
| Code Style | [C# naming and formatting](plugins/code-style/skills/dkalchenko-dotnet-code-style/SKILL.md), with project conventions taking precedence | `code-style@plugin-marketplace` |
| Git Repository | [Commit task changes](plugins/git-repository/skills/dkalchenko-git-commit/SKILL.md), [create local branches](plugins/git-repository/skills/dkalchenko-git-branch/SKILL.md), [push existing commits](plugins/git-repository/skills/dkalchenko-git-push/SKILL.md) | `git-repository@plugin-marketplace` |
| User Prompt Handling | [Confirm coding intent and review proposed corrections](plugins/user-prompt-handling/skills/dkalchenko-code-generating-prompt-handling/SKILL.md) before implementation | `user-prompt-handling@plugin-marketplace` |

Code Architecture owns logical responsibilities; Project Architecture owns file and assembly organization. Their cleanup skills address different evidence: symbol reachability versus whole-file and Unity asset references. Plugins remain independently installable.

## Install or refresh

Requirements: a Codex CLI supporting `codex plugin marketplace` and `codex plugin add`, plus Git with access to the repository. Node.js is needed for source validation and optional reminders; the reminder installer requires PowerShell 7.

Register the published marketplace using HTTPS:

```powershell
codex plugin marketplace add dkalchenko/plugin-marketplace
```

Or use SSH:

```powershell
codex plugin marketplace add "ssh://git@github.com/dkalchenko/plugin-marketplace.git"
```

For local development, register the checkout instead, from its root:

```powershell
codex plugin marketplace add .
```

Install a plugin using its selector from the table, for example:

```powershell
codex plugin add git-repository@plugin-marketplace
```

After published changes, refresh the marketplace and the installed plugin:

```powershell
codex plugin marketplace upgrade plugin-marketplace
codex plugin add git-repository@plugin-marketplace
```

Refresh or restart the Codex host to load updated plugins. Editing marketplace source alone does not update installed copies. This local Codex marketplace is separate from the public ChatGPT plugin directory.

## Optional AGENTS routing reminders

The [installer](global-reminders/install.ps1) copies the reminder hook and [routing helper](global-reminders/skills/dkalchenko-manage-agents/SKILL.md) into the user's Codex home. It merges SessionStart, UserPromptSubmit, PreToolUse, and SubagentStart events into `hooks.json`, preserving unrelated hooks and backing up existing configuration. It does not grant hook trust.

Run from the repository root in PowerShell 7:

```powershell
./global-reminders/install.ps1
```

The installer uses `CODEX_HOME`, or `~/.codex` when unset. For another home, use `-TargetCodexHome <directory>` and launch Codex with the same `CODEX_HOME`. Restart Codex and review/trust the four hooks. Rerun the installer after changing the user-level hook or helper source.

The hooks inspect workspace/ancestor `AGENTS.md` decisions and remind the assistant to check more specific instructions. They do not edit routing or enumerate enabled skills. The helper:

- Asks once before first-time setup and records acceptance or the disclosed decline.
- After acceptance, synchronizes the managed block at session start and before new prompts, using verified enabled skills from this marketplace only.
- Preserves handwritten instructions, skips unchanged writes, and never treats a partial or stale inventory as evidence of disablement.
- Honors refusals to write `AGENTS.md`; those cannot persist to later chats without a file.

Invoke `$dkalchenko-manage-agents` to reconcile routing explicitly. Installed plugin folders and the source catalog are not proof of enablement; new skills enter routing only after the host exposes them. Hooks require Node.js and a host that executes and trusts them. Neither hooks nor skill instructions guarantee model compliance.

## Repository layout

```text
.agents/plugins/marketplace.json
AGENTS.md
README.md
plugins/
  <plugin>/
    plugin.json                      # Or the existing .codex-plugin/plugin.json
    skills/<skill>/
      SKILL.md
      agents/openai.yaml
      references/                    # Only when supporting detail is useful
global-reminders/
  install.ps1
  hooks/remind.cjs
  skills/dkalchenko-manage-agents/
tests/marketplace.test.cjs
```

Each plugin owns its manifest, version, and skills. There is no root `plugin.json`; catalog paths resolve from the repository root. Keep skill references inside their supplying plugin so installations remain self-contained.

## Add a plugin

1. Add `plugins/<name>/plugin.json` and usable skills or tools. Use the portable Agent Plugins manifest for a new skills-only plugin; preserve an existing compatibility manifest unless a migration is needed.
2. Add a unique entry to `.agents/plugins/marketplace.json` with the matching name, local source `./plugins/<name>`, installation policy `AVAILABLE`, authentication policy `ON_INSTALL`, and an appropriate category.
3. Validate the source, publish through the repository's normal workflow, then refresh and install using `<name>@plugin-marketplace`.

Keep names and existing skill invocation policies stable during ordinary edits. Bump only the versions of plugins whose packaged content changes.

## Validate source

```powershell
node tests/marketplace.test.cjs
```

This checks catalog identity, unique entries, paths, and manifest names. Also check edited skill metadata and relative links. Source checks do not verify installation, hook trust, credentials, or interactive model behavior.

References: [plugin packaging and marketplaces](https://developers.openai.com/plugins/build/plugins), [Codex hooks](https://learn.chatgpt.com/docs/hooks).
