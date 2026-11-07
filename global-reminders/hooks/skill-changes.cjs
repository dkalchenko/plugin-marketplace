const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { spawn } = require('node:child_process');

const marketplace = '@plugin-marketplace';
const digest = value => createHash('sha256').update(value).digest('hex');
const pathKey = value => process.platform === 'win32' ? path.resolve(value).toLowerCase() : path.resolve(value);

// Ask Codex to resolve configured, enabled skills. Cache directories and the
// marketplace catalog are not an enabled-skill inventory.
function listSkills(cwd, { executable = process.env.DKALCHENKO_CODEX_BIN || 'codex', timeout = 3000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ['app-server', '--listen', 'stdio://'], {
      cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'ignore']
    });
    let buffer = '';
    let bytes = 0;
    let settled = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill();
      if (error) reject(error);
      else resolve(result);
    };
    const timer = setTimeout(() => finish(new Error('Codex skill inventory timed out.')), timeout);
    const send = message => child.stdin.write(`${JSON.stringify(message)}\n`);
    child.on('error', () => finish(new Error('Could not start the Codex skill inventory.')));
    child.on('exit', () => finish(new Error('Codex exited before returning the skill inventory.')));
    child.stdin.on('error', () => finish(new Error('Could not request the Codex skill inventory.')));
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > 8 * 1024 * 1024) return finish(new Error('Codex skill inventory exceeded the size limit.'));
      buffer += chunk;
      let newline;
      while (!settled && (newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        try {
          const message = JSON.parse(line);
          if (message.id !== 1 && message.id !== 2) continue;
          if (message.error) throw new Error('Codex could not resolve the skill inventory.');
          if (message.id === 1) {
            send({ method: 'initialized' });
            send({ id: 2, method: 'skills/list', params: { cwds: [cwd], forceReload: true } });
          } else {
            finish(null, message.result);
          }
        } catch (error) {
          finish(error);
        }
      }
    });
    send({ id: 1, method: 'initialize', params: {
      clientInfo: { name: 'dkalchenko_skill_changes', version: '1.0.0' },
      capabilities: { experimentalApi: true }
    } });
  });
}

function enabledSkills(inventory, cwd) {
  const entry = inventory?.data?.find(item => typeof item.cwd === 'string' && pathKey(item.cwd) === pathKey(cwd));
  if (!entry || !Array.isArray(entry.skills) || !Array.isArray(entry.errors) || entry.errors.length) {
    throw new Error('The skill inventory is incomplete; keeping the previous snapshot.');
  }
  if (entry.skills.some(skill => !skill || typeof skill.enabled !== 'boolean' ||
      (skill.pluginId !== null && typeof skill.pluginId !== 'string'))) {
    throw new Error('The skill inventory lacks enablement or provider metadata; keeping the previous snapshot.');
  }
  const skills = entry.skills.filter(skill => skill.enabled === true &&
    typeof skill.pluginId === 'string' && skill.pluginId.endsWith(marketplace));
  const identities = new Set();
  for (const skill of skills) {
    if (typeof skill.name !== 'string' || !skill.name || typeof skill.path !== 'string' || !path.isAbsolute(skill.path)) {
      throw new Error('The skill inventory contains an invalid skill.');
    }
    const identity = `${skill.pluginId}/${skill.name}`;
    if (identities.has(identity)) throw new Error('The skill inventory contains duplicate identities.');
    identities.add(identity);
  }
  return skills;
}

function pluginPackage(skillPath, pluginId) {
  const pluginName = pluginId.slice(0, -marketplace.length);
  let folder = path.dirname(skillPath);
  while (true) {
    for (const relative of ['plugin.json', '.codex-plugin/plugin.json']) {
      const manifestPath = path.join(folder, relative);
      let manifest;
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        throw error;
      }
      if (manifest.name === pluginName) {
        return { root: fs.realpathSync(folder), version: typeof manifest.version === 'string' ? manifest.version : null };
      }
    }
    const parent = path.dirname(folder);
    if (parent === folder) throw new Error('Could not find the supplying plugin manifest.');
    folder = parent;
  }
}

