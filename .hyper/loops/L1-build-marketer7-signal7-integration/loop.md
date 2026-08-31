---
id: L1
title: Build Marketer7 and Signal7 integration
status: complete
created: 2026-08-31T11:21:42
updated: 2026-08-31T17:00:21
---

# L1 — Build Marketer7 and Signal7 integration

## Goal
Build Marketer7 as an independent, disk-backed Agent Skills growth strategy and experimentation workflow, and add only optional, backwards-compatible experiment-execution metadata to Signal7.

## Why
Keep growth strategy, measurement, learning, and rerouting separate from Signal7's marketing-production and publication responsibilities while allowing Marketer7 to delegate execution safely.

## Constraints
- Keep Marketer7 separate from Signal7 and do not duplicate Signal7 content workers.
- Preserve legacy Signal7 projects, files, parsing, task creation, review, publishing, and archiving without migration.
- Keep experiment metadata optional in Signal7; publishing never completes a Marketer7 experiment.
- Persist decisions, evidence, learnings, and handoffs as human-readable, auditable disk state.
- Use the existing Signal7 repository at ../signal7/signal7 only for the narrowly scoped integration work.
- Do not modify Signal7 Laravel/UI code in v1; work through the Agent Skills harness and file contracts only.
- Store all Marketer7 v1 plans, experiment records, measurements, evidence, learning, and state beneath the project-local `.marketer/` root.

## Non-negotiables
- Marketer7 owns missions, hypotheses, experiments, measurement, evaluation, learning, and strategy rerouting.
- Signal7 owns asset execution, brand and claims review, publication, and execution evidence.
- Marketer7 evaluation must preserve unknowns, pre-declared thresholds, KPI priority, and WIN / LOSS / INCONCLUSIVE outcomes.
- Existing Signal7 data must remain valid unchanged.
- UI projection is deferred until the Marketer7 harness is stable and consistently passing.

## Definition of done
- Marketer7 is an installable, usable Agent Skills workflow with resumable mission and experiment state.
- Experiments require measurable hypotheses and pre-declared evaluation criteria before execution; review and pre-action gates are persisted.
- Signal7 consumes an experiment-aware execution brief and returns associable execution evidence without taking ownership of strategy.
- Legacy Signal7 fixtures and paths pass unchanged; no forced migration is introduced.
- Marketer7 persists evidence, measurement, evaluation, learning, and mission rerouting with the required evidence safeguards.
- Tests/evals and docs cover legacy and integration paths, including one end-to-end example.
- Final Hyper7 verification passes.

## Task understanding
The supplied architecture brief requests a new public Marketer7 repository beside Hyper7 and Signal7, implemented through a Hyper7 adaptive loop. Before implementation, it requires thorough Signal7 and Hyper7 inspection, a compatibility inventory, an explicit architecture decision about reuse versus independence, a concrete plan, and approval.

## Existing code and findings
Marketer7 was created empty at 2026-08-31T11:21:42 with public remote git@github.com:colorrage/marketer7.git. Signal7 is an Agent Skills suite with disk-backed Markdown/YAML `.signal/` task state; its shipped flows are quick, campaign, and strategy. Signal assets and publish-log entries have optional-tolerant YAML frontmatter but no experiment fields today. Signal7's Laravel UI parses YAML generically and persists only selected asset fields; it does not currently project experiment metadata. The user-approved implementation target is the clean Signal7 worktree at ../signal7/marketer7-integration on `codex/marketer7-integration`, based on commit 70368be; the original Signal7 worktree remains untouched despite unrelated local UI, documentation, and `.hyper` changes. Hyper7 confirms durable loops, append-only decisions/evidence, sparse cross-task memory, and handoff conventions; its repository validator currently fails on pre-existing missing local skill/template references, while the installed `grill-me` capability is available to this session.

## Authority
Mode: interactive
Delegated authority: none
Decision proxies: none
Stop for user:
- goal, why, definition of done, or non-negotiables would change
- destructive action, credential/security/privacy/legal risk, external side effect, or material cost appears
- public contract or user-facing behavior would change outside the approved goal
- close without verify, unresolved delegate disagreement, or missing required proxy

## Loop plan
Pressure-tested at: 2026-08-31T11:53:54
External review: n/a — no cross-model-review sub-agent is available in this session.
Status: approved
Approval source: user
Approved at: 2026-08-31T11:55:49

- Goal and destination: Deliver an installable `marketer` Agent Skills workflow in this repository, with all v1 mission/experiment state stored under `.marketer/`; prove its complete lifecycle through a deterministic local harness before touching Signal7.
- Approach: Reuse the disk-state, markdown/YAML, explicit-gate, append-only evidence/decision, fixture, handoff, and sparse-memory patterns from Hyper7 and Signal7. Keep Marketer7 strategy/evaluation independent. Define versioned file contracts at boundaries rather than direct state coupling. Implement no external analytics or platform adapters in v1.
- Parts and order: P1 reconnaissance and compatibility inventory; P2 Marketer7 state model, skill architecture, and contracts; P3 Marketer7 core mission/experiment/evidence/evaluation implementation; P4 deterministic harness and safety fixtures; P5 late Signal7 file-based integration, cross-repository verification, and documentation. P4 must pass before P5 begins. Laravel/UI work is deferred in `FUTURE.md`.
- Key decisions: primary skill is `marketer`; `.marketer/` is the v1 state root; Marketer7 writes versioned Signal7 execution briefs and never writes Signal7 state directly; Signal7 integration uses the clean `codex/marketer7-integration` worktree only; all added Signal7 metadata is optional; Marketer7 v1 accepts auditable local/manual evidence; future Analyzer7 evidence remains canonical in `.analyzer/` and is linked/imported by reference; future Business7 consumes structured summaries but is not implemented.
- Open risks: existing Signal7 documentation and UI state have some version drift; its static fixtures pass but do not cover every UI projection; deterministic fixtures cannot establish real-world causality; cross-repository handoff needs strict versioning and legacy fixtures to avoid silent incompatibility.

