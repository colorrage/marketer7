import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {listAnalyzerExports} from './list-analyzer-exports.mjs';

const repositoryRoot = process.cwd();
const project = fs.mkdtempSync(path.join(os.tmpdir(), 'marketer7-analyzer-exports-'));

try {
  fs.cpSync(path.join(repositoryRoot, 'fixtures', 'marketer', 'valid-lifecycle', '.marketer'), path.join(project, '.marketer'), {recursive: true});
  fs.rmSync(path.join(project, '.marketer', 'experiments', 'EX-001-lifecycle-email', 'contracts', 'external-evidence-reference.md'));
  const exports = path.join(project, '.analyzer', 'exports');
  fs.mkdirSync(path.join(exports, 'EX-001'), {recursive: true});
  fs.mkdirSync(path.join(exports, 'opportunities'), {recursive: true});
  const reference = '---\nschema_version: 1\ncontract: external-evidence-reference/v1\nexperiment_id: EX-001\nprovider: analyzer7\nexternal_evidence_id: EV-001\nexternal_artifact: .analyzer/evidence/EV-001-x.md\nmetric: qualified_signups\nprimary_value: 125\n---\n\n# Reference\n';
  fs.writeFileSync(path.join(exports, 'EX-001', 'EV-001-external-evidence-reference.md'), reference);
  fs.writeFileSync(path.join(exports, 'EX-001', 'EV-002-external-evidence-reference.md'), reference.replace('/v1', '/v2').replace('EV-001', 'EV-002'));
  fs.writeFileSync(path.join(exports, 'opportunities', 'SEO-OPP-003-analyzer-opportunity.md'), '---\nschema_version: 1\ncontract: analyzer-opportunity/v1\nprovider: analyzer7\nopportunity_id: SEO-OPP-003\nreference: analyzer7:SEO-OPP-003\ntype: ctr_opportunity\nquery: cmr\npage: /cmr-document\nestimated_clicks_28d: 45.4\nexternal_artifact: .analyzer/seo/opportunities/SEO-OPP-003-x.md\n---\n\n| ID | Idea | Why it may matter | Evidence | Status |\n| --- | --- | --- | --- | --- |\n| B-<next> | ctr opportunity: "cmr" on /cmr-document | ~45.4 clicks / 28 days | analyzer7:SEO-OPP-003 | open |\n');
  const backlogPath = path.join(project, '.marketer', 'backlog.md');
  if (!fs.existsSync(backlogPath)) fs.copyFileSync(path.join(repositoryRoot, 'skills', 'marketer', 'templates', 'backlog.md'), backlogPath);
  const before = fs.readFileSync(backlogPath, 'utf8');

  const first = listAnalyzerExports(project);
  const byExport = Object.fromEntries(first.items.map((item) => [path.basename(item.export), item]));
  assert.equal(first.pending, 2);
  assert.equal(byExport['EV-001-external-evidence-reference.md'].status, 'pending');
  assert.match(byExport['EV-001-external-evidence-reference.md'].action, /\.marketer\/experiments\/EX-001-lifecycle-email\/contracts\//);
  assert.equal(byExport['EV-002-external-evidence-reference.md'].status, 'rejected', 'an unknown major version is rejected');
  assert.equal(byExport['SEO-OPP-003-analyzer-opportunity.md'].status, 'pending');
  assert.match(byExport['SEO-OPP-003-analyzer-opportunity.md'].backlog_row, /analyzer7:SEO-OPP-003/);

  fs.copyFileSync(path.join(exports, 'EX-001', 'EV-001-external-evidence-reference.md'), path.join(project, '.marketer', 'experiments', 'EX-001-lifecycle-email', 'contracts', 'external-evidence-reference.md'));
  fs.appendFileSync(path.join(project, '.marketer', 'backlog.md'), '| B-002 | ctr opportunity | ~45 clicks | analyzer7:SEO-OPP-003 | open |\n');
  const second = listAnalyzerExports(project);
  assert.equal(second.pending, 0);
  assert.ok(second.items.filter((item) => item.contract).every((item) => ['consumed', 'rejected'].includes(item.status)));
  assert.notEqual(fs.readFileSync(path.join(project, '.marketer', 'backlog.md'), 'utf8'), before, 'only the test wrote the backlog');
  console.log('PASS — Analyzer7 export listing (pending, consumed, and rejected contracts)');
} finally {
  fs.rmSync(project, {recursive: true, force: true});
}
