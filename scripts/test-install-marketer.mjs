import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repositoryRoot = process.cwd();
const installer = path.join(repositoryRoot, '.claude/skills/install-marketer/scripts/install.sh');
const sourceDirectory = path.join(repositoryRoot, 'skills');
const skillNames = fs.readdirSync(sourceDirectory, {withFileTypes: true})
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(sourceDirectory, entry.name, 'SKILL.md')))
  .map((entry) => entry.name)
  .sort();

assert.ok(skillNames.length > 0, 'expected at least one installable skill');

function run(action, target) {
  return spawnSync('bash', [installer, action], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: {...process.env, MARKETER_INSTALL_TARGETS: target},
  });
}

function expectSuccess(result, label) {
  assert.equal(result.status, 0, `${label} failed:\n${result.stdout}\n${result.stderr}`);
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'marketer7-installer-'));
const target = path.join(tempRoot, 'agent skills');
const absentTarget = path.join(tempRoot, 'not-created');
const foreignSource = path.join(tempRoot, 'foreign-skill');

try {
  fs.mkdirSync(target, {recursive: true});
  fs.writeFileSync(path.join(target, 'marketer'), 'keep this unrelated skill');

  const firstInstall = run('install', target);
  expectSuccess(firstInstall, 'first install');
  assert.match(firstInstall.stdout, /skip\s+marketer \(exists and is not a symlink\)/);

  for (const skill of skillNames) {
    const destination = path.join(target, skill);
    if (skill === 'marketer') {
      assert.equal(fs.readFileSync(destination, 'utf8'), 'keep this unrelated skill');
    } else {
      assert.equal(fs.readlinkSync(destination), path.join(sourceDirectory, skill), `${skill} should link to this checkout`);
    }
  }

  const secondInstall = run('install', target);
  expectSuccess(secondInstall, 'idempotent install');
  assert.match(secondInstall.stdout, /ok\s+marketer-task \(already linked\)/);

  fs.rmSync(path.join(target, 'marketer-task'));
  fs.writeFileSync(foreignSource, 'foreign skill source');
  fs.symlinkSync(foreignSource, path.join(target, 'marketer-task'));

  const collisionInstall = run('install', target);
  expectSuccess(collisionInstall, 'collision install');
  assert.match(collisionInstall.stdout, /skip\s+marketer-task \(link points elsewhere:/);
  assert.equal(fs.readlinkSync(path.join(target, 'marketer-task')), foreignSource);

  const status = run('status', target);
  expectSuccess(status, 'status');
  assert.match(status.stdout, /marketer\s+exists \(not a symlink\)/);
  assert.match(status.stdout, /marketer-task\s+linked to /);

  const missingStatus = run('status', absentTarget);
  expectSuccess(missingStatus, 'missing-target status');
  assert.match(missingStatus.stdout, /target does not exist/);
  assert.equal(fs.existsSync(absentTarget), false, 'status must not create a target');

  const relativeTarget = run('status', 'relative-target');
  assert.notEqual(relativeTarget.status, 0, 'relative override target must fail');
  assert.match(relativeTarget.stderr, /MARKETER_INSTALL_TARGETS entries must be absolute paths/);

  const uninstall = run('uninstall', target);
  expectSuccess(uninstall, 'uninstall');
  assert.equal(fs.readFileSync(path.join(target, 'marketer'), 'utf8'), 'keep this unrelated skill');
  assert.equal(fs.readlinkSync(path.join(target, 'marketer-task')), foreignSource);
  for (const skill of skillNames) {
    if (skill !== 'marketer' && skill !== 'marketer-task') {
      assert.equal(fs.existsSync(path.join(target, skill)), false, `${skill} should have been unlinked`);
    }
  }

  const unknownAction = run('replace-everything', target);
  assert.notEqual(unknownAction.status, 0, 'unknown action must fail');
  assert.match(unknownAction.stderr, /usage: install\.sh \[install\|uninstall\|status\]/);

  console.log(`PASS — Marketer installer (${skillNames.length} discovered skills; install, status, collision, uninstall, and usage checks)`);
} finally {
  fs.rmSync(tempRoot, {recursive: true, force: true});
}