## Current route
Stabilize and test the `marketer` Agent Skills workflow first, with all v1 experiment state beneath `.marketer/`. Reserve a versioned external-evidence reference contract for Analyzer7, which will keep its own canonical observability evidence beneath `.analyzer/`. Then integrate through a file-based, versioned Marketer7-to-Signal7 execution brief that materializes only optional execution metadata into Signal7 state.

## Current focus
L1 complete; Marketer7 is public at `d454f55` and the isolated Signal7 integration branch is published with all verified contracts intact.

## Current bar
maintain the verified Marketer7 and Signal7 contract boundary; UI remains a separately approved future milestone

## Parts
- P1 — Architecture reconnaissance and compatibility inventory — done
- P2 — Marketer7 architecture and execution contract — done
- P3 — Marketer7 core workflow and state — done
- P4 — Deterministic harness and safety fixtures — done
- P5 — Late Signal7 integration, verification, and documentation — done

## Part alignment
### P1 — Architecture reconnaissance and compatibility inventory
#### Understanding
Inspect the actual Signal7 and Hyper7 architecture before any design or code decisions. Identify existing file shapes, validation assumptions, state/ledger behavior, tests, and reusable conventions; write an evidence-backed compatibility inventory.

#### Existing code and findings
Observed Signal7 contracts: `task.md` owns phase/scope/gate state; `A<N>-*.md` assets have YAML frontmatter and append-only generation logs; `publish-log.md` is append-only and idempotent on task/asset/channel/publish-at/content-hash; campaign plans retain cancelled assets rather than deleting them. Baseline `scripts/run-signal-fixtures.sh` passes 20/20 static fixtures. The main Signal7 worktree is not clean and must not be altered incidentally.

#### Part plan
Part pressure test: covered by loop pressure test 2026-08-31T11:53:54
Status: approved
Approval source: user
Approved at: 2026-08-31T11:55:49

- Goal: Establish the constraints that the remaining work must honor.
- Approach: Complete the observed compatibility inventory in the loop, explicitly record ownership boundaries and baseline checks, then use that inventory to constrain the Marketer7 architecture. No production/skill implementation occurs in this part.
- Dependencies and risks: Signal7 may have undocumented legacy formats or a mismatch between reference docs and shipped behavior. Analyzer7 must remain a future optional evidence provider, not a hidden dependency.

### P2 — Marketer7 architecture and execution contract
#### Understanding
Define the independent `.marketer/` disk model, skill boundaries, experiment state machine, evaluation safeguards, executor interface, and future Analyzer7 evidence-reference boundary after P1 evidence is complete.

#### Existing code and findings
Marketer7 is intentionally empty, so it can establish a clean v1 schema without a migration lane. Hyper7 supplies the loop, memory, handoff, and fixture-validator patterns. Signal7 supplies a compatible asset/task/publish-ledger vocabulary but is not an experiment engine and must not be coupled directly. The user approved Marketer7-first implementation, a deterministic local harness, file-based Signal7 handoff, no Laravel/UI scope, and future Analyzer7 references instead of a v1 dependency.

#### Part plan
Part pressure test: covered by loop pressure test 2026-08-31T11:57:25
Status: approved
Approval source: user
Approved at: 2026-08-31T12:00:16

- Goal: Approve the durable Marketer7 architecture, experiment lifecycle, and explicit boundary contracts that P3 will implement.
- Approach:
  1. Create a repository-local `skills/` suite with `marketer` as the only required user-facing router and narrowly scoped internal phase skills for mission/context, experiment planning, critical review/pre-action gating, execution brief generation, measurement capture, and evaluation/learning. Add management skills only where they own durable state: task/mission status, backlog, handoff, retro, and memory; do not copy Signal7 content workers.
  2. Make `.marketer/` the complete v1 state root: project/context files; `missions/M<N>-*/mission.md`; `experiments/EX-<NNN>/experiment.md`, `execution.md`, `evidence.md`, `measurement.md`, and `evaluation.md`; metrics/baselines; channels; append-only decisions; memory; backlog; rules; and versioned contract/templates directories. Marketer7-owned schema files start at `schema_version: 1`; there is no legacy Marketer migration to support.
  3. Enforce the experiment state machine `draft → planned → reviewed → approved → running → measurement_pending → evaluating → win | loss | inconclusive`, with cancellation as an explicit terminal alternative. `experiment.md` locks the falsifiable hypothesis, audience/channel, primary metric, criteria, measurement window, and thresholds before approval. Review and pre-action artifacts must reject absent criteria, unsupported claims, missing tracking, or unmeasurable action.
  4. Keep evidence append-only and source-linked. Local/manual observations are recorded in `.marketer/experiments/EX-*/evidence.md` and `measurement.md`; unknown remains unknown. Evaluation compares actual values only to predeclared criteria, never promotes secondary engagement over the primary KPI, records confidence/confounders, and writes learning plus a mission-route decision.
  5. Generate a versioned `signal7-execution-brief` inside the Marketer experiment directory. It contains only execution scope, allowed/forbidden claims, optional tracking, and IDs; it does not expose or mutate all Marketer state. Reserve a separate versioned external-evidence reference shape for future Analyzer7 records, whose canonical evidence remains in `.analyzer/`.
  6. Build the deterministic local harness before any Signal7 changes: a Node-based validator plus static fixtures for mission/experiment creation, unmeasurable rejection, review gates, execution brief shape, missing metrics, primary-KPI-over-vanity outcomes, goalpost protection, learning/reroute, resume, legacy-like absent integration fields, and future evidence-reference parsing. Use no platform/API credentials.
  7. Only after the Marketer harness passes, modify the clean Signal7 worktree's Agent Skills/docs/templates/fixtures to consume the brief and propagate optional `source_system`, `mission_id`, `experiment_id`, and `tracking` fields through task/asset/publish ledger/result artifacts. Do not change Laravel/UI. Re-run Signal7 legacy fixtures plus new integration fixtures, then document the ownership boundary and complete example.
