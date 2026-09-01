import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateMarketerState} from './validate-marketer-state.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseFixture = path.join(repositoryRoot, 'fixtures', 'marketer', 'valid-lifecycle');
const freshRootFixture = path.join(repositoryRoot, 'fixtures', 'marketer', 'fresh-root');
const experimentRoot = 'experiments/EX-001-lifecycle-email';

function fixturePath(tempRoot, relativePath) {
  return path.join(tempRoot, '.marketer', relativePath);
}

function readFixture(tempRoot, relativePath) {
  return fs.readFileSync(fixturePath(tempRoot, relativePath), 'utf8');
}

function writeFixture(tempRoot, relativePath, content) {
  fs.writeFileSync(fixturePath(tempRoot, relativePath), content);
}

function replaceInFixture(tempRoot, relativePath, before, after) {
  const source = readFixture(tempRoot, relativePath);
  if (!source.includes(before)) throw new Error(`${relativePath}: expected fixture text was not found: ${before}`);
  writeFixture(tempRoot, relativePath, source.replace(before, after));
}

function replaceAllInFixture(tempRoot, relativePath, before, after) {
  const source = readFixture(tempRoot, relativePath);
  if (!source.includes(before)) throw new Error(`${relativePath}: expected fixture text was not found: ${before}`);
  writeFixture(tempRoot, relativePath, source.replaceAll(before, after));
}

function removeFixtureFile(tempRoot, relativePath) {
  fs.rmSync(fixturePath(tempRoot, relativePath), {force: true});
}

function appendFixture(tempRoot, relativePath, content) {
  fs.appendFileSync(fixturePath(tempRoot, relativePath), content);
}

function definitionFromExperiment(tempRoot) {
  const source = readFixture(tempRoot, `${experimentRoot}/experiment.md`);
  const start = source.indexOf('## Hypothesis');
  const end = source.indexOf('## Criteria lock');
  return source.slice(start, end).replace(/\r\n/g, '\n').split('\n').map((line) => line.trimEnd()).join('\n').trim();
}

function fingerprintExperiment(tempRoot) {
  const canonical = definitionFromExperiment(tempRoot);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

function refreshReviewFingerprint(tempRoot) {
  const relativePath = `${experimentRoot}/review.md`;
  const source = readFixture(tempRoot, relativePath);
  const snapshot = `## Locked definition snapshot\n\n\`\`\`markdown\n${definitionFromExperiment(tempRoot)}\n\`\`\``;
  const withSnapshot = source.replace(/^## Locked definition snapshot\s*\n\s*```markdown\n[\s\S]*?\n```/m, snapshot);
  if (withSnapshot === source) throw new Error(`${relativePath}: Locked definition snapshot was not found`);
  writeFixture(tempRoot, relativePath, withSnapshot.replace(/^criteria_fingerprint: .+$/m, `criteria_fingerprint: ${fingerprintExperiment(tempRoot)}`));
}

function refreshOverrideFingerprint(tempRoot) {
  const relativePath = `${experimentRoot}/criteria-overrides/CO-001.md`;
  const source = readFixture(tempRoot, relativePath);
  writeFixture(tempRoot, relativePath, source.replace(/^replacement_criteria_fingerprint: .+$/m, `replacement_criteria_fingerprint: ${fingerprintExperiment(tempRoot)}`));
}

function setUnknownPrimary(tempRoot) {
  replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: inconclusive');
  replaceInFixture(tempRoot, `${experimentRoot}/measurement.md`, 'status: recorded', 'status: unknown');
  replaceInFixture(tempRoot, `${experimentRoot}/measurement.md`, 'primary_value: 125', 'primary_value: unknown');
  replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'verdict: win', 'verdict: inconclusive');
  replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'primary_value: 125', 'primary_value: unknown');
}

