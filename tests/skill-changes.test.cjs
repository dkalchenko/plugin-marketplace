const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { checkSkillChanges, listSkills } = require('../global-reminders/hooks/skill-changes.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-changes-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cwd = path.join(root, 'workspace');
  const codexHome = path.join(root, 'codex');
  fs.mkdirSync(cwd);
  function install(version = '0.3.1') {
    const plugin = path.join(root, 'plugins', 'code-style', version);
    const skill = path.join(plugin, 'skills', 'style');
    fs.mkdirSync(path.join(skill, 'references'), { recursive: true });
    fs.writeFileSync(path.join(plugin, 'plugin.json'), JSON.stringify({ name: 'code-style', version }));
    fs.writeFileSync(path.join(skill, 'SKILL.md'), '---\nname: style\ndescription: Style rules.\n---\nRead [rules](references/rules.md).\n');
    fs.writeFileSync(path.join(skill, 'references', 'rules.md'), 'Original rules.');
    return { name: 'code-style:style', pluginId: 'code-style@plugin-marketplace', enabled: true, path: path.join(skill, 'SKILL.md') };
  }
  const first = install();
  let inventory = { data: [{ cwd, errors: [], skills: [first] }] };
  const options = { codexHome, loadInventory: async () => inventory };
  const input = { cwd, session_id: 'chat-one', hook_event_name: 'UserPromptSubmit' };
  return {
    root, cwd, codexHome, first, install, options, input,
    check: overrides => checkSkillChanges({ ...input, ...overrides }, options),
    setSkills: skills => { inventory = { data: [{ cwd, errors: [], skills }] }; },
    setInventory: value => { inventory = value; },
    reference: path.join(path.dirname(first.path), 'references', 'rules.md'),
    stateFiles: () => fs.readdirSync(path.join(codexHome, 'state', 'dkalchenko-skill-routing'), { recursive: true })
      .filter(file => file.endsWith('.json')).map(file => path.join(codexHome, 'state', 'dkalchenko-skill-routing', file))
  };
}

test('initial and unchanged prompts stay quiet without rewriting state', async t => {
  const f = fixture(t);
  assert.equal(await f.check({ hook_event_name: 'SessionStart' }), '');
  const [state] = f.stateFiles();
  fs.utimesSync(state, 1000, 1000);
  assert.equal(await f.check(), '');
  assert.equal(fs.statSync(state).mtimeMs, 1000000);
  const saved = JSON.parse(fs.readFileSync(state, 'utf8'));
  const skill = Object.values(saved.skills)[0];
  assert.equal(skill.resolvedPath, fs.realpathSync(f.first.path));
  assert.match(skill.hash, /^[a-f0-9]{64}$/);
  assert.equal(Object.keys(skill.files).length, 2);
  assert.ok(!fs.readFileSync(state, 'utf8').includes('Original rules.'));
});

test('reference edits, additions, and deletions notify once each, including same-size edits', async t => {
  const f = fixture(t);
  await f.check();
  const before = fs.statSync(f.reference);
  fs.writeFileSync(f.reference, 'Modified rules.');
  fs.utimesSync(f.reference, before.atime, before.mtime);
  assert.match(await f.check(), /Re-read its current SKILL.md.*references before applying/);
  assert.equal(await f.check(), '');
  const extra = path.join(path.dirname(f.reference), 'nested', 'extra.md');
  fs.mkdirSync(path.dirname(extra));
  fs.writeFileSync(extra, 'New supporting rules.');
  assert.match(await f.check(), /SKILL CHANGES/);
  fs.unlinkSync(extra);
  assert.match(await f.check(), /SKILL CHANGES/);
  fs.unlinkSync(f.reference);
  assert.match(await f.check(), /SKILL CHANGES/);
  assert.equal(await f.check(), '');
});