- Dependencies and risks: P3 needs this schema and ownership contract. P4 cannot begin Signal7 changes until the Marketer harness passes. Risks are schema drift between skill docs/templates/fixtures, accidental Signal7 requirement changes, direct state coupling, future Analyzer7 duplication, and treating simulated metrics as causal proof.

### P3 — Marketer7 core workflow and state
#### Understanding
Implement the approved Marketer7 skills and durable state model for missions, experiments, evidence, measurement, evaluation, learning, and resume.

#### Existing code and findings
The repository began without source files, so P3 can create a self-contained Agent Skills suite without compatibility migration. P2 fixed the `.marketer/` state model, state machine, ownership, and contract boundaries. The P3 foundation now supplies `AGENTS.md`, the `marketer` router, state/ownership/gate references, and versioned templates; the remaining work is to give each phase and management concern a narrow writer contract. `skill-creator` requires a concise, self-contained `SKILL.md` with references only where they change the decision; Signal7 demonstrates a portable skills-only package with no runtime/CLI requirement.

#### Part plan
Part pressure test: covered by loop pressure test 2026-08-31T12:01:05
Status: approved
Approval source: user
Approved at: 2026-08-31T12:02:54

- Goal: Implement the independent Marketer7 Agent Skills workflow and all `.marketer/` templates needed for a user to create, resume, and evaluate a mission/experiment without any external executor or analytics adapter.
- Approach:
  1. Add repository-facing foundation files (`AGENTS.md`, a concise `README.md`, and `skills/` layout) and `skills/marketer/SKILL.md` as the user-facing router. The router owns only mission-level routing/gates and points to reference contracts; it does not contain every phase procedure.
  2. Add `skills/marketer/reference/` for the durable data model, state graph, gate protocol, ownership boundaries, memory discipline, and contract-version rules; add templates for project/context, mission, experiment, execution, evidence, measurement, evaluation, decisions, and generated Signal7 briefs. The core state root remains `.marketer/` in a user's project, never inside this repository.
  3. Add narrowly scoped internal phase skills: mission/context intake; experiment planning and criterion validation; experiment review plus pre-action gate; execution-brief generation/manual execution recording; evidence and measurement capture; and evaluation/learning/reroute. Each phase writes only its own artifact and returns a structured verdict; no phase silently advances a mission or rewrites historical evidence.
  4. Add the required user-facing management surface for mission status, backlog, handoff, retro, and memory, adapting Hyper7/Signal7 behavior without copying their task ids or content production. Mission IDs use `M<N>` and experiment IDs use globally unique `EX-<NNN>` allocated across active and archived state.
  5. Implement contract templates, not live adapters: `signal7-execution-brief/v1` and `external-evidence-reference/v1`. The Signal brief is generated below its Marketer experiment and is safe to pass by path; the external evidence reference never claims Analyzer7 values as locally observed data.
  6. Add minimal deterministic smoke validation for the skill package's frontmatter, referenced resources, template completeness, and legal state/status vocabulary. P4 expands this into the full fixture harness before any Signal7 changes.
- Dependencies and risks: Depends on the approved P2 design. Each implementation cycle must preserve the no-external-adapter/no-Laravel/no-Signal7-modification boundary. The main risk is a broad skill surface that duplicates phase responsibilities or lets a later evaluator change locked criteria.

### P4 — Deterministic harness and safety fixtures
#### Understanding
Prove all Marketer7 lifecycle, evidence, evaluation, resume, and contract safeguards with deterministic fixtures before any Signal7 code or schema documentation is modified.

#### Existing code and findings
P3 supplied a 12-skill package, 16 Markdown/YAML templates, and a passing deterministic static validator. P4 now adds `validate-marketer-state.mjs`, which validates a consumer project's `.marketer/` artifacts, gate/state relationships, criteria fingerprints, primary-KPI evaluation, route decisions, cancellation reasons, and v1 contracts. `run-marketer-fixtures.mjs` copies an audited static lifecycle fixture into a temporary directory for each case and passes all 16 positive/negative cases. The clean Signal7 worktree remains empty of diffs.

#### Part plan
Part pressure test: derived from the user-approved P2 harness requirements and P3 package review at 2026-08-31T12:12:16.
Status: approved
Approval source: user
Approved at: 2026-08-31T12:17:13

