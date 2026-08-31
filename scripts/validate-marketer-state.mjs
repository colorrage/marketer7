import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const experimentStatuses = new Set([
  'draft',
  'planned',
  'reviewed',
  'approved',
  'running',
  'measurement_pending',
  'evaluating',
  'win',
  'loss',
  'inconclusive',
  'cancelled',
]);

const terminalStatuses = new Set(['win', 'loss', 'inconclusive', 'cancelled']);
const reviewRequiredStatuses = new Set([
  'reviewed',
  'approved',
  'running',
  'measurement_pending',
  'evaluating',
  'win',
  'loss',
  'inconclusive',
]);

function parseScalar(rawValue) {
  const value = rawValue.trim();
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '[]') return [];
  if (value === '{}') return {};
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return {data: null, body: text, error: 'missing opening frontmatter delimiter'};
  const closingIndex = text.indexOf('\n---\n', 4);
  if (closingIndex === -1) return {data: null, body: text, error: 'missing closing frontmatter delimiter'};

  const data = {};
  const header = text.slice(4, closingIndex).split('\n');
  for (const [index, line] of header.entries()) {
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s(.*))?$/);
    if (!match) return {data: null, body: text, error: `unsupported frontmatter line ${index + 1}: ${line}`};
    if (Object.hasOwn(data, match[1])) return {data: null, body: text, error: `duplicate frontmatter key ${match[1]}`};
    data[match[1]] = parseScalar(match[2] ?? '');
  }
  return {data, body: text.slice(closingIndex + 5), error: null};
}

function isMeaningful(value) {
  return typeof value === 'string' && value.trim().length > 0 && !value.includes('<') && value !== 'null';
}

