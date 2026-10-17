const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, '.codex-plugin/plugin.json'), 'utf8'));
assert.equal(manifest.name, 'evidence-first');
assert.ok(!fs.existsSync(path.join(root, 'plugin.json')), 'A portable root manifest bypasses hook loading in affected Codex versions');
assert.equal(manifest.skills, './skills/');
assert.ok(manifest.interface.shortDescription.length <= 30);
const skill = fs.readFileSync(path.join(root, 'skills/evidence-first/SKILL.md'), 'utf8');
const frontmatter = skill.match(/^---\r?\nname: ([a-z-]+)\r?\ndescription: ("[^\r\n]+")\r?\n---/);
assert.ok(frontmatter);
assert.equal(frontmatter[1], manifest.name);
assert.ok(JSON.parse(frontmatter[2]).length > 0);
const hooks = JSON.parse(fs.readFileSync(path.join(root, manifest.hooks), 'utf8')).hooks;
assert.deepEqual(Object.keys(hooks).sort(), ['PreToolUse', 'SessionStart', 'SubagentStart', 'UserPromptSubmit']);
for (const [event, groups] of Object.entries(hooks)) {
  assert.equal(groups.length, 1);
  assert.equal(groups[0].matcher, undefined);
  const handler = groups[0].hooks[0];
  assert.equal(handler.type, 'command');
  assert.equal(handler.async, undefined);
  const result = spawnSync(handler.command, {
    shell: true,
    cwd: require('node:os').tmpdir(),
    env: { ...process.env, PLUGIN_ROOT: root },
    input: JSON.stringify({ hook_event_name: event, tool_input: { command: 'DO NOT EXECUTE THIS' } }),
    encoding: 'utf8',
    timeout: 5000
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  const output = JSON.parse(result.stdout);
  assert.deepEqual(Object.keys(output), ['hookSpecificOutput']);
  assert.equal(output.hookSpecificOutput.hookEventName, event);
  assert.match(output.hookSpecificOutput.additionalContext, /evidence/i);
  assert.match(output.hookSpecificOutput.additionalContext, /ask/i);
  assert.ok(output.hookSpecificOutput.additionalContext.length < 6500);
  assert.ok(!result.stdout.includes('DO NOT EXECUTE THIS'));
}
for (const input of ['{', '{}', 'null', '{"hook_event_name":"Stop"}']) {
  const result = spawnSync(process.execPath, [path.join(root, 'hooks/remind.cjs')], { input, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /Evidence First reminder failed/);
}
console.log('PASS: manifests, all four hook commands, context outputs, and invalid inputs');