- Goal: Establish a deterministic, no-network Marketer7 harness that proves the state model and safety gates before the Signal7 integration work begins.
- Approach:
  1. Add a dependency-free Node state validator that reads a supplied project-local `.marketer/` directory, performs conservative YAML-frontmatter and Markdown-section checks, and exits nonzero with path-specific reasons. It will validate ID references, required artifacts, legal lifecycle/gate relationships, criteria locks, evidence/measurement provenance, primary-KPI verdicts, route-decision separation, optional contract compatibility, and external-evidence references. It will never execute a platform action or infer missing values.
  2. Add a portable fixture runner that copies static fixture projects to a temporary workspace and runs the package validator plus state validator. It will report each fixture independently, assert expected pass/fail results and expected error fragments, and leave the repository/state fixtures unchanged.
  3. Add explicit fixtures for: complete win lifecycle; unknown primary measurement yielding only inconclusive; rejected unmeasurable hypothesis; rejected missing/failed review; rejected pre-approval execution; rejected altered locked criterion; rejected vanity-metric override; valid learning with a separately recorded route decision; resumable in-progress mission; valid legacy-style project with no Signal7 brief; valid external evidence reference; and malformed/unknown-major contracts rejected safely.
  4. Add one audited end-to-end local fixture that exercises mission → planned → reviewed → approved → running → measurement_pending → evaluating → terminal, but labels all values as fixture data rather than causal proof. Capture a concise fixture README so a future operator can run it without an API key.
  5. Make P4 completion conditional on the full harness passing, package validation still passing, clean error expectations for every negative fixture, and a no-Signal7-diff check. Only then open P5 planning; Laravel/UI stays out of scope.
- Dependencies and risks: Depends on P3. The parser must avoid falsely accepting malformed YAML-like data or silently treating a missing field as valid; it will intentionally validate the canonical template shapes, not become a general YAML runtime. Fixtures prove workflow safeguards, not real-world causality or platform integration.

### P5 — Late Signal7 integration, verification, and documentation
#### Understanding
After P4 passes, add optional experiment metadata and brief/result handling to the clean Signal7 worktree, validate old and new paths, and document ownership boundaries plus the end-to-end flow. Laravel/UI remains deferred.

#### Existing code and findings
P4 completed before integration planning: `node scripts/run-marketer-fixtures.mjs` passes 16/16 cases and the package validator still passes 122 checks. P5 now adds the narrow Signal7 file contract: `signal-marketer`, optional task/asset/ledger metadata, `execution-result.md`, a contract reference/template, and an experiment-aware fixture. Re-inspection confirms no Laravel/UI file was modified and all legacy fixtures continue to pass.

#### Part plan
Part pressure test: based on P4 completion and the clean Signal7 worktree contract inspection at 2026-08-31T12:26:58.
Status: approved
Approval source: user
Approved at: 2026-08-31T12:31:20

- Goal: Prove the file-based cross-system integration and leave clear documentation.
- Approach:
  1. In the clean `codex/marketer7-integration` worktree only, add an internal `signal-marketer` skill and an integration reference. It accepts only `signal7-execution-brief/v1` supplied by path, validates its required IDs and contract version, maps its limited execution scope/claims/tracking into an ordinary Signal task, and records a task-local `execution-result.md`. It never reads or writes `.marketer/`, evaluates a KPI, or calls an external system.
  2. Extend only the Signal task and asset templates plus their data-model/creation instructions with feature-detected optional frontmatter: `source_system`, `mission_id`, `experiment_id`, `tracking`, and the brief path where useful. Existing files without all of these remain valid and are neither rewritten nor migrated. When `source_system: marketer7` is present, task-to-asset propagation must retain the same IDs and tracking.
  3. Extend `signal-publish` documentation and the data model so new Marketer-originated publish-ledger entries and `execution-result.md` can carry optional origin IDs, tracking, task/asset identifiers, timestamp, status, and publication URL when known. Preserve the existing idempotency key inputs and legacy ledger parsing exactly; no publication becomes a Marketer experiment verdict.
  4. Enhance the existing Signal static runner with feature-detection checks and add one experiment-aware fixture containing a Marketer7 v1 brief, task, asset, publish entry, and execution result. Keep every pre-existing fixture byte-for-byte unchanged, then run the complete Signal fixture suite and the Marketer 16-case harness. Do not touch `ui/` or Laravel code.
  5. Document the contract, ownership, legacy compatibility, and local end-to-end example in both repositories; update `FUTURE.md` only to retain the deferred UI boundary. Verify the clean worktree diff is limited to skills/templates/docs/evals/scripts, then perform final package, harness, and Signal regression runs before committing the two repositories separately.
- Dependencies and risks: Depends on P4. Main risks are accidentally making optional metadata mandatory, altering publish idempotency, allowing Signal7 to make experiment decisions, exposing direct cross-root state writes, or changing Laravel/UI. Keep contract parsing feature-detected rather than adding a Signal7 schema-version migration.