function within(root, file) {
  const relative = path.relative(root, file);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function snapshotSkill(skill) {
  const resolvedPath = fs.realpathSync(skill.path);
  const plugin = pluginPackage(resolvedPath, skill.pluginId);
  const files = new Map();
  const visited = new Set();
  let totalBytes = 0;

  function visit(file) {
    const resolved = fs.realpathSync(file);
    if (!within(plugin.root, resolved)) throw new Error('A skill reference resolves outside its supplying plugin.');
    const relative = path.relative(plugin.root, file).split(path.sep).join('/');
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      if (visited.has(resolved)) return;
      visited.add(resolved);
      for (const name of fs.readdirSync(file).sort()) visit(path.join(file, name));
      return;
    }
    if (!stat.isFile()) throw new Error('A skill contains an unsupported file type.');
    if (files.has(relative)) return;
    totalBytes += stat.size;
    if (totalBytes > 32 * 1024 * 1024 || files.size >= 2000) throw new Error('A skill exceeds the snapshot size limit.');
    const content = fs.readFileSync(resolved);
    files.set(relative, { resolvedPath: resolved, hash: digest(content) });
    // Follow Markdown file links as well as all files in the skill directory,
    // including shared references elsewhere inside the same plugin package.
    if (/\.md$/i.test(file)) {
      const text = content.toString('utf8');
      const links = [...text.matchAll(/\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g)]
        .map(match => match[1] || match[2]);
      for (const match of text.matchAll(/^\s*\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/gm)) links.push(match[1] || match[2]);
      for (const link of links) {
        if (/^(?:[a-z][a-z\d+.-]*:|[\/\\#])/i.test(link)) continue;
        const target = decodeURIComponent(link.split(/[?#]/)[0]);
        if (!target) continue;
        const reference = path.resolve(path.dirname(file), target);
        if (!within(plugin.root, reference)) continue;
        // A deleted reference is represented by its absence. Other read errors
        // abort the snapshot, rather than reporting a spurious content change.
        try { visit(reference); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
    }
  }

  visit(path.dirname(resolvedPath));
  const sorted = [...files.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
  return {
    pluginId: skill.pluginId, name: skill.name, path: skill.path, resolvedPath,
    version: plugin.version, hash: digest(JSON.stringify(sorted)), files: Object.fromEntries(sorted)
  };
}

function describeChanges(previous, current) {
  const notices = [];
  for (const [identity, skill] of Object.entries(current)) {
    const before = previous[identity];
    const label = `${skill.pluginId}: ${skill.name}`;
    if (!before) {
      notices.push(`${label} is newly enabled or available. Read its current SKILL.md at ${JSON.stringify(skill.resolvedPath)} and references before applying its rules.`);
    } else if (before.hash !== skill.hash || before.path !== skill.path || before.resolvedPath !== skill.resolvedPath || before.version !== skill.version) {
      const version = before.version !== skill.version && before.version && skill.version
        ? ` changed from ${JSON.stringify(before.version)} to ${JSON.stringify(skill.version)}` : ' changed (content or resolved path)';
      notices.push(`${label}${version}. Re-read its current SKILL.md at ${JSON.stringify(skill.resolvedPath)} and references before applying its rules; discard previously loaded rules for this skill.`);
    }
  }
  for (const [identity, skill] of Object.entries(previous)) {
    if (!Object.hasOwn(current, identity)) {
      notices.push(`${skill.pluginId}: ${skill.name} is no longer in the enabled inventory. Stop applying its cached rules and reconcile the managed routing table with the current host inventory.`);
    }
  }
  return notices;
}

async function checkSkillChanges(input, { codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), loadInventory = listSkills } = {}) {
  if (!['SessionStart', 'UserPromptSubmit'].includes(input.hook_event_name)) return '';
  if (typeof input.session_id !== 'string' || !input.session_id || typeof input.cwd !== 'string' || !path.isAbsolute(input.cwd)) {
    throw new Error('Skill change tracking requires a session_id and absolute cwd.');
  }
  const folder = path.join(codexHome, 'state', 'dkalchenko-skill-routing', digest(input.session_id));
  const statePath = path.join(folder, `${digest(pathKey(input.cwd))}.json`);
  // SessionStart establishes a baseline only. Resume/compaction must not consume
  // an update before the next user prompt can receive its reload instruction.
  if (input.hook_event_name === 'SessionStart' && fs.existsSync(statePath)) return '';
  fs.mkdirSync(folder, { recursive: true });
  const lockPath = `${statePath}.lock`;
  let lock;
  try {
    lock = fs.openSync(lockPath, 'wx');
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (Date.now() - fs.statSync(lockPath).mtimeMs < 30000) return '';
    fs.unlinkSync(lockPath);
    lock = fs.openSync(lockPath, 'wx');
  }
  let temporary;
  try {
    let previous;
    try {
      previous = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      if (previous.schemaVersion !== 1 || !previous.skills || typeof previous.skills !== 'object' || Array.isArray(previous.skills)) {
        throw new Error('Unsupported skill snapshot; remove the chat state file to establish a new baseline.');
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (input.hook_event_name === 'SessionStart' && previous) return '';
    const skills = enabledSkills(await loadInventory(input.cwd), input.cwd);
    const snapshots = skills.map(skill => [`${skill.pluginId}/${skill.name}`, snapshotSkill(skill)])
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
    const current = Object.fromEntries(snapshots);
    const notices = previous ? describeChanges(previous.skills, current) : [];
    const serialized = JSON.stringify({ schemaVersion: 1, skills: current }, null, 2) + '\n';
    if (!previous || JSON.stringify(previous.skills) !== JSON.stringify(current)) {
      temporary = `${statePath}.${randomUUID()}.tmp`;
      fs.writeFileSync(temporary, serialized, { flag: 'wx', mode: 0o600 });
      fs.renameSync(temporary, statePath);
      temporary = undefined;
    }
    return notices.length ? `SKILL CHANGES (this chat):\n${notices.join('\n')}\nLoad only skills relevant to the task and preserve explicit invocation policies.` : '';
  } finally {
    if (temporary) fs.rmSync(temporary, { force: true });
    fs.closeSync(lock);
    fs.unlinkSync(lockPath);
  }
}

module.exports = { listSkills, enabledSkills, snapshotSkill, checkSkillChanges };
