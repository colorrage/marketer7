import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMarketerState } from './validate-marketer-state.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseFixture = path.join(repositoryRoot, 'fixtures', 'marketer', 'valid-lifecycle');

function replaceInFixture(tempRoot, relativePath, before, after) {
  const target = path.join(tempRoot, '.marketer', relativePath);
  const source = fs.readFileSync(target, 'utf8');
  if (!source.includes(before)) throw new Error(`${relativePath}: expected fixture text was not found: ${before}`);
  fs.writeFileSync(target, source.replace(before, after));
}

function fingerprintExperiment(tempRoot) {
  const target = path.join(tempRoot, '.marketer', 'experiments', 'EX-001-lifecycle-email', 'experiment.md');
  const source = fs.readFileSync(target, 'utf8');
  const start = source.indexOf('## Hypothesis');
  const end = source.indexOf('## Criteria lock');
  const canonical = source.slice(start, end).replace(/\r\n/g, '\n').split('\n').map((line) => line.trimEnd()).join('\n').trim();
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

function refreshReviewFingerprint(tempRoot) {
  const relativePath = 'experiments/EX-001-lifecycle-email/review.md';
  const target = path.join(tempRoot, '.marketer', relativePath);
  const source = fs.readFileSync(target, 'utf8');
  fs.writeFileSync(target, source.replace(/^criteria_fingerprint: .+$/m, `criteria_fingerprint: ${fingerprintExperiment(tempRoot)}`));
}

function removeFixtureFile(tempRoot, relativePath) {
  fs.rmSync(path.join(tempRoot, '.marketer', relativePath), {force: true});
}

function setUnknownPrimary(tempRoot) {
  replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', 'status: win', 'status: inconclusive');
  replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/measurement.md', 'status: recorded', 'status: unknown');
  replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/measurement.md', 'primary_value: 125', 'primary_value: unknown');
  replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'verdict: win', 'verdict: inconclusive');
  replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'primary_value: 125', 'primary_value: unknown');
}