## Evidence digest
- 2026-08-31T11:21:42 — Marketer7 has no existing source files; its only state is a new local Git repository with a public GitHub remote.
- 2026-08-31T11:24:40 — Signal7 supports quick, campaign, and strategy flows using human-readable `.signal/` state; existing asset and publish-ledger fields are explicit but YAML parsing is tolerant of extra fields.
- 2026-08-31T11:24:40 — `scripts/run-signal-fixtures.sh` completed successfully: 20 passed, 0 failed.
- 2026-08-31T11:24:40 — `node scripts/validate-hyper.mjs` failed before this work due to missing local skill references (`grill-me`, `diagnose`, `prototype`, `tdd`, `handoff`) and stale iterate-template validation; do not attribute this baseline failure to Marketer7.
- 2026-08-31T11:33:37 — User accepted an isolated Signal7 worktree at ../signal7/marketer7-integration on branch `codex/marketer7-integration`; it is clean at commit 70368be.
- 2026-08-31T11:35:50 — User approved a file-based handoff: Marketer7 owns a versioned execution brief and Signal7 consumes it without direct cross-system state writes.
- 2026-08-31T11:38:11 — User requires all Signal7 integration work to occur only after Marketer7 is stable and its tests pass.
- 2026-08-31T11:43:41 — User explicitly excludes all Laravel/UI work from v1 and requires harness-first validation; the deferred UI milestone is recorded in `FUTURE.md`.
- 2026-08-31T11:45:56 — User approved `marketer` as the user-facing command and skill name; `Marketer7` remains the project/system name.
- 2026-08-31T11:48:44 — User identified Analyzer7 as a future, separate SEO tracking harness. Treat it as a future evidence-provider integration, not a Marketer7 v1 implementation dependency, until its task definition is supplied.
- 2026-08-31T11:50:52 — Analyzer7 task supplied: Analyzer7 will own independent analytics, evidence, tracking quality, uncertainty, and SEO observability; Business7 will consume structured evidence later. Marketer7 must remain experiment owner and evaluator, accept future evidence through a documented contract, and avoid taking ownership of SEO or source adapters.
- 2026-08-31T11:53:03 — Re-read both task definitions: Marketer7 v1 stores its plans, experiment evidence, and measurements in project-local `.marketer/`; future Analyzer7 stores canonical independent observability evidence in `.analyzer/`. Marketer7 will link to Analyzer7 evidence rather than make Analyzer7 a dependency or duplicate its source of truth.
- 2026-08-31T11:57:25 — P2 architecture proposes an independently versioned `.marketer/` schema, an enforced experiment state machine, append-only evidence/decisions, deterministic local harnesses before Signal7 work, and file contracts rather than cross-system state writes.
- 2026-08-31T12:01:05 — P3 file-level plan preserves the approved sequencing by making deterministic Marketer7 harness work P4 and Signal7 integration P5; no Laravel/UI scope exists in either part.
- 2026-08-31T12:07:29 — Marketer7 foundation now provides 19 router/reference/template files. A deterministic local check verified all required foundation files and the measurable experiment-definition fields; no live project state, external adapter, or Signal7 file was created or changed.
- 2026-08-31T12:12:16 — P3 is complete: 12 skills, 16 templates, and `scripts/validate-marketer-package.mjs` form the local skill/state foundation. Static validation passes 122 checks after correcting one overly strict test string; the next gap is fixture-level lifecycle validation.
- 2026-08-31T12:17:13 — User approved the P4 no-network deterministic state-validator and fixture-runner plan. Begin P4 without touching Signal7.
- 2026-08-31T12:26:58 — P4 passed: `run-marketer-fixtures.mjs` passes 16/16 positive and negative cases; `validate-marketer-package.mjs` still passes 122 checks; the clean Signal7 integration worktree has no diff. P5 planning can now begin.
- 2026-08-31T12:31:20 — User approved the P5 clean-worktree optional-metadata integration plan. Begin the file-contract integration without Laravel/UI changes.
- 2026-08-31T12:37:47 — P5 passed: Signal7's 21 static fixtures (legacy plus Marketer bridge) and Marketer7's 16 deterministic fixtures pass; package validation remains at 122 checks. The implemented bridge is contract-only and no UI/Laravel file changed.
- 2026-08-31T12:39:50 — Git publication completed: Marketer7 commit `bfcb7a7` is pushed to public `main`; Signal7 integration commit `5ac859b` is pushed to `codex/marketer7-integration`.
- 2026-08-31T17:00:21 — Preserved the original 1,237-line source task alongside the loop and closed L1 after both worktrees were confirmed clean.

## Relevant artifacts
- ../signal7/signal7 — existing Signal7 repository to inspect and modify only within the approved integration boundary.
- ../hyper7/hyper7 — existing Hyper7 repository to inspect for workflow conventions.
- ../signal7/signal7/skills/signal/reference/data-model.md — Signal7 task, asset, content-plan, and publish-ledger contract.
- ../signal7/signal7/skills/signal-publish/SKILL.md — append-only, idempotent publishing behavior.
- ../signal7/signal7/ui/app/Services/FrontmatterParser.php — tolerant YAML frontmatter parsing used by the UI.
- ../signal7/signal7/scripts/run-signal-fixtures.sh — passing Signal7 static-fixture baseline.
- ../signal7/marketer7-integration — clean worktree reserved for the Signal7 integration diff.
- FUTURE.md — deferred Signal7 UI milestone and activation condition.

## Bar history
- 2026-08-31T11:21:42 — Initial bar: clear alignment by approving the loop plan and current part plan
- 2026-08-31T11:53:54 — Initial architecture completed: clear alignment by approving the Marketer7-first loop plan and P1 reconnaissance part plan.
- 2026-08-31T11:55:49 — P1 approved and complete: clear alignment by approving the P2 Marketer7 architecture and execution-contract plan.
- 2026-08-31T12:00:16 — P2 approved and complete: clear alignment by approving the P3 Marketer7 core implementation plan.
- 2026-08-31T12:02:54 — P3 approved and started: complete the P3 state foundation and core skill package while preserving the harness-before-Signal7 gate.
- 2026-08-31T12:17:13 — P4 approved and started: complete the deterministic Marketer7 state harness and keep Signal7 untouched.
- 2026-08-31T12:26:58 — P4 complete: clear alignment by approving the P5 optional-metadata integration plan for the clean Signal7 worktree.
- 2026-08-31T12:31:20 — P5 approved and started: complete the optional Signal7 contract integration, regression validation, and documentation without Laravel/UI changes.
- 2026-08-31T12:37:47 — P5 implementation and validation complete: record the independently verified implementation in Git and publish the Marketer7 repository.
- 2026-08-31T12:39:50 — L1 complete: maintain the verified Marketer7 and Signal7 contract boundary; UI remains a separately approved future milestone.

