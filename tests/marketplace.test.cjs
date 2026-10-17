const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, '.agents/plugins/marketplace.json'), 'utf8'));
assert.equal(catalog.name, 'plugin-marketplace');
assert.ok(catalog.plugins.length > 0);
assert.ok(!fs.existsSync(path.join(root, 'plugin.json')));
const names = new Set();
const folders = new Set();
for (const plugin of catalog.plugins) {
  assert.ok(!names.has(plugin.name), `Duplicate plugin name: ${plugin.name}`);
  names.add(plugin.name);
  assert.equal(plugin.source.source, 'local');
  assert.ok(plugin.source.path.startsWith('./plugins/'));
  const folder = fs.realpathSync(path.resolve(root, plugin.source.path));
  assert.ok(folder.startsWith(fs.realpathSync(path.join(root, 'plugins')) + path.sep));
  assert.ok(!folders.has(folder), `Duplicate plugin folder: ${folder}`);
  folders.add(folder);
  const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'plugin.json'), 'utf8'));
  assert.equal(plugin.name, manifest.name);
  assert.equal(manifest.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(plugin.policy.installation, 'AVAILABLE');
  assert.equal(plugin.policy.authentication, 'ON_INSTALL');
  assert.ok(plugin.category.length > 0);
}
console.log(`PASS: marketplace identity and ${catalog.plugins.length} unique plugin entries, paths, and manifests`);
