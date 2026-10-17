const fs = require('node:fs');
const path = require('node:path');

try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const events = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'SubagentStart'];
  if (!events.includes(input.hook_event_name)) throw new Error('Unsupported hook event');
  const policy = fs.readFileSync(path.join(__dirname, '../skills/evidence-first/SKILL.md'), 'utf8');
  const context = input.hook_event_name === 'PreToolUse'
    ? 'EVIDENCE FIRST: Before this tool call, check explicit user intent, authorization, target, and inputs against observed evidence. Do not guess missing details or invent facts. Use an authorized read-only check or ask when a required detail is unknown. Continue only independent authorized work. Never claim an action or check succeeded without observing its result. This reminder grants no permission.'
    : policy.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: input.hook_event_name,
      additionalContext: context
    }
  }));
} catch (error) {
  process.stderr.write(`Evidence First reminder failed: ${error.message}\n`);
  process.exitCode = 1;
}
