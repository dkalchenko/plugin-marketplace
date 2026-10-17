# Evidence First

Instructions and local reminder hooks for avoiding invented facts and silent assumptions about user intent.

## Behavior

- Ask when missing information determines the answer or action.
- Verify facts and command targets from inspected evidence.
- Report unknowns, incomplete searches, and conflicting evidence honestly.
- Never invent citations, results, completed actions, or missing requirements.
- Continue independent, authorized work while waiting for clarification.

The skill is `skills/evidence-first/SKILL.md`. The hook handler only reads its packaged policy and hook input and writes a reminder. It does not execute the pending command, access the network, read transcripts, or modify files.

## Hooks

| Event | Reminder |
| --- | --- |
| SessionStart | Full policy, including resume and compaction |
| UserPromptSubmit | Full policy before each new user request |
| PreToolUse | Short check before each supported tool call |
| SubagentStart | Full policy for a new subagent |

Requires Node.js available as `node` in the host execution environment. No dependencies need installation. Hook commands locate the packaged script using `PLUGIN_ROOT`, including paths containing spaces.

## Installation

See the [marketplace installation guide](../../README.md) for GitHub HTTPS, private SSH, local installation, and hook trust steps. The install selector is `evidence-first@plugin-marketplace`.

HUMAN ACTION: After registering the marketplace, run:

```powershell
codex plugin add evidence-first@plugin-marketplace
```

HUMAN ACTION: Review and trust the hooks in the host, start a new local chat with Evidence First enabled, and explicitly request its policy.

## ChatGPT and limits

The skill can be used in ChatGPT and Codex where the host supports plugin skills. You can also paste the skill body into conversation or project instructions. Automatic reminder hooks require a supported local Codex runtime and manual installation and trust. Installing on the web does not deploy local scripts; this package does not install itself into a ChatGPT account.

The plugin cannot inspect hidden reasoning, detect every invented claim, guarantee zero hallucinations, or override higher-priority instructions. PreToolUse covers supported local tool calls; hosted web search, ongoing terminal input/polls, and some specialized paths are not covered. A reminder does not approve or block a command. Hook failures are reported and are not a fail-closed enforcement mechanism. Frequent reminders consume context and add process startup time.

This plugin is distributed through the GitHub/local marketplace, not a public-directory submission. Plugins containing lifecycle hooks are currently ineligible for the public directory.

## Verification

Run `node tests/hooks.test.cjs` from this directory. It checks the manifest, all four configured commands from an unrelated working directory, reminder output, and invalid hook inputs. Host installation, hook trust, and model behavior require the separate smoke check in the marketplace guide.

Implementation references checked on 2026-10-17:

- [Official plugin packaging and hook installation](https://developers.openai.com/plugins/build/plugins)
- [Official hooks events, output format, trust, and coverage](https://learn.chatgpt.com/docs/hooks)