const cases = [
  {name: 'complete win lifecycle', expect: 'pass'},
  {
    name: 'unknown primary metric stays inconclusive',
    expect: 'pass',
    mutate: setUnknownPrimary,
  },
  {
    name: 'unmeasurable definition is rejected',
    expect: 'fail',
    error: 'tracking is required before planning',
    mutate: (tempRoot) => replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', '| Tracking | local fixture export `qualified_signup` grouped by experiment ID |', '| Tracking | <tracking> |'),
  },
  {
    name: 'missing review gate is rejected',
    expect: 'fail',
    error: 'approved-or-later experiment needs status passed',
    mutate: (tempRoot) => replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/review.md', 'status: passed', 'status: not_reviewed'),
  },
  {
    name: 'pre-approval execution is rejected',
    expect: 'fail',
    error: 'planned experiment cannot execute before approval',
    mutate: (tempRoot) => replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', 'status: win', 'status: planned'),
  },
  {
    name: 'altered locked criterion is rejected',
    expect: 'fail',
    error: 'criteria fingerprint must match the locked experiment definition',
    mutate: (tempRoot) => replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', '| Success threshold | >= 120 |', '| Success threshold | >= 130 |'),
  },
  {
    name: 'vanity metric cannot override the primary KPI',
    expect: 'fail',
    error: 'verdict must follow locked primary-KPI thresholds',
    mutate: (tempRoot) => {
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/measurement.md', 'primary_value: 125', 'primary_value: 95');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'primary_value: 125', 'primary_value: 95');
    },
  },
  {
    name: 'missing primary metric cannot produce a win',
    expect: 'fail',
    error: 'verdict must follow locked primary-KPI thresholds',
    mutate: (tempRoot) => {
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/measurement.md', 'status: recorded', 'status: unknown');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/measurement.md', 'primary_value: 125', 'primary_value: unknown');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'primary_value: 125', 'primary_value: unknown');
    },
  },
  {
    name: 'learning reroute has a separate decision',
    expect: 'pass',
  },
  {
    name: 'measurement-pending mission is resumable',
    expect: 'pass',
    mutate: (tempRoot) => {
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', 'status: win', 'status: measurement_pending');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/measurement.md', 'status: recorded', 'status: not_recorded');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'status: complete', 'status: not_started');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'verdict: win', 'verdict: null');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'primary_value: 125', 'primary_value: unknown');
    },
  },
  {
    name: 'legacy project without a Signal7 brief remains valid',
    expect: 'pass',
    mutate: (tempRoot) => {
      removeFixtureFile(tempRoot, 'experiments/EX-001-lifecycle-email/contracts/signal7-execution-brief.md');
      removeFixtureFile(tempRoot, 'experiments/EX-001-lifecycle-email/contracts/external-evidence-reference.md');
    },
  },
  {
    name: 'external evidence reference v1 is accepted',
    expect: 'pass',
  },
  {
    name: 'unknown Signal7 contract major version is rejected',
    expect: 'fail',
    error: 'unknown Signal7 contract major version',
    mutate: (tempRoot) => replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/contracts/signal7-execution-brief.md', 'contract: signal7-execution-brief/v1', 'contract: signal7-execution-brief/v2'),
  },
  {
    name: 'explicit cancellation remains a legal terminal alternative',
    expect: 'pass',
    mutate: (tempRoot) => {
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', 'status: win', 'status: cancelled');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', 'cancelled_at: null', 'cancelled_at: 2026-08-04T00:00:00Z');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', 'cancellation_reason: null', 'cancellation_reason: user withdrew execution authority');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'status: complete', 'status: not_started');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'verdict: win', 'verdict: null');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/evaluation.md', 'primary_value: 125', 'primary_value: unknown');
    },
  },
  {
    name: 'cancellation without a reason is rejected',
    expect: 'fail',
    error: 'cancellation_reason is required for a cancelled experiment',
    mutate: (tempRoot) => {
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', 'status: win', 'status: cancelled');
      replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/experiment.md', 'cancelled_at: null', 'cancelled_at: 2026-08-04T00:00:00Z');
    },
  },
  {
    name: 'malformed contract frontmatter is rejected',
    expect: 'fail',
    error: 'unsupported frontmatter line 1',
    mutate: (tempRoot) => replaceInFixture(tempRoot, 'experiments/EX-001-lifecycle-email/contracts/external-evidence-reference.md', 'schema_version: 1', 'schema_version = 1'),
  },
];

const packageCheck = spawnSync(process.execPath, ['scripts/validate-marketer-package.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

if (packageCheck.status !== 0) {
  process.stderr.write(packageCheck.stdout);
  process.stderr.write(packageCheck.stderr);
  console.error('FAIL — package validation must pass before fixture execution');
  process.exit(1);
}

let passed = 0;
const failures = [];
for (const fixtureCase of cases) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'marketer7-fixture-'));
  try {
    fs.cpSync(baseFixture, tempRoot, {recursive: true});
    fixtureCase.mutate?.(tempRoot);
    const result = validateMarketerState(path.join(tempRoot, '.marketer'));
    const actual = result.errors.length === 0 ? 'pass' : 'fail';
    const expectedErrorFound = fixtureCase.error ? result.errors.some((error) => error.includes(fixtureCase.error)) : true;
    if (actual !== fixtureCase.expect || !expectedErrorFound) {
      failures.push({fixtureCase, result, actual, expectedErrorFound});
      console.error(`FAIL — ${fixtureCase.name}`);
      console.error(`  expected ${fixtureCase.expect}${fixtureCase.error ? ` containing ${fixtureCase.error}` : ''}; received ${actual}`);
      for (const error of result.errors) console.error(`  - ${error}`);
    } else {
      passed += 1;
      console.log(`PASS — ${fixtureCase.name} (${result.checks} checks)`);
    }
  } finally {
    fs.rmSync(tempRoot, {recursive: true, force: true});
  }
}

if (failures.length > 0) {
  console.error(`FAIL — Marketer fixture harness (${passed}/${cases.length} passed)`);
  process.exitCode = 1;
} else {
  console.log(`PASS — Marketer fixture harness (${passed}/${cases.length} passed)`);
}
