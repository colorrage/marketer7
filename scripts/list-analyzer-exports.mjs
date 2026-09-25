// List Analyzer7 hand-offs that Marketer7 has not consumed yet. Read-only:
// it never writes `.marketer/` or `.analyzer/`; it tells the operator what to
// copy or add through the normal Marketer7 skills.
//
// Usage: node scripts/list-analyzer-exports.mjs [<project root>] [--json]
//
// Contracts accepted (unknown major versions are rejected, per
// skills/marketer/reference/contract-versioning.md):
//   external-evidence-reference/v1  → copy into the experiment's contracts/
//   analyzer-opportunity/v1         → add the suggested row via marketer-backlog

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const CONTRACTS = {
  'external-evidence-reference/v1': ['experiment_id', 'provider', 'external_evidence_id', 'external_artifact'],
  'analyzer-opportunity/v1': ['provider', 'opportunity_id', 'reference', 'type', 'external_artifact'],
};

function frontmatter(text) {
  const source = text.replace(/\r\n/g, '\n');
  if (!source.startsWith('---\n')) return null;
  const end = source.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const data = {};
  for (const line of source.slice(4, end).split('\n')) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s?(.*)$/);
    if (match) data[match[1]] = match[2].trim().replace(/^"(.*)"$/, '$1');
  }
  return {data, body: source.slice(end + 5)};
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => (entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
}

export function listAnalyzerExports(projectRoot) {
  const project = path.resolve(projectRoot);
  const marketer = path.join(project, '.marketer');
  const experiments = fs.existsSync(path.join(marketer, 'experiments')) ? fs.readdirSync(path.join(marketer, 'experiments')).filter((name) => /^EX-\d+-/.test(name)) : [];
  const consumed = new Set();
  for (const file of walk(path.join(marketer, 'experiments')).filter((name) => name.includes(`${path.sep}contracts${path.sep}`) && name.endsWith('.md'))) {
    const document = frontmatter(fs.readFileSync(file, 'utf8'));
    if (document?.data.contract === 'external-evidence-reference/v1') consumed.add(`${document.data.experiment_id}|${document.data.external_evidence_id}`);
  }
  const backlog = fs.existsSync(path.join(marketer, 'backlog.md')) ? fs.readFileSync(path.join(marketer, 'backlog.md'), 'utf8') : '';
  const items = [];
  for (const file of walk(path.join(project, '.analyzer', 'exports')).filter((name) => name.endsWith('.md')).sort()) {
    const relative = path.relative(project, file).split(path.sep).join('/');
    const document = frontmatter(fs.readFileSync(file, 'utf8'));
    const contract = document?.data.contract ?? null;
    if (!CONTRACTS[contract]) {
      items.push({export: relative, contract, status: 'rejected', reason: contract ? `unknown contract or major version ${contract}` : 'missing frontmatter'});
      continue;
    }
    const missing = CONTRACTS[contract].filter((field) => !document.data[field]);
    if (missing.length) {
      items.push({export: relative, contract, status: 'rejected', reason: `missing ${missing.join(', ')}`});
      continue;
    }
    if (contract === 'external-evidence-reference/v1') {
      const directory = experiments.find((name) => name.startsWith(`${document.data.experiment_id}-`));
      const done = consumed.has(`${document.data.experiment_id}|${document.data.external_evidence_id}`);
      items.push({
        export: relative,
        contract,
        experiment_id: document.data.experiment_id,
        evidence_id: document.data.external_evidence_id,
        status: done ? 'consumed' : directory ? 'pending' : 'no_matching_experiment',
        action: done ? null : directory ? `cp ${relative} .marketer/experiments/${directory}/contracts/external-evidence-reference-${document.data.external_evidence_id}.md, then cite it from evidence.md through marketer-measure` : `no .marketer experiment ${document.data.experiment_id}`,
        summary: `${document.data.metric ?? 'metric'} = ${document.data.primary_value ?? 'unknown'}; quality ${document.data.data_quality ?? '?'}, strength ${document.data.evidence_strength ?? '?'}, causal ${document.data.causal_confidence ?? '?'}; threshold ${document.data.threshold_result ?? '?'} (criteria ${document.data.criteria_basis ?? '?'})`,
      });
    } else {
      const done = backlog.includes(document.data.reference);
      const row = document.body.split('\n').find((line) => line.startsWith('| B-<next> |')) ?? null;
      items.push({export: relative, contract, opportunity_id: document.data.opportunity_id, status: done ? 'consumed' : 'pending', action: done ? null : 'add this backlog row through marketer-backlog (allocate the next B-NNN; keep the analyzer7:SEO-OPP-NNN reference)', backlog_row: done ? null : row, summary: `${document.data.type}: ${document.data.query ?? ''} ${document.data.page ?? ''} (~${document.data.estimated_clicks_28d} clicks / 28 d)`});
    }
  }
  return {project, pending: items.filter((item) => item.status === 'pending').length, items};
}

const invokedDirectly = process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const args = process.argv.slice(2);
  const result = listAnalyzerExports(args.find((arg) => !arg.startsWith('--')) ?? process.cwd());
  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Analyzer7 exports for ${result.project}: ${result.pending} pending`);
    for (const item of result.items) {
      console.log(`- [${item.status}] ${item.export}${item.summary ? ` — ${item.summary}` : ''}${item.reason ? ` — ${item.reason}` : ''}`);
      if (item.action) console.log(`    action: ${item.action}`);
      if (item.backlog_row) console.log(`    row: ${item.backlog_row}`);
    }
  }
}
