import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const experimentStatuses = new Set(['draft', 'planned', 'reviewed', 'approved', 'running', 'measurement_pending', 'evaluating', 'win', 'loss', 'inconclusive', 'cancelled']);
const terminalStatuses = new Set(['win', 'loss', 'inconclusive', 'cancelled']);
const reviewRequiredStatuses = new Set(['reviewed', 'approved', 'running', 'measurement_pending', 'evaluating', 'win', 'loss', 'inconclusive']);
const kpiTiers = new Set(['payment', 'willingness_to_pay', 'retention', 'activation', 'signup', 'click', 'engagement', 'impression', 'other']);
const evidenceStrengths = new Set(['A', 'B', 'C', 'D', 'E']);
const observationalEvidenceStrengths = new Set(['A', 'B', 'C', 'D']);
const evidenceStrengthRank = new Map([['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5]]);
const phaseNames = new Set(['review', 'measure', 'evaluate']);

function parseScalar(rawValue) {
  const value = rawValue.trim();
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '[]') return [];
  if (value === '{}') return {};
  if (value.startsWith('[') && value.endsWith(']')) return value.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean);
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
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
  return body.match(/## Gate verdict\s*\n\s*Verdict:\s*(pass|needs_input|blocked|fail)\b/)?.[1] ?? null;
}

function tableFields(body) {
  const fields = new Map();
  for (const line of body.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 2 || cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (cells[0] === 'Field' || cells[0] === 'Item' || cells[0] === 'Role') continue;
    fields.set(cells[0].toLowerCase(), cells[1]);
  }
  return fields;
}

function canonicalDefinition(source) {
  return source.replace(/\r\n/g, '\n').split('\n').map((line) => line.trimEnd()).join('\n').trim();
}

function definitionFromExperiment(body) {
  const start = body.indexOf('## Hypothesis');
  const end = body.indexOf('## Criteria lock');
  if (start === -1 || end === -1 || end <= start) return null;
  return canonicalDefinition(body.slice(start, end));
}

function fingerprintDefinition(definition) {
  return definition ? crypto.createHash('sha256').update(definition).digest('hex') : null;
}

function criteriaFingerprint(body) {
  return fingerprintDefinition(definitionFromExperiment(body));
}

function lockedDefinitionSnapshot(body) {
  const matches = [...body.matchAll(/^## Locked definition snapshot\s*\n\s*```markdown\n([\s\S]*?)\n```\s*$/gm)];
  if (matches.length !== 1) return {definition: null, error: 'requires exactly one canonical Locked definition snapshot fence'};
  const definition = canonicalDefinition(matches[0][1]);
  if (!definition.startsWith('## Hypothesis') || !definition.includes('\n## Definition') || definition.includes('## Criteria lock')) {
    return {definition: null, error: 'Locked definition snapshot must contain only the reviewed definition from Hypothesis through before Criteria lock'};
  }
  return {definition, error: null};
}

function normalizeThresholdValues(definition) {
  return definition.replace(/^(\|\s*(?:Success|Failure) threshold\s*\|\s*)[^|]*(\|\s*)$/gmi, '$1<normalized-threshold>$2');
}

function thresholdRows(body) {
  const heading = body.match(/^## Threshold correction\s*$/m);
  if (!heading || heading.index === undefined) return [];
  const following = body.slice(heading.index + heading[0].length);
  const nextHeading = following.search(/\n## /);
  const section = nextHeading === -1 ? following : following.slice(0, nextHeading);
  const rows = [];
  for (const line of section.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 3 || cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (cells[0] === 'Field') continue;
    const field = cells[0].toLowerCase();
    if (field === 'success threshold' || field === 'failure threshold') rows.push({field, locked: cells[1], replacement: cells[2]});
  }
  return rows;
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

function sourceEntryIds(value) {
  if (Array.isArray(value)) return value;
  return typeof value === 'string' && value ? [value] : [];
}

function markdownEntries(body, prefix) {
  const headings = [...body.matchAll(new RegExp(`^###\\s+(${prefix}-[A-Za-z0-9_-]+)\\b`, 'gm'))];
  const entries = new Map();
  for (const [index, heading] of headings.entries()) {
    const section = body.slice(heading.index, headings[index + 1]?.index ?? body.length);
    const read = (label) => section.match(new RegExp(`^- ${label}:\\s*(.+)$`, 'mi'))?.[1]?.trim() ?? null;
    entries.set(heading[1], {id: heading[1], metric: read('Metric'), evidenceStrength: read('Evidence strength'), source: read('Source')});
  }
  return entries;
}

function sectionExists(body, heading) {
  return new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(body);
}

function documentAt(absolutePath, stateRoot, check) {
  const label = path.relative(stateRoot, absolutePath) || '.';
  check(fs.existsSync(absolutePath), `${label}: missing`);
  if (!fs.existsSync(absolutePath)) return null;
  const parsed = parseFrontmatter(fs.readFileSync(absolutePath, 'utf8'));
  check(!parsed.error, `${label}: ${parsed.error}`);
  if (parsed.error) return null;
  check(String(parsed.data.schema_version) === '1', `${label}: schema_version must be 1`);
  return {...parsed, absolutePath, label};
}

function jsonAt(absolutePath, stateRoot, check) {
  const label = path.relative(stateRoot, absolutePath) || '.';
  check(fs.existsSync(absolutePath), `${label}: missing`);
  if (!fs.existsSync(absolutePath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    check(data.schema_version === 1, `${label}: schema_version must be 1`);
    check(Array.isArray(data.stages), `${label}: stages must be an array`);
    return {data, label};
  } catch (error) {
    check(false, `${label}: invalid JSON (${error.message})`);
    return null;
  }
}

function optionalDocumentAt(absolutePath, stateRoot, check) {
  return fs.existsSync(absolutePath) ? documentAt(absolutePath, stateRoot, check) : null;
}

function optionalJsonAt(absolutePath, stateRoot, check) {
  return fs.existsSync(absolutePath) ? jsonAt(absolutePath, stateRoot, check) : null;
}

function matchingDirectories(parent, expression) {
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent, {withFileTypes: true}).filter((entry) => entry.isDirectory() && expression.test(entry.name)).map((entry) => entry.name).sort();
}

function matchingFiles(parent, expression) {
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent, {withFileTypes: true}).filter((entry) => entry.isFile() && expression.test(entry.name)).map((entry) => entry.name).sort();
}

function checkAuxiliaryState(root, check, {required}) {
  const baselinePath = path.join(root, 'metrics', 'baselines.md');
  const funnelPath = path.join(root, 'metrics', 'funnel.json');
  const memoryPath = path.join(root, 'memory.md');
  if (required) {
    documentAt(baselinePath, root, check);
    jsonAt(funnelPath, root, check);
  } else {
    optionalDocumentAt(baselinePath, root, check);
    optionalJsonAt(funnelPath, root, check);
  }
  for (const fileName of matchingFiles(path.join(root, 'channels'), /\.md$/)) {
    const channel = documentAt(path.join(root, 'channels', fileName), root, check);
    if (!channel) continue;
    check(/^CH-\d+$/.test(String(channel.data.id)), `${channel.label}: id must be CH-<NNN>`);
    check(isMeaningful(channel.data.channel), `${channel.label}: channel is required`);
    for (const heading of ['Audience fit', 'Known rules', 'Working formats', 'Failed formats', 'Tracking limitations', 'Historical results', 'Reputation risks']) check(sectionExists(channel.body, heading), `${channel.label}: ${heading} section is required`);
  }
  for (const fileName of matchingFiles(path.join(root, 'recipes'), /\.md$/)) {
    const recipe = documentAt(path.join(root, 'recipes', fileName), root, check);
    if (!recipe) continue;
    check(/^RCP-\d+$/.test(String(recipe.data.id)), `${recipe.label}: id must be RCP-<NNN>`);
    check(isMeaningful(recipe.data.title), `${recipe.label}: title is required`);
    for (const heading of ['Trigger', 'Prerequisites', 'Process', 'Evidence requirements', 'Constraints and stop conditions', 'Provenance']) check(sectionExists(recipe.body, heading), `${recipe.label}: ${heading} section is required`);
  }
  const memory = required ? documentAt(memoryPath, root, check) : optionalDocumentAt(memoryPath, root, check);
  if (memory) {
    for (const entry of markdownEntries(memory.body, 'MEM').values()) {
      check(isMeaningful(entry.source), `${memory.label}: ${entry.id} source is required`);
      if (isMeaningful(entry.source)) {
        const sourcePath = path.resolve(root, entry.source);
        check(sourcePath.startsWith(`${root}${path.sep}`) && fs.existsSync(sourcePath), `${memory.label}: ${entry.id} source must reference an existing .marketer artifact`);
      }
    }
  }
}

function citedPrimaryEvidenceStrengths({fields, evidenceEntries, measurement}) {
  const primaryMetric = fields.get('primary metric');
  return sourceEntryIds(measurement?.data.source_entry_ids).map((evidenceId) => evidenceEntries.get(evidenceId)).filter((entry) => entry?.metric === primaryMetric && evidenceStrengths.has(entry.evidenceStrength)).map((entry) => entry.evidenceStrength);
}

function weakestEvidenceStrength(strengths) {
  return strengths.reduce((weakest, strength) => !weakest || evidenceStrengthRank.get(strength) > evidenceStrengthRank.get(weakest) ? strength : weakest, null);
}

function checkMeasurement({fields, evidenceEntries, measurement, check, requireGate}) {
  if (!measurement) return;
  check(['recorded', 'unknown'].includes(measurement.data.status), `${measurement.label}: evaluating-or-terminal experiment needs recorded or unknown measurement status`);
  const primaryMetric = fields.get('primary metric');
  check(measurement.data.primary_metric === primaryMetric, `${measurement.label}: primary_metric must match the locked primary metric`);
  const measurementIds = sourceEntryIds(measurement.data.source_entry_ids);
  for (const evidenceId of measurementIds) {
    const entry = evidenceEntries.get(evidenceId);
    check(Boolean(entry), `${measurement.label}: source_entry_id ${evidenceId} is absent from evidence.md`);
    if (!entry) continue;
    check(entry.metric === primaryMetric, `${measurement.label}: source_entry_id ${evidenceId} metric must match the locked primary metric`);
    check(evidenceStrengths.has(entry.evidenceStrength), `${measurement.label}: source_entry_id ${evidenceId} needs evidence strength A-E`);
    if (typeof measurement.data.primary_value === 'number') check(observationalEvidenceStrengths.has(entry.evidenceStrength), `${measurement.label}: source_entry_id ${evidenceId} grade E cannot supply a numeric primary_value`);
  }
  if (typeof measurement.data.primary_value === 'number') check(measurementIds.length > 0, `${measurement.label}: numeric primary_value needs source evidence`);
  if (measurement.data.primary_value === 'unknown') check(measurement.data.status === 'unknown', `${measurement.label}: unknown primary_value requires status unknown`);
  if (requireGate) check(gateVerdict(measurement.body) === 'pass', `${measurement.label}: measurement gate must pass before evaluation`);
}

function checkEvaluation({fields, evidenceEntries, measurement, evaluation, check}) {
  if (!evaluation) return;
  check(evaluation.data.status === 'complete', `${evaluation.label}: terminal experiment needs complete evaluation`);
  check(['win', 'loss', 'inconclusive'].includes(evaluation.data.verdict), `${evaluation.label}: verdict must be win, loss, or inconclusive`);
  check(evaluation.data.primary_metric === fields.get('primary metric'), `${evaluation.label}: primary_metric must match the locked primary metric`);
  check(evaluation.data.primary_value === measurement?.data.primary_value, `${evaluation.label}: primary_value must match measurement`);
  const citedStrengths = citedPrimaryEvidenceStrengths({fields, evidenceEntries, measurement});
  const expectedStrength = weakestEvidenceStrength(citedStrengths);
  check(observationalEvidenceStrengths.has(evaluation.data.evidence_strength) || evaluation.data.evidence_strength === 'unknown', `${evaluation.label}: evidence_strength must be A-D or unknown`);
  check(evaluation.data.evidence_strength !== 'E', `${evaluation.label}: grade E cannot support a terminal verdict`);
  if (expectedStrength) check(evaluation.data.evidence_strength === expectedStrength, `${evaluation.label}: evidence_strength must equal the weakest cited primary-evidence grade ${expectedStrength}`);
  if (!expectedStrength) check(evaluation.data.evidence_strength === 'unknown', `${evaluation.label}: evidence_strength must be unknown without cited primary evidence`);
  const summaryStrength = evaluation.body.match(/- Evidence strength:\s*(A|B|C|D|unknown)\b/m)?.[1] ?? null;
  check(summaryStrength === evaluation.data.evidence_strength, `${evaluation.label}: evidence strength summary must match evidence_strength`);
  check(/- Conclusion confidence:\s*\S+/m.test(evaluation.body), `${evaluation.label}: conclusion confidence is required`);
  check(/- Learned:\s*\S+/m.test(evaluation.body), `${evaluation.label}: learning is required`);
  check(/- Not learned:\s*\S+/m.test(evaluation.body), `${evaluation.label}: not_learned is required`);
  check(gateVerdict(evaluation.body) === 'pass', `${evaluation.label}: evaluation gate must pass before a terminal verdict`);
  const success = parseThreshold(fields.get('success threshold') ?? '');
  const failure = parseThreshold(fields.get('failure threshold') ?? '');
  if (success && failure) check(evaluation.data.verdict === expectedVerdict(measurement?.data.primary_value, success, failure), `${evaluation.label}: verdict must follow locked primary-KPI thresholds`);
}

function checkCriteriaOverride({root, experimentRoot, experiment, review, execution, fingerprint, snapshotDefinition, check}) {
  let valid = true;
  const validate = (condition, message) => {
    valid = valid && condition;
    check(condition, message);
  };
  const overrideRoot = path.join(experimentRoot, 'criteria-overrides');
  const names = matchingFiles(overrideRoot, /^CO-\d+.*\.md$/);
  validate(names.length === 1, `${path.relative(root, overrideRoot)}: changed locked criteria need exactly one approved override`);
  const override = names.length === 1 ? documentAt(path.join(overrideRoot, names[0]), root, check) : null;
  if (!override) return false;
  validate(String(override.data.schema_version) === '1', `${override.label}: schema_version must be 1`);
  validate(/^CO-\d+$/.test(String(override.data.id)), `${override.label}: id must be CO-<NNN>`);
  validate(override.data.experiment_id === experiment.data.id, `${override.label}: experiment_id must match experiment`);
  validate(override.data.status === 'approved', `${override.label}: status must be approved`);
  for (const field of ['requested_at', 'approved_at', 'actor', 'approver', 'execution_completed_at', 'prior_criteria_fingerprint', 'replacement_criteria_fingerprint', 'decision_id']) validate(isMeaningful(override.data[field]), `${override.label}: ${field} is required`);
  const changedFields = sourceEntryIds(override.data.changed_fields);
  validate(changedFields.length > 0 && changedFields.every((field) => ['success_threshold', 'failure_threshold'].includes(field)), `${override.label}: changed_fields may contain only success_threshold or failure_threshold`);
  validate(execution?.data.status === 'completed', `${override.label}: requires completed execution`);
  validate(override.data.execution_completed_at === execution?.data.completed_at, `${override.label}: execution_completed_at must match execution.md`);
  validate(override.data.prior_criteria_fingerprint === review?.data.criteria_fingerprint, `${override.label}: prior_criteria_fingerprint must match review.md`);
  validate(override.data.replacement_criteria_fingerprint === fingerprint, `${override.label}: replacement_criteria_fingerprint must match experiment.md`);
  validate(Boolean(snapshotDefinition), `${review?.label ?? 'review.md'}: criteria override requires a verifiable Locked definition snapshot`);
  if (snapshotDefinition) {
    validate(fingerprintDefinition(snapshotDefinition) === review?.data.criteria_fingerprint, `${review?.label ?? 'review.md'}: Locked definition snapshot fingerprint must match criteria_fingerprint`);
    const currentDefinition = definitionFromExperiment(experiment.body);
    validate(normalizeThresholdValues(snapshotDefinition) === normalizeThresholdValues(currentDefinition ?? ''), `${override.label}: only success_threshold and failure_threshold may differ from the Locked definition snapshot`);
    const snapshotFields = tableFields(snapshotDefinition);
    const currentFields = tableFields(currentDefinition ?? '');
    const rows = thresholdRows(override.body);
    const rowByField = new Map(rows.map((row) => [row.field, row]));
    validate(rows.length === 2 && rowByField.size === 2, `${override.label}: Threshold correction requires exactly one row for each threshold`);
    for (const [field, changedField] of [['success threshold', 'success_threshold'], ['failure threshold', 'failure_threshold']]) {
      const row = rowByField.get(field);
      const lockedValue = snapshotFields.get(field);
      const replacementValue = currentFields.get(field);
      validate(Boolean(row), `${override.label}: Threshold correction is missing ${field}`);
      if (!row) continue;
      validate(row.locked === lockedValue, `${override.label}: ${field} Locked value must match the Locked definition snapshot`);
      validate(row.replacement === replacementValue, `${override.label}: ${field} Replacement value must match the current experiment definition`);
      validate(changedFields.includes(changedField) === (lockedValue !== replacementValue), `${override.label}: changed_fields must list exactly the threshold rows whose values differ`);
    }
  }
  const decisionsPath = path.join(root, 'decisions.md');
  validate(fs.existsSync(decisionsPath), 'decisions.md: criteria override needs an append-only decision');
  if (fs.existsSync(decisionsPath)) {
    const decisions = fs.readFileSync(decisionsPath, 'utf8');
    validate(decisions.includes(String(override.data.decision_id)) && decisions.includes(String(experiment.data.id)), `${override.label}: decision_id must be linked to this experiment in decisions.md`);
  }
  return valid;
}

export function validateMarketerState(stateRoot, options = {}) {
  const root = path.resolve(stateRoot);
  const errors = [];
  let checks = 0;
  const check = (condition, message) => {
    checks += 1;
    if (!condition) errors.push(message);
  };
  const phase = options.phase ?? null;
  const experimentFilter = options.experimentId ?? null;
  check(!phase || phaseNames.has(phase), `validator: unsupported phase ${String(phase)}`);
  if (phase) check(isMeaningful(experimentFilter), 'validator: --experiment EX-<NNN> is required with --phase');
  check(fs.existsSync(root), `${root}: .marketer directory is missing`);
  if (!fs.existsSync(root)) return {checks, errors};

  const project = documentAt(path.join(root, 'project.md'), root, check);
  if (!project) return {checks, errors};
  check(Number.isInteger(project.data.next_mission_id) && project.data.next_mission_id > 0, 'project.md: next_mission_id must be a positive integer');
  check(Number.isInteger(project.data.next_experiment_id) && project.data.next_experiment_id > 0, 'project.md: next_experiment_id must be a positive integer');
  const missionNames = matchingDirectories(path.join(root, 'missions'), /^M\d+-/);
  const experimentNames = matchingDirectories(path.join(root, 'experiments'), /^EX-\d+-/);
  checkAuxiliaryState(root, check, {required: missionNames.length > 0 || experimentNames.length > 0});
  const missionIds = new Set();
  const experimentIds = new Set();
  let largestMission = 0;
  let largestExperiment = 0;
  for (const missionName of missionNames) {
    const match = missionName.match(/^(M(\d+))-/);
    const mission = documentAt(path.join(root, 'missions', missionName, 'mission.md'), root, check);
    if (!mission || !match) continue;
    const missionId = match[1];
    missionIds.add(missionId);
    largestMission = Math.max(largestMission, Number(match[2]));
    check(mission.data.id === missionId, `${mission.label}: id must match directory ${missionId}`);
    check(isMeaningful(mission.data.title), `${mission.label}: title is required`);
    check(isMeaningful(mission.data.primary_kpi), `${mission.label}: primary_kpi is required`);
    check(mission.data.primary_kpi_priority === 'decisive', `${mission.label}: primary_kpi_priority must be decisive`);
    check(kpiTiers.has(mission.data.primary_kpi_tier), `${mission.label}: primary_kpi_tier must use evaluation-policy.md`);
    for (const heading of ['Goal', 'Why', 'KPIs', 'Baseline', 'Definition of done', 'Constraints']) check(sectionExists(mission.body, heading), `${mission.label}: ${heading} section is required`);
  }

  let phaseTargetFound = false;
  for (const experimentName of experimentNames) {
    const match = experimentName.match(/^(EX-(\d+))-/);
    const experimentRoot = path.join(root, 'experiments', experimentName);
    const experiment = documentAt(path.join(experimentRoot, 'experiment.md'), root, check);
    if (!experiment || !match) continue;
    const experimentId = match[1];
    experimentIds.add(experimentId);
    largestExperiment = Math.max(largestExperiment, Number(match[2]));
    if (phase && experimentId === experimentFilter) phaseTargetFound = true;
    if (phase && experimentFilter && experimentId !== experimentFilter) continue;
    check(experiment.data.id === experimentId, `${experiment.label}: id must match directory ${experimentId}`);
    check(missionIds.has(experiment.data.mission_id), `${experiment.label}: mission_id must reference an existing mission`);
    check(experimentStatuses.has(experiment.data.status), `${experiment.label}: illegal experiment status ${String(experiment.data.status)}`);
    check(isMeaningful(experiment.data.title), `${experiment.label}: title is required`);
    if (experiment.data.status === 'cancelled') {
      check(isMeaningful(experiment.data.cancelled_at), `${experiment.label}: cancelled_at is required for a cancelled experiment`);
      check(isMeaningful(experiment.data.cancellation_reason), `${experiment.label}: cancellation_reason is required for a cancelled experiment`);
    }
    const documents = {};
    for (const name of ['review.md', 'execution.md', 'evidence.md', 'measurement.md', 'evaluation.md']) documents[name] = documentAt(path.join(experimentRoot, name), root, check);
    const review = documents['review.md'];
    const execution = documents['execution.md'];
    const evidence = documents['evidence.md'];
    const measurement = documents['measurement.md'];
    const evaluation = documents['evaluation.md'];
    const fields = tableFields(experiment.body);
    const hypothesis = experiment.body.match(/## Hypothesis\s*\n\s*([\s\S]*?)\n## Definition/);
    const criterionFields = ['audience', 'channel', 'action type', 'executor', 'primary metric', 'primary kpi tier', 'secondary metrics', 'baseline', 'success threshold', 'failure threshold', 'measurement window', 'tracking'];
    if (experiment.data.status !== 'draft') {
      check(Boolean(hypothesis && isMeaningful(hypothesis[1].trim())), `${experiment.label}: non-draft experiment needs a concrete hypothesis`);
      for (const field of criterionFields) {
        const value = fields.get(field);
        const unknownBaseline = field === 'baseline' && typeof value === 'string' && value.startsWith('unknown');
        const numericThreshold = field.endsWith('threshold') && Boolean(parseThreshold(value ?? ''));
        check((isMeaningful(value) || unknownBaseline || numericThreshold) && value !== 'unknown', `${experiment.label}: ${field} is required before planning`);
      }
      check(kpiTiers.has(fields.get('primary kpi tier')), `${experiment.label}: primary kpi tier must use evaluation-policy.md`);
      const success = parseThreshold(fields.get('success threshold') ?? '');
      const failure = parseThreshold(fields.get('failure threshold') ?? '');
      check(Boolean(success), `${experiment.label}: success threshold must be numeric with an operator`);
      check(Boolean(failure), `${experiment.label}: failure threshold must be numeric with an operator`);
      if (success && failure) check(success.value !== failure.value || success.operator !== failure.operator, `${experiment.label}: success and failure thresholds must not be identical`);
      check(gateVerdict(experiment.body) === 'pass', `${experiment.label}: planning gate must pass before status ${experiment.data.status}`);
    }
    const fingerprint = criteriaFingerprint(experiment.body);
    const reviewRequiresSnapshot = reviewRequiredStatuses.has(experiment.data.status) || phase === 'review';
    const snapshot = reviewRequiresSnapshot ? lockedDefinitionSnapshot(review?.body ?? '') : {definition: null, error: null};
    if (reviewRequiresSnapshot) {
      check(Boolean(snapshot.definition), `${review?.label ?? `${experimentName}/review.md`}: ${snapshot.error ?? 'Locked definition snapshot is required'}`);
      if (snapshot.definition) check(fingerprintDefinition(snapshot.definition) === review?.data.criteria_fingerprint, `${review?.label ?? `${experimentName}/review.md`}: Locked definition snapshot fingerprint must match criteria_fingerprint`);
    }
    if (reviewRequiredStatuses.has(experiment.data.status)) {
      check(review?.data.status === 'passed', `${review?.label ?? `${experimentName}/review.md`}: approved-or-later experiment needs status passed`);
      check(gateVerdict(review?.body ?? '') === 'pass', `${review?.label ?? `${experimentName}/review.md`}: pre-action gate must pass`);
      check(isMeaningful(experiment.data.criteria_locked_at), `${experiment.label}: criteria_locked_at is required after review`);
      check(Boolean(fingerprint), `${experiment.label}: criteria section cannot be fingerprinted`);
      if (fingerprint && review?.data.criteria_fingerprint !== fingerprint) {
        const overrideValid = checkCriteriaOverride({root, experimentRoot, experiment, review, execution, fingerprint, snapshotDefinition: snapshot.definition, check});
        check(overrideValid, `${review?.label ?? `${experimentName}/review.md`}: criteria fingerprint must match locked experiment definition or a complete approved override`);
      }
    }
    const needsCompletedExecution = new Set(['measurement_pending', 'evaluating', 'win', 'loss', 'inconclusive']);
    if (['draft', 'planned', 'reviewed'].includes(experiment.data.status)) check(execution?.data.status === 'not_started', `${execution?.label ?? `${experimentName}/execution.md`}: ${experiment.data.status} experiment cannot execute before approval`);
    if (experiment.data.status === 'running') check(['dispatched', 'completed'].includes(execution?.data.status), `${execution?.label ?? `${experimentName}/execution.md`}: running experiment needs dispatched execution`);
    if (needsCompletedExecution.has(experiment.data.status)) check(execution?.data.status === 'completed', `${execution?.label ?? `${experimentName}/execution.md`}: status ${experiment.data.status} needs completed execution`);
    const evidenceEntries = markdownEntries(evidence?.body ?? '', 'E');
    const requiresMeasurement = ['evaluating', 'win', 'loss', 'inconclusive'].includes(experiment.data.status) || phase === 'measure';
    if (requiresMeasurement) checkMeasurement({fields, evidenceEntries, measurement, check, requireGate: phase === 'measure'});
    const requiresEvaluation = (terminalStatuses.has(experiment.data.status) && experiment.data.status !== 'cancelled') || phase === 'evaluate';
    if (requiresEvaluation) checkEvaluation({fields, evidenceEntries, measurement, evaluation, check});
    if (phase === 'review') {
      check(experiment.data.status === 'planned', `${experiment.label}: review phase requires planned status`);
      check(review?.data.status === 'passed', `${review?.label ?? `${experimentName}/review.md`}: review phase requires status passed`);
      check(gateVerdict(review?.body ?? '') === 'pass', `${review?.label ?? `${experimentName}/review.md`}: review phase gate must pass`);
      check(review?.data.criteria_fingerprint === fingerprint, `${review?.label ?? `${experimentName}/review.md`}: review phase fingerprint must match experiment definition`);
    }
    if (phase === 'measure') check(experiment.data.status === 'measurement_pending', `${experiment.label}: measure phase requires measurement_pending status`);
    if (phase === 'evaluate') check(experiment.data.status === 'evaluating', `${experiment.label}: evaluate phase requires evaluating status`);
    if (terminalStatuses.has(experiment.data.status) && experiment.data.status !== 'cancelled' && (evaluation?.body ?? '').includes('Recommend reroute')) {
      const decisionsPath = path.join(root, 'decisions.md');
      check(fs.existsSync(decisionsPath), 'decisions.md: reroute recommendation needs a separate route decision');
      if (fs.existsSync(decisionsPath)) {
        const decisions = fs.readFileSync(decisionsPath, 'utf8');
        check(decisions.includes(experimentId) && /route/i.test(decisions), `decisions.md: reroute for ${experimentId} needs an evidence-linked route decision`);
      }
    }
    const contractsRoot = path.join(experimentRoot, 'contracts');
    if (fs.existsSync(contractsRoot)) {
      for (const name of fs.readdirSync(contractsRoot).filter((entry) => entry.endsWith('.md')).sort()) {
        const contract = documentAt(path.join(contractsRoot, name), root, check);
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
  if (phase) check(phaseTargetFound, `validator: experiment ${String(experimentFilter)} was not found`);
  check(project.data.next_mission_id > largestMission, 'project.md: next_mission_id must exceed every allocated mission ID');
  check(project.data.next_experiment_id > largestExperiment, 'project.md: next_experiment_id must exceed every allocated experiment ID');
  check(missionIds.size === missionNames.length, 'missions: duplicate mission IDs are not allowed');
  check(experimentIds.size === experimentNames.length, 'experiments: duplicate experiment IDs are not allowed');
  return {checks, errors};
}

function parseCli(argv) {
  const options = {stateRoot: null, phase: null, experimentId: null};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--phase') {
      options.phase = argv[index + 1] ?? null;
      index += 1;
    } else if (argument === '--experiment') {
      options.experimentId = argv[index + 1] ?? null;
      index += 1;
    } else if (argument.startsWith('--')) {
      throw new Error(`unknown option ${argument}`);
    } else if (!options.stateRoot) {
      options.stateRoot = argument;
    } else {
      throw new Error(`unexpected argument ${argument}`);
    }
  }
  options.stateRoot = options.stateRoot ? path.resolve(options.stateRoot) : path.join(process.cwd(), '.marketer');
  return options;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    const options = parseCli(process.argv.slice(2));
    const result = validateMarketerState(options.stateRoot, options);
    if (result.errors.length > 0) {
      console.error(`FAIL — Marketer state validation (${result.errors.length} issue${result.errors.length === 1 ? '' : 's'}, ${result.checks} checks)`);
      for (const error of result.errors) console.error(`- ${error}`);
      process.exitCode = 1;
    } else {
      console.log(`PASS — Marketer state validation (${result.checks} checks)`);
    }
  } catch (error) {
    console.error(`FAIL — Marketer state validation (${error.message})`);
    process.exitCode = 2;
  }
}
