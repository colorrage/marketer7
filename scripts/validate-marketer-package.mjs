import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
let checks = 0;

function expect(condition, message) {
  checks += 1;
  if (!condition) errors.push(message);
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  expect(fs.existsSync(absolutePath), `${relativePath}: missing`);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : '';
}

function hasAll(text, terms, relativePath) {
  for (const term of terms) {
    expect(text.includes(term), `${relativePath}: missing ${JSON.stringify(term)}`);
  }
}

const expectedSkills = [
  'marketer',
  'marketer-mission',
  'marketer-experiment',
  'marketer-review',
  'marketer-execute',
  'marketer-measure',
  'marketer-evaluate',
  'marketer-task',
  'marketer-backlog',
  'marketer-handoff',
  'marketer-retro',
  'marketer-memory',
  'marketer-criteria-override',
  'marketer-recipe',
];

for (const skillName of expectedSkills) {
  const relativePath = `skills/${skillName}/SKILL.md`;
  const content = read(relativePath);
  const match = content.match(/^---\nname: ([a-z0-9-]+)\ndescription: (.+)\n---\n/);
  expect(Boolean(match), `${relativePath}: frontmatter must contain name and description`);
  if (match) expect(match[1] === skillName, `${relativePath}: skill name must match directory`);
}

const references = [
  'bootstrap.md',
  'data-model.md',
  'state-graph.md',
  'gates.md',
  'ownership.md',
  'memory.md',
  'contract-versioning.md',
  'evaluation-policy.md',
];

for (const reference of references) {
  const content = read(`skills/marketer/reference/${reference}`);
  expect(content.trim().length > 0, `skills/marketer/reference/${reference}: empty`);
}

const templates = [
  'project.md',
  'context.md',
  'mission.md',
  'experiment.md',
  'review.md',
  'execution.md',
  'evidence.md',
  'measurement.md',
  'evaluation.md',
  'decisions.md',
  'backlog.md',
  'handoff.md',
  'retro.md',
  'memory.md',
  'signal7-execution-brief.md',
  'external-evidence-reference.md',
  'criteria-override.md',
  'baselines.md',
  'channel.md',
  'recipe.md',
];

for (const template of templates) {
  const relativePath = `skills/marketer/templates/${template}`;
  const content = read(relativePath);
  expect(/^---\n[\s\S]+?\n---\n/.test(content), `${relativePath}: missing YAML frontmatter`);
}

for (const template of ['funnel.json']) {
  const relativePath = `skills/marketer/templates/${template}`;
  const content = read(relativePath);
  try {
    const parsed = JSON.parse(content);
    expect(parsed.schema_version === 1, `${relativePath}: schema_version must be 1`);
    expect(Array.isArray(parsed.stages), `${relativePath}: stages must be an array`);
  } catch (error) {
    expect(false, `${relativePath}: invalid JSON (${error.message})`);
  }
}

const router = read('skills/marketer/SKILL.md');
hasAll(router, references, 'skills/marketer/SKILL.md');
hasAll(router, ['Do not change Signal7, Laravel, or UI code', 'Do not reinterpret locked criteria', 'canonical locked-definition snapshot', 'model assumption', 'validate-marketer-state.mjs .marketer'], 'skills/marketer/SKILL.md');

const experimentTemplate = read('skills/marketer/templates/experiment.md');
hasAll(
  experimentTemplate,
  [
    '## Hypothesis',
    'Audience',
    'Channel',
    'Primary metric',
    'Primary KPI tier',
    'Success threshold',
    'Failure threshold',
    'Measurement window',
    'Tracking',
    '## Criteria lock',
    '## Gate verdict',
  ],
  'skills/marketer/templates/experiment.md',
);

const stateGraph = read('skills/marketer/reference/state-graph.md');
hasAll(
  stateGraph,
  [
    'draft -> planned -> reviewed -> approved -> running -> measurement_pending -> evaluating',
    'cancelled',
    'win | loss | inconclusive',
    'No skill may skip a transition',
  ],
  'skills/marketer/reference/state-graph.md',
);

const dataModel = read('skills/marketer/reference/data-model.md');
hasAll(
  dataModel,
  [
    'schema_version: 1',
    'criteria_locked_at',
    'An absent reading is `unknown`, not zero.',
    'Secondary metrics may explain a result but cannot reverse the primary-KPI verdict',
    'criteria-overrides/CO-<NNN>.md',
    'metrics/baselines.md',
    'channels/*.md',
    'canonical locked-definition snapshot',
    'grade E is a model assumption',
  ],
  'skills/marketer/reference/data-model.md',
);

const signalBrief = read('skills/marketer/templates/signal7-execution-brief.md');
hasAll(signalBrief, ['contract: signal7-execution-brief/v1', 'source_system: marketer7', 'experiment_id:', 'tracking:'], 'skills/marketer/templates/signal7-execution-brief.md');

const evidenceReference = read('skills/marketer/templates/external-evidence-reference.md');
hasAll(evidenceReference, ['contract: external-evidence-reference/v1', 'external_evidence_id:', 'does not copy'], 'skills/marketer/templates/external-evidence-reference.md');

const evaluationPolicy = read('skills/marketer/reference/evaluation-policy.md');
hasAll(evaluationPolicy, ['payment', 'willingness_to_pay', 'retention', 'activation', 'signup', 'click', 'engagement', 'impression', '| A | observed behavior |', '| E | model assumption or hypothesis |'], 'skills/marketer/reference/evaluation-policy.md');

const missionTemplate = read('skills/marketer/templates/mission.md');
hasAll(missionTemplate, ['## Why', '## KPIs', '## Baseline', '## Definition of done', '## Constraints'], 'skills/marketer/templates/mission.md');

const evidenceTemplate = read('skills/marketer/templates/evidence.md');
hasAll(evidenceTemplate, ['Evidence strength: <A | B | C | D | E; E is contextual only'], 'skills/marketer/templates/evidence.md');

const reviewTemplate = read('skills/marketer/templates/review.md');
hasAll(reviewTemplate, ['## Locked definition snapshot', '```markdown', 'criteria_fingerprint'], 'skills/marketer/templates/review.md');

const overrideTemplate = read('skills/marketer/templates/criteria-override.md');
hasAll(overrideTemplate, ['review-time locked-definition snapshot', 'Success threshold | <exact value from review snapshot>', 'Failure threshold | <exact value from review snapshot>', 'changed_fields'], 'skills/marketer/templates/criteria-override.md');

const bootstrap = read('skills/marketer/reference/bootstrap.md');
hasAll(bootstrap, ['An empty root containing `project.md` is valid', 'first mission or experiment lifecycle begins'], 'skills/marketer/reference/bootstrap.md');

if (errors.length > 0) {
  console.error(`FAIL — Marketer package static contract check (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`PASS — Marketer package static contract check (${checks} checks)`);
}