test('SKILL.md edits and upgrades report the current path and versions', async t => {
  const f = fixture(t);
  await f.check();
  fs.appendFileSync(f.first.path, '\nA new instruction.');
  assert.match(await f.check(), /discard previously loaded rules/);
  const upgraded = f.install('0.3.2');
  f.setSkills([upgraded]);
  const notice = await f.check();
  assert.match(notice, /changed from "0.3.1" to "0.3.2"/);
  assert.ok(notice.includes(JSON.stringify(fs.realpathSync(upgraded.path))));
  assert.equal(await f.check(), '');
});

test('moving a skill without changing its content or version still notifies', async t => {
  const f = fixture(t);
  await f.check();
  const original = path.dirname(path.dirname(path.dirname(f.first.path)));
  const moved = path.join(f.root, 'moved-plugin');
  fs.cpSync(original, moved, { recursive: true });
  f.setSkills([{ ...f.first, path: path.join(moved, 'skills', 'style', 'SKILL.md') }]);
  assert.match(await f.check(), /changed \(content or resolved path\)/);
});

test('shared Markdown references inside the plugin are followed recursively', async t => {
  const f = fixture(t);
  const plugin = path.dirname(path.dirname(path.dirname(f.first.path)));
  const shared = path.join(plugin, 'shared.md');
  const nested = path.join(plugin, 'nested.md');
  fs.writeFileSync(shared, 'Read [more][nested].\n[nested]: nested.md\n');
  fs.writeFileSync(nested, 'Shared rules.');
  fs.appendFileSync(f.first.path, '\nRead [shared](../../shared.md).');
  await f.check();
  fs.writeFileSync(nested, 'Updated shared rules.');
  assert.match(await f.check(), /SKILL CHANGES/);
  assert.equal(await f.check(), '');
});

test('sessions are independent and resume does not swallow pending changes', async t => {
  const f = fixture(t);
  await f.check();
  await f.check({ session_id: 'chat-two' });
  fs.writeFileSync(f.reference, 'Changed rules.');
  assert.equal(await f.check({ hook_event_name: 'SessionStart', source: 'resume' }), '');
  assert.match(await f.check(), /SKILL CHANGES/);
  assert.match(await f.check({ session_id: 'chat-two' }), /SKILL CHANGES/);
  assert.equal(await f.check({ session_id: 'brand-new-chat' }), '');
  assert.equal(f.stateFiles().length, 3);
});

test('only enabled skills with verified marketplace provider IDs are tracked', async t => {
  const f = fixture(t);
  f.setSkills([
    f.first,
    { ...f.first, enabled: false, path: '/missing/disabled/SKILL.md' },
    { ...f.first, pluginId: 'code-style@another-marketplace', path: '/missing/other/SKILL.md' },
    { ...f.first, pluginId: null, path: '/missing/standalone/SKILL.md' }
  ]);
  await f.check();
  const saved = JSON.parse(fs.readFileSync(f.stateFiles()[0], 'utf8'));
  assert.equal(Object.keys(saved.skills).length, 1);
  f.setSkills([{ ...f.first, enabled: false }]);
  assert.match(await f.check(), /no longer in the enabled inventory/);
  assert.equal(await f.check(), '');
  f.setSkills([f.first]);
  assert.match(await f.check(), /newly enabled or available/);
});

test('failed or partial inventory and unreadable files preserve the last good snapshot', async t => {
  const f = fixture(t);
  await f.check();
  const state = f.stateFiles()[0];
  const saved = fs.readFileSync(state, 'utf8');
  f.setInventory({ data: [{ cwd: f.cwd, errors: [{ message: 'load failed' }], skills: [] }] });
  await assert.rejects(f.check(), /incomplete/);
  assert.equal(fs.readFileSync(state, 'utf8'), saved);
  f.setInventory({ data: [] });
  await assert.rejects(f.check(), /incomplete/);
  f.setSkills([{ ...f.first, pluginId: undefined }]);
  await assert.rejects(f.check(), /provider metadata/);
  f.setSkills([{ ...f.first, enabled: undefined }]);
  await assert.rejects(f.check(), /enablement/);
  f.setSkills([{ ...f.first, path: path.join(f.root, 'missing', 'SKILL.md') }]);
  await assert.rejects(f.check(), /ENOENT/);
  assert.equal(fs.readFileSync(state, 'utf8'), saved);
  f.setSkills([f.first]);
  fs.writeFileSync(f.reference, 'Rules after recovery.');
  assert.match(await f.check(), /SKILL CHANGES/);
});

