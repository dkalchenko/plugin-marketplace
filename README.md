# Plugin Marketplace

A marketplace for independently installable Codex plugins, prepared for `dkalchenko/plugin-marketplace` on GitHub. Adding the marketplace does not install every plugin: install each plugin you want separately.

| Plugin | Purpose | Install selector |
| --- | --- | --- |
| [Code Architecture](plugins/code-architecture/skills/dkalchenko-unity-code-architecture/SKILL.md) | Unity feature ownership, logical layers, and dependency direction | `code-architecture@plugin-marketplace` |
| Project Architecture | Unity [file placement](plugins/project-architecture/skills/dkalchenko-unity-file-placement/SKILL.md), [file naming](plugins/project-architecture/skills/dkalchenko-unity-file-naming/SKILL.md), and [assemblies](plugins/project-architecture/skills/dkalchenko-unity-assemblies/SKILL.md) | `project-architecture@plugin-marketplace` |
| [Code Style](plugins/code-style/skills/dkalchenko-dotnet-code-style/SKILL.md) | Microsoft-based C# conventions | `code-style@plugin-marketplace` |
| Git Repository | [Review and commit task changes](plugins/git-repository/skills/dkalchenko-git-commit/SKILL.md) and [create local branches](plugins/git-repository/skills/dkalchenko-git-branch/SKILL.md) | `git-repository@plugin-marketplace` |
| GitHub Repository | [Push commits](plugins/github-repository/skills/dkalchenko-github-push/SKILL.md) and [create missing GitHub branches](plugins/github-repository/skills/dkalchenko-github-branch-creation/SKILL.md) with the GitHub CLI | `github-repository@plugin-marketplace` |

Code Style contains `$dkalchenko-dotnet-code-style` for C# conventions. See its [rules and examples](plugins/code-style/skills/dkalchenko-dotnet-code-style/references/rules-and-examples.md). Install with `codex plugin add code-style@plugin-marketplace` after registering this marketplace. Version 0.3.0 moves generic AGENTS routing out of this plugin and removes its reminder hooks; `$dotnet-code-style` was previously renamed to `$dkalchenko-dotnet-code-style`.

Code Architecture exposes `$dkalchenko-unity-code-architecture`. Project Architecture exposes `$dkalchenko-unity-file-placement`, `$dkalchenko-unity-file-naming`, and `$dkalchenko-unity-assemblies`. Install each plugin separately using its selector above. When enabled, the user-level AGENTS reminders guide skill selection.

## User-level skill reminders

The generic reminders are user-level hooks, independent of every plugin. The [installer](global-reminders/install.ps1) copies the hook script and language-neutral [$dkalchenko-manage-agents](global-reminders/skills/dkalchenko-manage-agents/SKILL.md) into your Codex home and merges four events into `hooks.json`, preserving unrelated hooks and backing up existing JSON. It does not grant hook trust. Adding this marketplace alone does not install these global files.

HUMAN ACTION: From the repository root in PowerShell 7:

```powershell
./global-reminders/install.ps1
```

The installer uses `CODEX_HOME`, or `~/.codex` when unset. `-TargetCodexHome <directory>` can prepare a different home; launch Codex with `CODEX_HOME` pointing there. Restart Codex and review/trust the SessionStart, UserPromptSubmit, PreToolUse, and SubagentStart user-level hooks. If you previously installed Code Style 0.2.0, refresh the marketplace and reinstall Code Style 0.3.0 to remove the old plugin reminders and avoid duplicate runs.

The hooks remind the AI to read applicable `AGENTS.md` and select skills for the task. With an absolute workspace `cwd`, they inspect it and its ancestors for recorded routing decisions; the AI still checks more specific instructions for target files and existing unmarked routing. Without a requirement or decision, the AI asks whether to add routing only for enabled skills supplied by plugins from `plugin-marketplace`. Acceptance records mappings; refusal records an explicit decline to prevent repeated prompts. A refusal to write the file is honored. Hooks never edit `AGENTS.md` or enumerate enabled skills themselves. The AI uses the host inventory and reports limitations. Invoke `$dkalchenko-manage-agents` directly to initialize or reconcile routing. No provider receives automatic priority.

After acceptance, the AI synchronizes the managed inventory at session start and before a new user prompt: newly enabled skills from this marketplace are added and confirmed disabled or uninstalled skills are removed. Older managed tables are narrowed by removing confirmed entries from other marketplaces and standalone skills, including the user-level setup skill. Handwritten instructions outside the managed block are preserved. Unchanged inventories cause no edits. Partial or stale session inventories do not authorize removing entries; a settings change takes effect in this workflow after the host exposes the updated inventory. This is AI-assisted synchronization, not a background settings watcher. Declined setups and unrelated handwritten instructions remain untouched.