## Route shifts
- None yet.

## Decisions
- 2026-08-31T11:21:42 — Created the adaptive master loop in the new Marketer7 repository; Signal7 remains a separate implementation target.
- 2026-08-31T11:24:40 — Preserve the observed dirty Signal7 worktree; decide the implementation isolation strategy before modifying that repository.
- 2026-08-31T11:33:37 — User approved the recommended isolated implementation target: `codex/marketer7-integration`, based on Signal7 commit 70368be.
- 2026-08-31T11:35:50 — User approved file-based execution handoff. Signal7 will retain only optional origin and tracking metadata in its own task, assets, and publish ledger.
- 2026-08-31T11:38:11 — Sequence the loop Marketer7-first; defer all Signal7 code and metadata changes until the Marketer7 workflow and tests are stable.
- 2026-08-31T11:43:41 — Exclude Laravel/UI changes from v1. Reconsider UI only after the end-to-end harness proves the file-based integration contract.
- 2026-08-31T11:45:56 — Name the primary user-facing workflow `marketer`, matching the `hyper` and `signal` command convention.
- 2026-08-31T11:48:44 — Preserve an executor/evidence-provider boundary that can later accommodate Analyzer7; do not absorb SEO tracking into Marketer7 v1.
- 2026-08-31T11:50:52 — Treat Analyzer7 as an optional future evidence provider. Marketer7 must neither depend on it for v1 nor redefine Analyzer7's evidence, causal-confidence, tracking-quality, or source-conflict ownership.
- 2026-08-31T11:53:03 — Make `.marketer/` the sole Marketer7 v1 state root. Future Analyzer7 evidence is an external, versioned reference/input with its canonical record remaining in `.analyzer/`.
- 2026-08-31T11:53:54 — Pressure-tested the architecture through sequential user decisions: isolate Signal7 work; use file-based handoff; name the command `marketer`; validate Marketer7 by local harness before Signal7 changes; defer Laravel/UI; keep Analyzer7 optional and canonical for future observability evidence. The proposed route preserves all original non-negotiables.
- 2026-08-31T12:00:16 — User approved P2 architecture. The `.marketer/` schema and file-contract boundaries are now fixed inputs to P3 implementation.
- 2026-08-31T12:01:05 — Corrected the part labels to match the approved dependency: P4 is the harness gate; P5 is late Signal7 integration, verification, and documentation.
- 2026-08-31T12:02:54 — User approved P3 implementation. Begin with the `.marketer/` state and skill-contract foundation; keep all execution local and do not modify Signal7.
- 2026-08-31T12:07:29 — Established `skills/marketer/` as the sole state-contract authority and made `.marketer/` templates explicit rather than creating live state in the source repository. Proceed with narrow phase writers before expanding validation in P4.
- 2026-08-31T12:12:16 — Completed P3 without adding any external adapter, runtime project state, Signal7 change, Laravel/UI code, or Analyzer7 dependency. P4 is now the mandatory validation gate before integration planning.
- 2026-08-31T12:17:13 — User approved P4. The local state validator and isolated fixture runner are now the only permitted P4 implementation scope.
- 2026-08-31T12:26:58 — P4 is complete and satisfied the required harness-before-Signal7 gate. P5 may modify only the clean Signal7 worktree through optional, feature-detected file contracts; Laravel/UI remains excluded.
- 2026-08-31T12:31:20 — User approved P5. Signal7 changes are limited to its clean integration worktree, Agent Skills contracts, templates, static fixtures, and documentation.
- 2026-08-31T12:37:47 — Completed the optional Signal7 bridge through feature detection, not a schema migration: `signal-marketer` accepts only `signal7-execution-brief/v1`; Signal7 retains optional origin metadata and executor-side results; Marketer7 retains experiment ownership. UI/Laravel is still deferred.
- 2026-08-31T12:39:50 — Published the two independent commits. Marketer7 is public at `colorrage/marketer7`; Signal7's change remains isolated for review/merge on `codex/marketer7-integration`.
- 2026-08-31T17:00:21 — Closed L1 as complete. The source task, decisions, tests, and completion evidence are all versioned in Marketer7.

## Starting point
- New public repository `colorrage/marketer7`, intentionally empty except for Git metadata; the supplied task brief is the source of scope. Signal7 lives at ../signal7/signal7 and Hyper7 at ../hyper7/hyper7. The first approved work is reconnaissance, not implementation.

## Cycles

### Cycle 1 — 2026-08-31T11:55:49 — Validate reconnaissance exit criteria

**Intent:** validate

**Observe:** Re-read the recorded Signal7 state/asset/publish contracts, the clean isolated worktree state, the Signal7 static-fixture baseline, the Hyper7 loop/memory conventions, the Analyzer7 boundaries, and the user's approved loop and P1 plan.

**Orient:** P1 succeeds only if later design work can name what to reuse, what not to couple, and which baseline failures are external to this task.

**Prior belief:** Signal7 could be integrated late through optional metadata without giving it experiment ownership, while Marketer7 could remain self-contained in `.marketer/`.

**Action:** Consolidated the compatibility inventory and pressure-tested decisions into the approved loop plan; no Marketer7 or Signal7 runtime/skill code was changed.

**Evidence:** `skills/signal/reference/data-model.md` and `skills/signal-publish/SKILL.md` establish YAML state plus append-only idempotent ledger behavior; `scripts/run-signal-fixtures.sh` exited 0 with 20 passed; the clean Signal7 worktree is at commit 70368be on `codex/marketer7-integration`; the original and Analyzer7 task briefs establish `.marketer/`, optional Signal7 integration, and future `.analyzer/` canonical evidence.

