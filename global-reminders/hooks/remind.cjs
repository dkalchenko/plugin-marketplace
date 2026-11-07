const fs = require('node:fs');
const path = require('node:path');
const { checkSkillChanges } = require('./skill-changes.cjs');

const start = '<!-- dkalchenko:skill-routing:start -->';
const end = '<!-- dkalchenko:skill-routing:end -->';

function inspectRouting(cwd) {
  if (typeof cwd !== 'string' || !path.isAbsolute(cwd)) {
    return { status: 'unknown', reason: 'The hook received no absolute workspace cwd.' };
  }
  const files = [];
  let current = path.resolve(cwd);
  let decision;
  while (true) {
    const file = path.join(current, 'AGENTS.md');
    try {
      const text = fs.readFileSync(file, 'utf8');
      files.push(file);
      const opening = text.indexOf(start);
      const closing = text.indexOf(end, opening + start.length);
      if (!decision && opening !== -1 && closing !== -1) {
        const block = text.slice(opening + start.length, closing);
        const match = block.match(/^Skill routing: (enabled|declined)\s*$/m);
        if (match) decision = { status: match[1], file };
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        return { status: 'unknown', files, reason: 'An applicable AGENTS.md could not be read.' };
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return { status: 'unrecorded', files, ...decision };
}

async function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const events = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'SubagentStart'];
  if (!input || !events.includes(input.hook_event_name)) {
    throw new Error('Unsupported hook event');
  }
  const routing = inspectRouting(input.cwd);
  const setupPath = path.join(__dirname, '../skills/dkalchenko-manage-agents/SKILL.md');
  const instructions = {
    enabled: 'Follow the recorded task-to-skill routing. At session start and before handling a new user prompt, synchronize its managed inventory only with enabled skills from plugins in plugin-marketplace: remove confirmed out-of-scope managed rows, add newly enabled in-scope skills and remove confirmed disabled or uninstalled skills. Accepted setup authorizes routine synchronization; do not ask again. Never infer disablement from partial or stale inventory. Preserve instructions outside the managed section, skip unchanged writes, and do not repeat the check for every tool call unless the inventory changes. Load only skills relevant to the task.',
    declined: 'The user recorded a decline. Honor it and do not ask again unless the user requests reconsideration. Existing instructions and explicit skill requests still apply.',
    unrecorded: 'No managed decision was found. First read the files: existing unmarked routing requirements also count. If no routing requirement or explicit decline exists, ask once whether to add routing only for enabled skills from plugins in plugin-marketplace; explain that a no will be recorded in AGENTS.md. Wait for the answer before editing, do not repeat a pending question, and use the setup workflow to record the answer. Respect a refusal to write the file.',
    unknown: 'Resolve the actual workspace and inspect applicable instructions before deciding whether setup is needed. Do not infer consent or absence of routing from this incomplete check.'
  };
  let changes = '';
  if (routing.status === 'enabled') {
    try {
      changes = await checkSkillChanges(input);
    } catch (error) {
      // Tracking is advisory. An unavailable inventory or unreadable file must
      // not block the prompt or erase the previous successful snapshot.
      process.stderr.write(`AGENTS skill-change check skipped: ${error.message}\n`);
    }
  }
  const context = `AGENTS SKILL ROUTING: Read applicable AGENTS.md files to determine which skills to use for this task, including more specific files for the target paths. Hook check: ${JSON.stringify(routing)}. ${instructions[routing.status]} For initialization or reconciliation, read the generic workflow at ${JSON.stringify(setupPath)}. Verify the supplying plugin and marketplace identity using the host inventory. Exclude standalone skills and other marketplaces. Skill-change checks use the local Codex skills/list inventory; if this chat's host inventory differs, reconcile it before applying updated rules. This is a reminder, not permission to edit or override project instructions.${changes ? `\n\n${changes}` : ''}`;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: input.hook_event_name,
      additionalContext: context
    }
  }));
}

main().catch(error => {
  process.stderr.write(`AGENTS skill-routing reminder failed: ${error.message}\n`);
  process.exitCode = 1;
});