User-level hooks are documented in [Codex hooks](https://learn.chatgpt.com/docs/hooks); multiple hook sources run together. These local reminders depend on Node.js, active user configuration, and hook trust, and do not apply to cloud environments that cannot execute them.

## Requirements

- Codex CLI with `codex plugin marketplace` and `codex plugin add` commands.
- Git for GitHub installation.
- An authenticated GitHub CLI (`gh`) for the GitHub Repository skills.
- Node.js available as `node` for user-level reminder hooks; no npm dependencies are required.
- For a private repository: Git authentication with access to the repository. Use the SSH option if your access is through SSH.

## Install from GitHub

These commands require the repository contents to have been published first. This refactor does not create or publish the GitHub repository.

### 1. Register the marketplace

HUMAN ACTION: Choose one command based on your Git access.

For HTTPS (public repository, or private repository with working HTTPS credentials):

```powershell
codex plugin marketplace add dkalchenko/plugin-marketplace
```

The `owner/repo` shorthand resolves to `https://github.com/dkalchenko/plugin-marketplace.git`, unless your Git configuration rewrites that URL.

For private SSH access:

```powershell
codex plugin marketplace add "ssh://git@github.com/dkalchenko/plugin-marketplace.git"
```

### 2. Install Code Style

HUMAN ACTION:

```powershell
codex plugin add code-style@plugin-marketplace
```

For optional user-level reminders, follow the setup above.

## Install locally before publishing

HUMAN ACTION: From this marketplace directory, run:

```powershell
codex plugin marketplace add .
codex plugin add code-style@plugin-marketplace
```

For optional user-level reminders, follow the setup above. If using the repository ZIP, extract it first and open your terminal inside its `plugin-marketplace` folder.

## Use in ChatGPT desktop

HUMAN ACTION: In a supported desktop Work/Codex environment, restart the app after registering the marketplace. Open the Plugins Directory, select **Dkalchenko Plugin Marketplace**, and install or enable **Code Style** if needed. User-level reminders are configured separately using the setup above.

This GitHub/local marketplace is separate from the public ChatGPT plugin directory. Installing a plugin on the web does not deploy local hook scripts. Hook coverage depends on the local host; reminders cannot guarantee truthful answers or prevent every unsupported action.

## Repository layout

```text
.agents/plugins/marketplace.json
README.md
global-reminders/
  install.ps1
  hooks/remind.cjs
  skills/dkalchenko-manage-agents/
plugins/
  code-architecture/
    .codex-plugin/plugin.json
    skills/dkalchenko-unity-code-architecture/
  project-architecture/
    .codex-plugin/plugin.json
    skills/dkalchenko-unity-file-placement/
    skills/dkalchenko-unity-file-naming/
    skills/dkalchenko-unity-assemblies/
  code-style/
    .codex-plugin/plugin.json
    skills/dkalchenko-dotnet-code-style/
  git-repository/
    plugin.json
    skills/dkalchenko-git-commit/
    skills/dkalchenko-git-branch/
  github-repository/
    plugin.json
    skills/dkalchenko-github-push/
    skills/dkalchenko-github-branch-creation/
tests/marketplace.test.cjs
```

The marketplace has no root `plugin.json`. Each plugin owns its manifest, skills, hooks, and version. Catalog paths resolve from the repository root.

HUMAN ACTION: When publishing, put this folder's contents at the GitHub repository root, including the hidden `.agents` directory. Do not upload the ZIP as the repository's only file or add an extra enclosing directory.

## Add another plugin

HUMAN ACTION:

1. Put the complete plugin in `plugins/<plugin-name>/`, including its own manifest and usable skills or tools. For plugins with hooks, use `.codex-plugin/plugin.json` and omit the portable root `plugin.json` while the Codex hook-loading bug remains. Plugins without hooks can use the portable manifest format.
2. Add an entry to the existing `plugins` array in `.agents/plugins/marketplace.json`; preserve the other entries and the marketplace name:

```json
{
  "name": "your-plugin-name",
  "source": {
    "source": "local",
    "path": "./plugins/your-plugin-name"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Productivity"
}
```

3. Match the entry name to the plugin manifest name and use a unique folder and name. Install it with `codex plugin add your-plugin-name@plugin-marketplace` after publishing and refreshing the catalog.

## Refresh after published changes

HUMAN ACTION:

```powershell
codex plugin marketplace upgrade plugin-marketplace
codex plugin add code-style@plugin-marketplace
```

Restart the host after refreshing installed plugins. Review hook trust again if hook definitions changed.

## Verify source

HUMAN ACTION: From the repository root:

```powershell
node tests/marketplace.test.cjs
```

This checks catalog paths, names, and plugin manifests. It does not verify GitHub credentials, live installation, hook trust, or model behavior. Verify optional user-level reminders separately in the host's hook review flow.

References: [OpenAI plugin packaging and marketplaces](https://developers.openai.com/plugins/build/plugins), [hook trust and coverage](https://learn.chatgpt.com/docs/hooks).