**Learning:** The safest v1 is a Marketer-owned experiment model with local auditable evidence, a versioned file boundary to Signal7, and only external evidence references to future Analyzer7.

**Route impact:** no change

**Next:** continue

### Cycle 5 — 2026-08-31T12:26:58 — Validate Marketer7 lifecycle harness gate

**Intent:** validate

**Observe:** The initial state-validator run rejected a valid failure threshold because the generic placeholder check treated `<=` as a placeholder. After correcting that parser rule, the base lifecycle passed. The completed runner then covered 16 deterministic paths, including both accepted and rejected states.

**Orient:** P4 exit requires the harness to prove all specified safety cases and establish that Signal7 remains unchanged. This validation is deterministic fixture work, not a causal experiment or external integration.

**Prior belief:** A static lifecycle fixture plus isolated mutations could exercise the experiment safeguards without creating a real project, calling an API, or mutating Signal7.

**Action:** Added a dependency-free state validator, audited lifecycle fixture, temporary-copy runner, fixture README, review-definition fingerprint, and explicit cancellation-reason rule. Re-ran all checks after each correction.

**Evidence:** `scripts/validate-marketer-state.mjs:1-298`, `scripts/run-marketer-fixtures.mjs:1-191`, and `fixtures/marketer/valid-lifecycle/.marketer/` implement the harness. `node scripts/run-marketer-fixtures.mjs` exited 0 with `PASS — Marketer fixture harness (16/16 passed)`; `node scripts/validate-marketer-package.mjs` exited 0 with 122 checks; `git -C ../signal7/marketer7-integration status --short` produced no output.

**Learning:** The harness reliably rejects unmeasurable definitions, missing review, pre-approval execution, altered locked criteria, primary-KPI overrides, missing-metric wins, bad contract versions/frontmatter, and unjustified cancellation while preserving valid unknown, resume, legacy-no-brief, external-reference, and cancellation paths.

**Route impact:** P4 complete; begin P5 only after user approval of its clean-worktree optional-metadata plan.

**Next:** continue

### Cycle 4 — 2026-08-31T12:12:16 — Complete phase and management skill package

**Intent:** implement

**Observe:** The foundation lacked narrow phase instructions, a persisted independent review artifact, management instructions, and the minimal static validator promised by P3.

**Orient:** The correct boundary is phase-local content writes with router-applied legal status transitions. TDD is not applicable to the new static validator's first pass because it validates a previously absent package; its deterministic execution supplies immediate falsification and P4 will add pass/fail fixtures.

**Prior belief:** Separate phase writers plus a small static validator would make lifecycle and ownership responsibilities inspectable before adding full state fixtures.

**Action:** Added the review artifact/template, six phase skills, five management skills, supporting management templates, router transition rules, and `scripts/validate-marketer-package.mjs`.

**Evidence:** `skills/marketer-review/SKILL.md:1-27`, `skills/marketer-measure/SKILL.md:1-27`, `skills/marketer-evaluate/SKILL.md:1-25`, `skills/marketer-task/SKILL.md:1-24`, and `scripts/validate-marketer-package.mjs:1-147` implement the boundaries and validator. Initial execution exposed one check/text mismatch for the unknown-versus-zero rule; after aligning the assertion to `data-model.md`, `node scripts/validate-marketer-package.mjs` exited 0: `PASS — Marketer package static validation (122 checks)`.

**Learning:** The review-record boundary makes the no-auto-approval rule concrete, while static validation catches repository-contract drift but cannot prove actual project-state behavior.

**Route impact:** P3 complete; P4 must add the project-state fixture gate before any Signal7 work.

**Next:** continue

### Cycle 2 — 2026-08-31T12:00:16 — Validate and freeze architecture contract

**Intent:** validate

**Observe:** The user approved the P2 state, skill-surface, lifecycle, harness, and cross-system boundary plan.

**Orient:** The next useful move is to freeze the design as P3 input rather than reopening architectural choices during implementation.

**Prior belief:** A small skill suite plus explicit templates, state transitions, and deterministic validation can satisfy the requested workflow without an external runtime.

**Action:** Recorded P2 approval as the architecture contract; opened P3 as the only current part and deferred Signal7/Laravel changes.

**Evidence:** P2 `## Part plan` is approved by user at 2026-08-31T12:00:16; its seven implementation constraints cover `.marketer/`, lifecycle gates, evidence handling, Signal7 brief, Analyzer7 references, local harness, and delayed Signal7 integration.

**Learning:** The architecture is sufficiently bounded to start implementation only after a P3 file-level plan is approved.

**Route impact:** no change

**Next:** continue

### Cycle 3 — 2026-08-31T12:07:29 — Establish state and router foundation

**Intent:** implement

**Observe:** P3 was user-approved; Marketer7 had no prior source files, and P2 requires all durable v1 state to use explicit `.marketer/` artifacts with a versioned file boundary to external systems.

**Orient:** A shared state contract and templates must exist before narrow phase skills can safely write lifecycle artifacts. This documentation/skill-definition slice has no executable business behavior yet, so test-driven implementation is not applicable; a deterministic package validator belongs in P4.

**Prior belief:** A single router plus concise references and explicit templates could prevent lifecycle, ownership, and evidence rules from drifting across later skills.

**Action:** Added repository instructions, the `marketer` router, six authoritative references, and eleven templates covering project/context, mission, experiment, execution, evidence, measurement, evaluation, decisions, Signal7 brief, and external evidence references.