function makePaymentEvidence(tempRoot) {
  replaceAllInFixture(tempRoot, 'missions/M1-qualified-signups/mission.md', 'qualified_signups', 'payment_count');
  replaceInFixture(tempRoot, 'missions/M1-qualified-signups/mission.md', 'primary_kpi_tier: signup', 'primary_kpi_tier: payment');
  replaceAllInFixture(tempRoot, 'metrics/baselines.md', 'qualified_signups', 'payment_count');
  replaceAllInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'qualified_signups', 'payment_count');
  replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, '| Primary KPI tier | signup |', '| Primary KPI tier | payment |');
  replaceAllInFixture(tempRoot, `${experimentRoot}/evidence.md`, 'qualified_signups', 'payment_count');
  replaceInFixture(tempRoot, `${experimentRoot}/evidence.md`, '125 signups', '125 payments');
  appendFixture(tempRoot, `${experimentRoot}/evidence.md`, '\n### E-002\n- Observed at: 2026-08-10T00:00:00Z\n- Recorded at: 2026-08-10T00:01:00Z\n- Recorder: fixture-owner\n- Source kind: manual\n- Source reference: fixtures/stated-willingness.csv\n- Metric: willingness_to_pay\n- Value and unit: 400 stated intentions\n- Period: locked seven-day window\n- Evidence strength: C\n- Data quality: medium\n- Note: Supporting stated intention only; it cannot replace payment evidence.\n');
  replaceAllInFixture(tempRoot, `${experimentRoot}/measurement.md`, 'qualified_signups', 'payment_count');
  replaceAllInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'qualified_signups', 'payment_count');
  refreshReviewFingerprint(tempRoot);
}

function addApprovedOverride(tempRoot, {withDecision = true} = {}) {
  const review = readFixture(tempRoot, `${experimentRoot}/review.md`);
  const priorFingerprint = review.match(/^criteria_fingerprint: (.+)$/m)?.[1];
  if (!priorFingerprint) throw new Error('review.md: missing criteria_fingerprint');
  replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, '| Success threshold | >= 120 |', '| Success threshold | >= 130 |');
  replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: inconclusive');
  replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'verdict: win', 'verdict: inconclusive');
  const overrideRoot = fixturePath(tempRoot, `${experimentRoot}/criteria-overrides`);
  fs.mkdirSync(overrideRoot, {recursive: true});
  fs.writeFileSync(path.join(overrideRoot, 'CO-001.md'), `---\nschema_version: 1\nid: CO-001\nexperiment_id: EX-001\nstatus: approved\nrequested_at: 2026-08-10T00:03:00Z\napproved_at: 2026-08-10T00:04:00Z\nactor: fixture-owner\napprover: fixture-approver\nexecution_completed_at: 2026-08-03T00:05:00Z\nchanged_fields: [success_threshold]\nprior_criteria_fingerprint: ${priorFingerprint}\nreplacement_criteria_fingerprint: ${fingerprintExperiment(tempRoot)}\ndecision_id: D-002\n---\n\n# Criteria override — CO-001\n\n## Reason and authorization\n\n- Reason: Fixture correction for the success threshold.\n- User authorization: fixture approval.\n- Approval: fixture-approver at 2026-08-10T00:04:00Z.\n\n## Threshold correction\n\n| Field | Locked value | Replacement value |\n| --- | --- | --- |\n| Success threshold | >= 120 | >= 130 |\n\n## Decision linkage\n\nD-002 records the approved correction.\n`);
  if (withDecision) appendFixture(tempRoot, 'decisions.md', '\n### D-002\n- At: 2026-08-10T00:04:00Z\n- Actor: fixture-approver\n- Scope: EX-001\n- Decision: Approved CO-001 threshold correction for EX-001.\n- Evidence: experiments/EX-001-lifecycle-email/criteria-overrides/CO-001.md\n- Rationale: Fixture-only correction with preserved fingerprints.\n- Supersedes: none\n');
}

function addSnapshotOverride(tempRoot, options) {
  addApprovedOverride(tempRoot, options);
  replaceInFixture(tempRoot, `${experimentRoot}/criteria-overrides/CO-001.md`, '| Success threshold | >= 120 | >= 130 |\n\n## Decision linkage', '| Success threshold | >= 120 | >= 130 |\n| Failure threshold | <= 90 | <= 90 |\n\n## Decision linkage');
}

