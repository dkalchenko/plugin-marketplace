# Plugin Marketplace

A marketplace for independently installable Codex plugins, prepared for `dkalchenko/plugin-marketplace` on GitHub. Adding the marketplace does not install every plugin: install each plugin you want separately.

| Plugin | Purpose | Install selector |
| --- | --- | --- |
| [Evidence First](plugins/evidence-first/README.md) | Evidence-backed answers, clarification of missing information, and reminders against guessing | `evidence-first@plugin-marketplace` |

## Requirements

- Codex CLI with `codex plugin marketplace` and `codex plugin add` commands.
- Git for GitHub installation.
- Node.js available as `node` for Evidence First's hooks; no npm dependencies are required.
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

### 2. Install Evidence First

HUMAN ACTION:

```powershell
codex plugin add evidence-first@plugin-marketplace
```

### 3. Enable the reminders

HUMAN ACTION: Review the plugin's hook definition, script, and skill. Use the host's hook review flow to trust the hooks. Installing or enabling a plugin alone does not trust its hooks. Node.js must be available in the environment where those scripts run.

HUMAN ACTION: Start a new local Codex chat with Evidence First enabled and request:

> Use Evidence First throughout this conversation. Ask when required information is missing; never fill gaps by guessing.

## Install locally before publishing

HUMAN ACTION: From this marketplace directory, run:

```powershell
codex plugin marketplace add .
codex plugin add evidence-first@plugin-marketplace
```

Then complete step 3 above. If using the repository ZIP, extract it first and open your terminal inside its `plugin-marketplace` folder.

## Use in ChatGPT desktop

HUMAN ACTION: In a supported desktop Work/Codex environment, restart the app after registering the marketplace. Open the Plugins Directory, select **Dkalchenko Plugin Marketplace**, and install or enable **Evidence First** if needed. Review and trust its hooks in the host's hook review flow.

This GitHub/local marketplace is separate from the public ChatGPT plugin directory. Installing a plugin on the web does not deploy local hook scripts. Hook coverage depends on the local host; reminders cannot guarantee truthful answers or prevent every unsupported action.

## Repository layout

```text
.agents/plugins/marketplace.json
README.md
plugins/
  evidence-first/
    plugin.json
    README.md
    hooks/
    skills/
    tests/
tests/marketplace.test.cjs
```

The marketplace has no root `plugin.json`. Each plugin owns its manifest, skills, hooks, and version. Catalog paths resolve from the repository root.

HUMAN ACTION: When publishing, put this folder's contents at the GitHub repository root, including the hidden `.agents` directory. Do not upload the ZIP as the repository's only file or add an extra enclosing directory.

## Add another plugin

HUMAN ACTION:

1. Put the complete plugin in `plugins/<plugin-name>/`, including its own `plugin.json` and usable skills or tools.
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
codex plugin add evidence-first@plugin-marketplace
```

Restart the host and review hook trust again if the hook definition changed. If you previously registered the old `evidence-first` marketplace, the new identity is `plugin-marketplace`; avoid enabling both copies of Evidence First.

## Verify source

HUMAN ACTION: From the repository root:

```powershell
node tests/marketplace.test.cjs
node plugins/evidence-first/tests/hooks.test.cjs
```

These check catalog paths and names, plugin manifests, all four reminder commands, and malformed hook inputs. They do not verify GitHub credentials, live installation, hook trust, or model behavior. After installation, use an ambiguous target to check clarification behavior and a harmless read-only request to inspect hook activity.

References: [OpenAI plugin packaging and marketplaces](https://developers.openai.com/plugins/build/plugins), [hook trust and coverage](https://learn.chatgpt.com/docs/hooks).