test('tool and subagent events do not consume changes or query inventory', async t => {
  const f = fixture(t);
  await f.check();
  fs.writeFileSync(f.reference, 'Pending rules.');
  f.options.loadInventory = async () => { throw new Error('must not query'); };
  assert.equal(await f.check({ hook_event_name: 'PreToolUse' }), '');
  assert.equal(await f.check({ hook_event_name: 'SubagentStart' }), '');
});

test('missing chat IDs cannot create shared state, and corrupt state is left intact', async t => {
  const f = fixture(t);
  await assert.rejects(f.check({ session_id: undefined }), /session_id/);
  assert.equal(fs.existsSync(f.codexHome), false);
  await f.check();
  const state = f.stateFiles()[0];
  fs.writeFileSync(state, '{broken');
  await assert.rejects(f.check(), SyntaxError);
  assert.equal(fs.readFileSync(state, 'utf8'), '{broken');
});

test('concurrent prompt checks emit one notice', async t => {
  const f = fixture(t);
  await f.check();
  fs.writeFileSync(f.reference, 'Changed rules.');
  const notices = await Promise.all([f.check(), f.check()]);
  assert.equal(notices.filter(Boolean).length, 1);
});

test('the inventory adapter uses the Codex initialization and forceReload protocol', async t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.cwd, 'app-server'), `
    const readline = require('node:readline');
    let initialized = false;
    readline.createInterface({ input: process.stdin }).on('line', line => {
      const message = JSON.parse(line);
      if (message.method === 'initialize') console.log(JSON.stringify({ id: message.id, result: {} }));
      if (message.method === 'initialized') initialized = true;
      if (message.method === 'skills/list') {
        if (!initialized || !message.params.forceReload || message.params.cwds[0] !== process.cwd()) process.exit(2);
        console.log(JSON.stringify({ id: message.id, result: { data: [{ cwd: process.cwd(), skills: [], errors: [] }] } }));
      }
    });
  `);
  const result = await listSkills(f.cwd, { executable: process.execPath });
  assert.equal(result.data[0].cwd, f.cwd);
  fs.writeFileSync(path.join(f.cwd, 'app-server'), 'process.stdin.resume();');
  await assert.rejects(listSkills(f.cwd, { executable: process.execPath, timeout: 200 }), /timed out/);
});

test('routing hook keeps valid output on tracking failure and honors declines', t => {
  const f = fixture(t);
  const hook = path.resolve(__dirname, '../global-reminders/hooks/remind.cjs');
  for (const status of ['enabled', 'declined']) {
    fs.writeFileSync(path.join(f.cwd, 'AGENTS.md'), `<!-- dkalchenko:skill-routing:start -->\nSkill routing: ${status}\n<!-- dkalchenko:skill-routing:end -->`);
    const result = spawnSync(process.execPath, [hook], {
      input: JSON.stringify(f.input), encoding: 'utf8',
      env: { ...process.env, CODEX_HOME: f.codexHome, DKALCHENKO_CODEX_BIN: path.join(f.root, 'missing-codex') }
    });
    assert.equal(result.status, 0);
    const output = JSON.parse(result.stdout).hookSpecificOutput;
    assert.equal(output.hookEventName, 'UserPromptSubmit');
    assert.match(output.additionalContext, /AGENTS SKILL ROUTING/);
    assert.ok(!output.additionalContext.includes('SKILL CHANGES'));
    if (status === 'enabled') assert.match(result.stderr, /skill-change check skipped/);
    else assert.equal(result.stderr, '');
  }
});