const cases = [
  {name: 'complete win lifecycle', expect: 'pass'},
  {name: 'fresh root is valid before first use', expect: 'pass', fixture: freshRootFixture},
  {name: 'unknown primary metric stays inconclusive', expect: 'pass', mutate: setUnknownPrimary},
  {name: 'unmeasurable definition is rejected', expect: 'fail', error: 'tracking is required before planning', mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, '| Tracking | local fixture export `qualified_signup` grouped by experiment ID |', '| Tracking | <tracking> |')},
  {name: 'missing review gate is rejected', expect: 'fail', error: 'approved-or-later experiment needs status passed', mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/review.md`, 'status: passed', 'status: not_reviewed')},
  {name: 'pre-approval execution is rejected', expect: 'fail', error: 'planned experiment cannot execute before approval', mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: planned')},
  {name: 'altered locked criterion is rejected', expect: 'fail', error: 'criteria fingerprint must match locked experiment definition', mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, '| Success threshold | >= 120 |', '| Success threshold | >= 130 |')},
  {name: 'vanity metric cannot override the primary KPI', expect: 'fail', error: 'verdict must follow locked primary-KPI thresholds', mutate: (tempRoot) => {
    replaceInFixture(tempRoot, `${experimentRoot}/measurement.md`, 'primary_value: 125', 'primary_value: 95');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'primary_value: 125', 'primary_value: 95');
  }},
  {name: 'missing primary metric cannot produce a win', expect: 'fail', error: 'verdict must follow locked primary-KPI thresholds', mutate: (tempRoot) => {
    replaceInFixture(tempRoot, `${experimentRoot}/measurement.md`, 'status: recorded', 'status: unknown');
    replaceInFixture(tempRoot, `${experimentRoot}/measurement.md`, 'primary_value: 125', 'primary_value: unknown');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'primary_value: 125', 'primary_value: unknown');
  }},
  {name: 'learning reroute needs a separate decision', expect: 'fail', error: 'reroute recommendation needs a separate route decision', mutate: (tempRoot) => removeFixtureFile(tempRoot, 'decisions.md')},
  {name: 'measurement-pending mission is resumable', expect: 'pass', mutate: (tempRoot) => {
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: measurement_pending');
    replaceInFixture(tempRoot, `${experimentRoot}/measurement.md`, 'status: recorded', 'status: not_recorded');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'status: complete', 'status: not_started');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'verdict: win', 'verdict: null');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'primary_value: 125', 'primary_value: unknown');
  }},
  {name: 'legacy project without a Signal7 brief remains valid', expect: 'pass', mutate: (tempRoot) => {
    removeFixtureFile(tempRoot, `${experimentRoot}/contracts/signal7-execution-brief.md`);
    removeFixtureFile(tempRoot, `${experimentRoot}/contracts/external-evidence-reference.md`);
  }},
  {name: 'external evidence reference v1 is accepted without a Signal7 brief', expect: 'pass', mutate: (tempRoot) => removeFixtureFile(tempRoot, `${experimentRoot}/contracts/signal7-execution-brief.md`)},
  {name: 'unknown Signal7 contract major version is rejected', expect: 'fail', error: 'unknown Signal7 contract major version', mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/contracts/signal7-execution-brief.md`, 'contract: signal7-execution-brief/v1', 'contract: signal7-execution-brief/v2')},
  {name: 'explicit cancellation remains a legal terminal alternative', expect: 'pass', mutate: (tempRoot) => {
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: cancelled');
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'cancelled_at: null', 'cancelled_at: 2026-08-04T00:00:00Z');
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'cancellation_reason: null', 'cancellation_reason: user withdrew execution authority');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'status: complete', 'status: not_started');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'verdict: win', 'verdict: null');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'primary_value: 125', 'primary_value: unknown');
  }},
  {name: 'cancellation without a reason is rejected', expect: 'fail', error: 'cancellation_reason is required for a cancelled experiment', mutate: (tempRoot) => {
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: cancelled');
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'cancelled_at: null', 'cancelled_at: 2026-08-04T00:00:00Z');
  }},
  {name: 'malformed contract frontmatter is rejected', expect: 'fail', error: 'unsupported frontmatter line 1', mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/contracts/external-evidence-reference.md`, 'schema_version: 1', 'schema_version = 1')},
  {name: 'review phase validates a planned passed review', expect: 'pass', options: {phase: 'review', experimentId: 'EX-001'}, mutate: (tempRoot) => {
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: planned');
    replaceInFixture(tempRoot, `${experimentRoot}/execution.md`, 'status: completed', 'status: not_started');
  }},
  {name: 'measurement phase validates source-linked evidence', expect: 'pass', options: {phase: 'measure', experimentId: 'EX-001'}, mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: measurement_pending')},
  {name: 'evaluation phase validates a requested terminal verdict', expect: 'pass', options: {phase: 'evaluate', experimentId: 'EX-001'}, mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'status: win', 'status: evaluating')},
  {name: 'evidence entry requires a strength grade', expect: 'fail', error: 'needs evidence strength A-E', mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/evidence.md`, 'Evidence strength: A', 'Evidence strength: X')},
  {name: 'payment evidence outranks stated willingness', expect: 'pass', mutate: makePaymentEvidence},
  {name: 'stated willingness cannot supply a payment KPI', expect: 'fail', error: 'metric must match the locked primary metric', mutate: (tempRoot) => {
    makePaymentEvidence(tempRoot);
    replaceInFixture(tempRoot, `${experimentRoot}/measurement.md`, 'source_entry_ids: [E-001]', 'source_entry_ids: [E-002]');
  }},
  {name: 'approved post-execution threshold override is accepted', expect: 'pass', mutate: (tempRoot) => addSnapshotOverride(tempRoot)},
  {name: 'override cannot rewrite audience', expect: 'fail', error: 'only success_threshold and failure_threshold may differ', mutate: (tempRoot) => {
    addSnapshotOverride(tempRoot);
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, '| Audience | activated trial users in the first 24 hours |', '| Audience | arbitrary rewritten audience |');
    refreshOverrideFingerprint(tempRoot);
  }},
  {name: 'override cannot rewrite primary metric', expect: 'fail', error: 'only success_threshold and failure_threshold may differ', mutate: (tempRoot) => {
    addSnapshotOverride(tempRoot);
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, '| Primary metric | qualified_signups |', '| Primary metric | clicks_total |');
    refreshOverrideFingerprint(tempRoot);
  }},
  {name: 'override cannot rewrite the hypothesis', expect: 'fail', error: 'only success_threshold and failure_threshold may differ', mutate: (tempRoot) => {
    addSnapshotOverride(tempRoot);
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, 'If we send a lifecycle email', 'If we rewrite the hypothesis after execution');
    refreshOverrideFingerprint(tempRoot);
  }},
  {name: 'override cannot rewrite the KPI tier', expect: 'fail', error: 'only success_threshold and failure_threshold may differ', mutate: (tempRoot) => {
    addSnapshotOverride(tempRoot);
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, '| Primary KPI tier | signup |', '| Primary KPI tier | engagement |');
    refreshOverrideFingerprint(tempRoot);
  }},
  {name: 'override table must match the replacement threshold', expect: 'fail', error: 'success threshold Replacement value must match', mutate: (tempRoot) => {
    addSnapshotOverride(tempRoot);
    replaceInFixture(tempRoot, `${experimentRoot}/criteria-overrides/CO-001.md`, '| Success threshold | >= 120 | >= 130 |', '| Success threshold | >= 120 | >= 135 |');
  }},
  {name: 'override must declare every changed threshold', expect: 'fail', error: 'changed_fields must list exactly', mutate: (tempRoot) => {
    addSnapshotOverride(tempRoot);
    replaceInFixture(tempRoot, `${experimentRoot}/experiment.md`, '| Failure threshold | <= 90 |', '| Failure threshold | <= 80 |');
    replaceInFixture(tempRoot, `${experimentRoot}/criteria-overrides/CO-001.md`, '| Failure threshold | <= 90 | <= 90 |', '| Failure threshold | <= 90 | <= 80 |');
    refreshOverrideFingerprint(tempRoot);
  }},
  {name: 'threshold override needs a linked governance decision', expect: 'fail', error: 'decision_id must be linked to this experiment', mutate: (tempRoot) => addSnapshotOverride(tempRoot, {withDecision: false})},
  {name: 'grade E cannot supply a numeric primary value', expect: 'fail', error: 'grade E cannot supply a numeric primary_value', mutate: (tempRoot) => {
    replaceInFixture(tempRoot, `${experimentRoot}/evidence.md`, 'Evidence strength: A', 'Evidence strength: E');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'evidence_strength: A', 'evidence_strength: E');
    replaceInFixture(tempRoot, `${experimentRoot}/evaluation.md`, 'Evidence strength: A', 'Evidence strength: E');
  }},
  {name: 'evaluation cannot overstate cited evidence strength', expect: 'fail', error: 'evidence_strength must equal the weakest cited primary-evidence grade C', mutate: (tempRoot) => replaceInFixture(tempRoot, `${experimentRoot}/evidence.md`, 'Evidence strength: A', 'Evidence strength: C')},
  {name: 'started lifecycle requires a baseline record', expect: 'fail', error: 'metrics/baselines.md: missing', mutate: (tempRoot) => removeFixtureFile(tempRoot, 'metrics/baselines.md')},
  {name: 'started lifecycle requires funnel state', expect: 'fail', error: 'metrics/funnel.json: missing', mutate: (tempRoot) => removeFixtureFile(tempRoot, 'metrics/funnel.json')},
  {name: 'started lifecycle requires memory state', expect: 'fail', error: 'memory.md: missing', mutate: (tempRoot) => removeFixtureFile(tempRoot, 'memory.md')},
  {name: 'memory recall requires a resolvable source', expect: 'fail', error: 'source must reference an existing .marketer artifact', mutate: (tempRoot) => replaceInFixture(tempRoot, 'memory.md', 'Source: experiments/EX-001-lifecycle-email/evaluation.md', 'Source: experiments/EX-001-lifecycle-email/missing.md')},
  {name: 'mission why is required', expect: 'fail', error: 'Why section is required', mutate: (tempRoot) => replaceInFixture(tempRoot, 'missions/M1-qualified-signups/mission.md', '## Why', '## Rationale')},
  {name: 'channel knowledge requires tracking limitations', expect: 'fail', error: 'Tracking limitations section is required', mutate: (tempRoot) => replaceInFixture(tempRoot, 'channels/email.md', '## Tracking limitations', '## Tracking notes')},
  {name: 'recipe requires evidence requirements', expect: 'fail', error: 'Evidence requirements section is required', mutate: (tempRoot) => replaceInFixture(tempRoot, 'recipes/RCP-001-lifecycle-email.md', '## Evidence requirements', '## Evidence notes')},
];

const packageCheck = spawnSync(process.execPath, ['scripts/validate-marketer-package.mjs'], {cwd: repositoryRoot, encoding: 'utf8'});
if (packageCheck.status !== 0) {
  process.stderr.write(packageCheck.stdout);
  process.stderr.write(packageCheck.stderr);
  console.error('FAIL — package static contract check must pass before fixture execution');
  process.exit(1);
}

let passed = 0;
const failures = [];
for (const fixtureCase of cases) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'marketer7-fixture-'));
  try {
    fs.cpSync(fixtureCase.fixture ?? baseFixture, tempRoot, {recursive: true});
    fixtureCase.mutate?.(tempRoot);
    const result = validateMarketerState(path.join(tempRoot, '.marketer'), fixtureCase.options);
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
  console.error(`FAIL — Marketer behavioral fixture harness (${passed}/${cases.length} passed)`);
  process.exitCode = 1;
} else {
  console.log(`PASS — Marketer behavioral fixture harness (${passed}/${cases.length} passed)`);
}