function gateVerdict(body) {
  const match = body.match(/## Gate verdict\s*\n\s*Verdict:\s*(pass|needs_input|blocked|fail)\b/);
  return match?.[1] ?? null;
}

function tableFields(body) {
  const fields = new Map();
  for (const line of body.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 2 || cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (cells[0] === 'Field' || cells[0] === 'Item') continue;
    fields.set(cells[0].toLowerCase(), cells[1]);
  }
  return fields;
}

function criteriaFingerprint(body) {
  const start = body.indexOf('## Hypothesis');
  const end = body.indexOf('## Criteria lock');
  if (start === -1 || end === -1 || end <= start) return null;
  const canonical = body.slice(start, end).replace(/\r\n/g, '\n').split('\n').map((line) => line.trimEnd()).join('\n').trim();
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

function parseThreshold(value) {
  const match = value.trim().match(/^(>=|<=|>|<|==|=)\s*(-?\d+(?:\.\d+)?)(?:\s+.*)?$/);
  return match ? {operator: match[1], value: Number(match[2])} : null;
}

function compare(actual, threshold) {
  switch (threshold.operator) {
    case '>': return actual > threshold.value;
    case '>=': return actual >= threshold.value;
    case '<': return actual < threshold.value;
    case '<=': return actual <= threshold.value;
    case '=':
    case '==': return actual === threshold.value;
    default: return false;
  }
}

function expectedVerdict(primaryValue, success, failure) {
  if (typeof primaryValue !== 'number') return 'inconclusive';
  if (compare(primaryValue, success)) return 'win';
  if (compare(primaryValue, failure)) return 'loss';
  return 'inconclusive';
}

function entryIds(body) {
  return new Set([...body.matchAll(/^###\s+(E-[A-Za-z0-9_-]+)\b/gm)].map((match) => match[1]));
}

function sourceEntryIds(value) {
  if (Array.isArray(value)) return value;
  return typeof value === 'string' && value ? [value] : [];
}

function documentAt(absolutePath, stateRoot, check, errors) {
  const label = path.relative(stateRoot, absolutePath) || '.';
  check(fs.existsSync(absolutePath), `${label}: missing`);
  if (!fs.existsSync(absolutePath)) return null;
  const parsed = parseFrontmatter(fs.readFileSync(absolutePath, 'utf8'));
  check(!parsed.error, `${label}: ${parsed.error}`);
  if (parsed.error) return null;
  check(String(parsed.data.schema_version) === '1', `${label}: schema_version must be 1`);
  return {...parsed, absolutePath, label};
}

function matchingDirectories(parent, expression) {
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent, {withFileTypes: true})
    .filter((entry) => entry.isDirectory() && expression.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

export function validateMarketerState(stateRoot) {
  const root = path.resolve(stateRoot);
  const errors = [];
  let checks = 0;
  const check = (condition, message) => {
    checks += 1;
    if (!condition) errors.push(message);
  };

  check(fs.existsSync(root), `${root}: .marketer directory is missing`);
  if (!fs.existsSync(root)) return {checks, errors};

  const project = documentAt(path.join(root, 'project.md'), root, check, errors);
  if (!project) return {checks, errors};

  check(Number.isInteger(project.data.next_mission_id) && project.data.next_mission_id > 0, 'project.md: next_mission_id must be a positive integer');
  check(Number.isInteger(project.data.next_experiment_id) && project.data.next_experiment_id > 0, 'project.md: next_experiment_id must be a positive integer');

  const missionNames = matchingDirectories(path.join(root, 'missions'), /^M\d+-/);
  const experimentNames = matchingDirectories(path.join(root, 'experiments'), /^EX-\d+-/);
  const missionIds = new Set();
  const experimentIds = new Set();
  let largestMission = 0;
  let largestExperiment = 0;

  for (const missionName of missionNames) {
    const match = missionName.match(/^(M(\d+))-/);
    const mission = documentAt(path.join(root, 'missions', missionName, 'mission.md'), root, check, errors);
    if (!mission || !match) continue;
    const missionId = match[1];
    missionIds.add(missionId);
    largestMission = Math.max(largestMission, Number(match[2]));
    check(mission.data.id === missionId, `${mission.label}: id must match directory ${missionId}`);
    check(isMeaningful(mission.data.title), `${mission.label}: title is required`);
    check(isMeaningful(mission.data.primary_kpi), `${mission.label}: primary_kpi is required`);
    check(mission.data.primary_kpi_priority === 'decisive', `${mission.label}: primary_kpi_priority must be decisive`);
  }

  for (const experimentName of experimentNames) {
    const match = experimentName.match(/^(EX-(\d+))-/);
    const experimentRoot = path.join(root, 'experiments', experimentName);
    const experiment = documentAt(path.join(experimentRoot, 'experiment.md'), root, check, errors);
    if (!experiment || !match) continue;
    const experimentId = match[1];
    experimentIds.add(experimentId);
    largestExperiment = Math.max(largestExperiment, Number(match[2]));
    check(experiment.data.id === experimentId, `${experiment.label}: id must match directory ${experimentId}`);
    check(missionIds.has(experiment.data.mission_id), `${experiment.label}: mission_id must reference an existing mission`);
    check(experimentStatuses.has(experiment.data.status), `${experiment.label}: illegal experiment status ${String(experiment.data.status)}`);
    check(isMeaningful(experiment.data.title), `${experiment.label}: title is required`);
    if (experiment.data.status === 'cancelled') {
      check(isMeaningful(experiment.data.cancelled_at), `${experiment.label}: cancelled_at is required for a cancelled experiment`);
      check(isMeaningful(experiment.data.cancellation_reason), `${experiment.label}: cancellation_reason is required for a cancelled experiment`);
    }

    const requiredDocuments = ['review.md', 'execution.md', 'evidence.md', 'measurement.md', 'evaluation.md'];
    const documents = {};
    for (const name of requiredDocuments) {
      documents[name] = documentAt(path.join(experimentRoot, name), root, check, errors);
    }
    const review = documents['review.md'];
    const execution = documents['execution.md'];
    const evidence = documents['evidence.md'];
    const measurement = documents['measurement.md'];
    const evaluation = documents['evaluation.md'];

    const fields = tableFields(experiment.body);
    const hypothesis = experiment.body.match(/## Hypothesis\s*\n\s*([\s\S]*?)\n## Definition/);
    const criterionFields = ['audience', 'channel', 'action type', 'executor', 'primary metric', 'secondary metrics', 'baseline', 'success threshold', 'failure threshold', 'measurement window', 'tracking'];
    if (experiment.data.status !== 'draft') {
      check(Boolean(hypothesis && isMeaningful(hypothesis[1].trim())), `${experiment.label}: non-draft experiment needs a concrete hypothesis`);
      for (const field of criterionFields) {
        const value = fields.get(field);
        const unknownBaseline = field === 'baseline' && typeof value === 'string' && value.startsWith('unknown');
        const numericThreshold = field.endsWith('threshold') && Boolean(parseThreshold(value ?? ''));
        check((isMeaningful(value) || unknownBaseline || numericThreshold) && value !== 'unknown', `${experiment.label}: ${field} is required before planning`);
      }
      const success = parseThreshold(fields.get('success threshold') ?? '');
      const failure = parseThreshold(fields.get('failure threshold') ?? '');
      check(Boolean(success), `${experiment.label}: success threshold must be numeric with an operator`);
      check(Boolean(failure), `${experiment.label}: failure threshold must be numeric with an operator`);
      if (success && failure) check(success.value !== failure.value || success.operator !== failure.operator, `${experiment.label}: success and failure thresholds must not be identical`);
      check(gateVerdict(experiment.body) === 'pass', `${experiment.label}: planning gate must pass before status ${experiment.data.status}`);
    }

    if (reviewRequiredStatuses.has(experiment.data.status)) {
      check(review?.data.status === 'passed', `${review?.label ?? `${experimentName}/review.md`}: approved-or-later experiment needs status passed`);
      check(gateVerdict(review?.body ?? '') === 'pass', `${review?.label ?? `${experimentName}/review.md`}: pre-action gate must pass`);
      check(isMeaningful(experiment.data.criteria_locked_at), `${experiment.label}: criteria_locked_at is required after review`);
      const fingerprint = criteriaFingerprint(experiment.body);
      check(Boolean(fingerprint), `${experiment.label}: criteria section cannot be fingerprinted`);
      check(review?.data.criteria_fingerprint === fingerprint, `${review?.label ?? `${experimentName}/review.md`}: criteria fingerprint must match the locked experiment definition`);
    }

    const needsCompletedExecution = new Set(['measurement_pending', 'evaluating', 'win', 'loss', 'inconclusive']);
    if (['draft', 'planned', 'reviewed'].includes(experiment.data.status)) {
      check(execution?.data.status === 'not_started', `${execution?.label ?? `${experimentName}/execution.md`}: ${experiment.data.status} experiment cannot execute before approval`);
    }
    if (experiment.data.status === 'running') {
      check(['dispatched', 'completed'].includes(execution?.data.status), `${execution?.label ?? `${experimentName}/execution.md`}: running experiment needs dispatched execution`);
    }
    if (needsCompletedExecution.has(experiment.data.status)) {
      check(execution?.data.status === 'completed', `${execution?.label ?? `${experimentName}/execution.md`}: status ${experiment.data.status} needs completed execution`);
    }

    const evidenceIds = entryIds(evidence?.body ?? '');
    if (measurement && ['evaluating', 'win', 'loss', 'inconclusive'].includes(experiment.data.status)) {
      check(['recorded', 'unknown'].includes(measurement.data.status), `${measurement.label}: evaluating-or-terminal experiment needs recorded or unknown measurement status`);
      const measurementIds = sourceEntryIds(measurement.data.source_entry_ids);
      for (const evidenceId of measurementIds) check(evidenceIds.has(evidenceId), `${measurement.label}: source_entry_id ${evidenceId} is absent from evidence.md`);
      if (typeof measurement.data.primary_value === 'number') check(measurementIds.length > 0, `${measurement.label}: numeric primary_value needs source evidence`);
      if (measurement.data.primary_value === 'unknown') check(measurement.data.status === 'unknown', `${measurement.label}: unknown primary_value requires status unknown`);
    }

    if (terminalStatuses.has(experiment.data.status) && experiment.data.status !== 'cancelled') {
      check(evaluation?.data.status === 'complete', `${evaluation?.label ?? `${experimentName}/evaluation.md`}: terminal experiment needs complete evaluation`);
      check(evaluation?.data.verdict === experiment.data.status, `${evaluation?.label ?? `${experimentName}/evaluation.md`}: verdict must match experiment status`);
      check(evaluation?.data.primary_value === measurement?.data.primary_value, `${evaluation?.label ?? `${experimentName}/evaluation.md`}: primary_value must match measurement`);
      check(/- Learned:\s*\S+/m.test(evaluation?.body ?? ''), `${evaluation?.label ?? `${experimentName}/evaluation.md`}: learning is required`);
      check(/- Not learned:\s*\S+/m.test(evaluation?.body ?? ''), `${evaluation?.label ?? `${experimentName}/evaluation.md`}: not_learned is required`);
      const success = parseThreshold(fields.get('success threshold') ?? '');
      const failure = parseThreshold(fields.get('failure threshold') ?? '');
      if (success && failure) {
        check(evaluation?.data.verdict === expectedVerdict(measurement?.data.primary_value, success, failure), `${evaluation?.label ?? `${experimentName}/evaluation.md`}: verdict must follow locked primary-KPI thresholds`);
      }
      if ((evaluation?.body ?? '').includes('Recommend reroute')) {
        const decisionsPath = path.join(root, 'decisions.md');
        check(fs.existsSync(decisionsPath), 'decisions.md: reroute recommendation needs a separate route decision');
        if (fs.existsSync(decisionsPath)) {
          const decisions = fs.readFileSync(decisionsPath, 'utf8');
          check(decisions.includes(experimentId) && /route/i.test(decisions), `decisions.md: reroute for ${experimentId} needs an evidence-linked route decision`);
        }
      }
    }

    const contractsRoot = path.join(experimentRoot, 'contracts');
    if (fs.existsSync(contractsRoot)) {
      for (const name of fs.readdirSync(contractsRoot).filter((entry) => entry.endsWith('.md')).sort()) {
        const contract = documentAt(path.join(contractsRoot, name), root, check, errors);
        if (!contract) continue;
        if (name.includes('signal7-execution-brief')) {
          check(contract.data.contract === 'signal7-execution-brief/v1', `${contract.label}: unknown Signal7 contract major version`);
          check(contract.data.source_system === 'marketer7', `${contract.label}: source_system must be marketer7`);
          check(contract.data.mission_id === experiment.data.mission_id, `${contract.label}: mission_id must match experiment`);
          check(contract.data.experiment_id === experimentId, `${contract.label}: experiment_id must match experiment`);
          check(Object.hasOwn(contract.data, 'tracking'), `${contract.label}: tracking field is required even when empty`);
        }
        if (name.includes('external-evidence-reference')) {
          check(contract.data.contract === 'external-evidence-reference/v1', `${contract.label}: unknown external-evidence contract major version`);
          check(contract.data.experiment_id === experimentId, `${contract.label}: experiment_id must match experiment`);
          check(isMeaningful(contract.data.external_evidence_id), `${contract.label}: external_evidence_id is required`);
          check(isMeaningful(contract.data.external_artifact), `${contract.label}: external_artifact is required`);
        }
      }
    }
  }

  check(project.data.next_mission_id > largestMission, 'project.md: next_mission_id must exceed every allocated mission ID');
  check(project.data.next_experiment_id > largestExperiment, 'project.md: next_experiment_id must exceed every allocated experiment ID');
  check(missionIds.size === missionNames.length, 'missions: duplicate mission IDs are not allowed');
  check(experimentIds.size === experimentNames.length, 'experiments: duplicate experiment IDs are not allowed');
  return {checks, errors};
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const stateRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), '.marketer');
  const result = validateMarketerState(stateRoot);
  if (result.errors.length > 0) {
    console.error(`FAIL — Marketer state validation (${result.errors.length} issue${result.errors.length === 1 ? '' : 's'}, ${result.checks} checks)`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS — Marketer state validation (${result.checks} checks)`);
  }
}