**Evidence:** `AGENTS.md:1-22`, `skills/marketer/SKILL.md:1-39`, `skills/marketer/reference/data-model.md:1-41`, `skills/marketer/reference/state-graph.md:1-23`, and `skills/marketer/templates/experiment.md:1-70` define the foundation. The manual deterministic check `node -e ...` completed with `Marketer foundation check: 19 files verified` and confirmed every required file plus hypothesis, primary metric, thresholds, measurement window, tracking, and criteria-lock sections.

**Learning:** Explicit templates make unknown evidence, locked criteria, and the Signal7/Analyzer7 boundaries concrete without requiring an external runtime.

**Route impact:** no change

**Next:** continue

### Cycle 6 — 2026-08-31T12:37:47 — Integrate optional Signal7 execution contract

**Intent:** implement

**Observe:** P4 passed all local lifecycle fixtures; the clean Signal7 worktree had optional-tolerant frontmatter and legacy structural fixtures but no Marketer7 brief consumer, origin propagation, or task-local executor result.

**Orient:** The integration must be an optional, feature-detected file boundary. No new required field, migration, UI projection, direct cross-root write, publish-idempotency change, or experiment verdict is permissible. The existing static runner is the appropriate first deterministic regression net for this Agent Skills contract.

**Prior belief:** A bridge skill plus explicit optional metadata and a single representative fixture could prove association without making Signal7 a strategy/measurement system.

**Action:** Added `signal-marketer`, a Marketer7 integration reference and execution-result template; updated Signal router/brief/create/plan/publish contracts, templates, data model, cross-boundary docs, fixture runner, README, and one static Marketer-originated Signal fixture. Added the corresponding Marketer integration guide and updated the explicitly deferred UI note.

**Evidence:** `skills/signal-marketer/SKILL.md:1-57`, `skills/signal/reference/marketer7-integration.md:1-43`, `skills/signal/templates/execution-result.md:1-20`, `evals/signal-fixtures/marketer7-execution-brief/`, and `docs/signal7-integration.md:1-48` define the boundary. `scripts/run-signal-fixtures.sh` exited 0 with `Signal7 checks: 21 passed, 0 failures`; `node scripts/run-marketer-fixtures.mjs` exited 0 with `16/16 passed`; `node scripts/validate-marketer-package.mjs` exited 0 with 122 checks; `bash -n scripts/run-signal-fixtures.sh` and `git diff --check` exited 0. The only shell warning was a non-fatal missing `C.UTF-8` locale.

**Learning:** Feature detection is sufficient: legacy Signal7 artifacts stay untouched and valid, while Marketer-originated tasks can retain a complete executor association trail without ever deciding KPI outcomes. The static fixture now validates the brief contract itself in addition to task/asset/ledger/result propagation.

**Route impact:** P5 complete; both repositories are ready for separate commits. Marketer7 can be pushed publicly; Signal7 remains isolated on `codex/marketer7-integration`.

**Next:** continue

### Cycle 7 — 2026-08-31T12:39:50 — Record and publish verified repositories

**Intent:** validate

**Observe:** The implementation commits succeeded locally: Marketer7 `bfcb7a7` on `main` and Signal7 `5ac859b` on `codex/marketer7-integration`. The first Marketer7 push failed because its initial SSH remote had no usable SSH access; GitHub CLI confirmed the repository existed and was public.

**Orient:** The failure was transport-only, not a repository/contract failure. Use the existing authenticated GitHub HTTPS setup without exposing a token, then verify both remotes have the intended branches.

**Prior belief:** The user-approved GitHub credentials could publish both independent commits once the Marketer remote used the available authenticated transport.

**Action:** Published the Signal7 integration branch, changed only the local Marketer7 remote transport from SSH to HTTPS, configured Git to use the existing GitHub CLI credential helper, and published Marketer7 `main`.

**Evidence:** Git push confirmed `codex/marketer7-integration -> origin/codex/marketer7-integration` and printed the review URL. GitHub CLI confirmed `colorrage/marketer7` visibility is `PUBLIC`; the retry confirmed `main -> origin/main`.

**Learning:** The public repository and review branch are both available without broadening scope; cross-system integration stays reviewable as an isolated Signal7 branch.

**Route impact:** loop complete

**Next:** complete

## Handoff cues
- Next atomic move: None. For a future Laravel/UI milestone, start a new approved task from `FUTURE.md`; for Signal7 adoption, review and merge the isolated integration branch.
- Current risk or uncertainty: Marketer7 needs complete v1 experiment measurement and evaluation without duplicating or blocking on Analyzer7's future independent evidence ownership.
- Dirty or unvalidated state: Marketer7 loop state is newly created and uncommitted; the original Signal7 worktree remains independently dirty and must be preserved.

## Verified outcomes

- `node scripts/validate-marketer-package.mjs` — PASS (122 checks).
- `node scripts/run-marketer-fixtures.mjs` — PASS (16/16 cases).
- `scripts/run-signal-fixtures.sh` in the clean integration worktree — PASS (21 fixtures, 0 failures).
- `bash -n scripts/run-signal-fixtures.sh` and clean-worktree `git diff --check` — PASS.
- No Signal7 Laravel/UI file changed; the original dirty Signal7 worktree was not modified.
- Marketer7 `main` and Signal7 `codex/marketer7-integration` are both pushed to their GitHub remotes.

## Outcome
Close summary: Marketer7 is a public, verified Agent Skills experiment workflow at `d454f55`. Signal7 has a separately published, backwards-compatible execution-brief integration branch at `5ac859b`. Laravel/UI work remains deferred.
Verify link: https://github.com/colorrage/marketer7
