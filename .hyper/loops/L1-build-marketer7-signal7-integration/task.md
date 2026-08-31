# HYPER7 TASK — BUILD MARKETER7 + SIGNAL7 EXPERIMENT INTEGRATION

Use **Hyper7 adaptive workflow** for this task.

This is a non-trivial architecture and implementation task. Do not treat it as a single prompt or a one-shot code edit.

Create a new Hyper7 loop and persist all decisions, evidence, plan changes, implementation findings, verification results, and handoff state.

---

# GOAL

Build a new project/workflow system called:

# Marketer7

Marketer7 is an AI-agent growth and marketing decision system.

It must be separate from Signal7.

Signal7 remains the **marketing execution/content production system**.

Marketer7 becomes the **growth strategy / experimentation / measurement / learning / rerouting system**.

At the same time, modify Signal7 so that it can be used as an executor by Marketer7 through experiment-aware metadata and tracking.

The integration must be **backwards compatible with existing Signal7 files and tasks that do not contain experiment IDs or new metadata**.

Existing Signal7 projects created using the old file format must continue to work unchanged.

---

# CORE ARCHITECTURE

The intended responsibility split is:

```text
Hyper7
= engineering / implementation workflow

Signal7
= marketing production + content execution

Marketer7
= growth strategy + experiments + measurement + learning
```

More concretely:

```text
Marketer7
   │
   ├── decides WHAT to test
   ├── decides WHY
   ├── selects audience/channel
   ├── defines hypothesis
   ├── defines KPI
   ├── defines success/failure threshold
   ├── delegates execution
   ├── measures outcome
   ├── evaluates evidence
   ├── records learning
   └── reroutes strategy

Signal7
   │
   ├── receives execution briefs
   ├── creates assets
   ├── reviews assets
   ├── publishes/logs publication
   └── returns execution evidence
```

Signal7 must NOT become the owner of growth strategy, experiments, PMF decisions, or adaptive marketing loops.

It only needs enough metadata support to execute work originating from Marketer7.

---

# WHY THIS SEPARATION MATTERS

Do NOT merge Marketer7 logic into Signal7.

Signal7 should remain useful independently for:

* one-off social posts;
* campaigns;
* copy;
* email;
* landing pages;
* translations;
* image/video prompts;
* pricing research;
* marketing research.

Marketer7 should be usable as a higher-level orchestrator and may eventually delegate to:

* Signal7;
* Hyper7;
* browser agents;
* analytics tools;
* CRM;
* email systems;
* other external executors.

Therefore, treat Signal7 as one executor among several possible executors.

---

# PART A — CREATE MARKETER7

Build Marketer7 as a new Agent Skills-based workflow system, inspired by Hyper7 and Signal7 architecture.

Use disk-based state.

Recommended root:

```text
.marketer/
```

Suggested initial structure:

```text
.marketer/
  project.md

  context/
    product.md
    market.md
    icp.md
    positioning.md
    funnel.md

  missions/
    M1-*/
    M2-*/

  experiments/
    EX-001/
      experiment.md
      execution.md
      evidence.md
      evaluation.md

  metrics/
    baselines.md
    funnel.json

  channels/
    linkedin.md
    facebook.md
    reddit.md
    forums.md

  memory/
    index.md
    YYYY-MM-DD-*.md

  decisions.md
  backlog.md
  rules.md
```

You may adjust this structure if repository conventions suggest a better design, but preserve the conceptual separation.

---

# MARKETER7 MAIN WORKFLOW

Create a main user-facing skill:

```text
marketer
```

or:

```text
marketer7
```

Choose naming consistent with Hyper7/Signal7 conventions.

The adaptive growth flow should be:

```text
INTAKE / CONTEXT
    ↓
MISSION
    ↓
HYPOTHESIS
    ↓
EXPERIMENT PLAN
    ↓
EXPERIMENT REVIEW
    ↓
PRE-ACTION GATE
    ↓
EXECUTION
    ↓
EVIDENCE COLLECTION
    ↓
MEASUREMENT
    ↓
EVALUATION
    ↓
WIN / LOSS / INCONCLUSIVE
    ↓
LEARNING
    ↓
STRATEGY UPDATE
    ↓
NEXT EXPERIMENT / REROUTE / STOP
```

This is NOT a linear workflow that ends after publish.

The key difference from Signal7:

```text
publish != done
```

Publishing is only part of experiment execution.

The loop only produces learning after measurement and evaluation.

---

# MISSIONS

Marketer7 should support high-level tracked missions.

A mission is a strategic objective such as:

```text
M1 — Acquisition validation
M2 — Activation validation
M3 — Retention validation
M4 — Monetization validation
```

A mission contains one or more experiments.

Each mission should define:

```text
goal
why
primary KPI
secondary KPIs
baseline
definition of done
constraints
active hypotheses
experiments
evidence digest
decisions
current route
status
```

Use append-only decisions/evidence where appropriate, following Hyper7 philosophy.

---

# EXPERIMENT MODEL

Each meaningful marketing action should optionally be represented as an experiment.

Required experiment fields:

```yaml
id: EX-001
status: planned

mission: M1

hypothesis:
  Accountants respond better to challenge framing
  than generic free-trial framing.

audience:
  Romanian accountants

channel:
  linkedin

executor:
  signal7

action_type:
  social_post

primary_metric:
  activated_testers

secondary_metrics:
  - clicks
  - signups
  - first_questions

baseline:
  optional

success_threshold:
  activated_testers >= 3

failure_threshold:
  activated_testers == 0

measurement_window:
  7d

cost:
  0 EUR

risk:
  low
```

Additional optional fields are fine.

Do not require every field when not applicable, but the system must prevent an experiment from executing if it has no measurable hypothesis or no evaluation criteria.

---

# EXPERIMENT STATES

Use a clear state machine.

Recommended:

```text
draft
planned
reviewed
approved
running
measurement_pending
evaluating
win
loss
inconclusive
cancelled
```

Do not mark an experiment complete merely because execution happened.

---

# EXPERIMENT REVIEW GATE

Create a critical review step before execution.

The reviewer should challenge:

* whether the hypothesis is falsifiable;
* whether the audience matches the ICP;
* whether the selected channel can test the hypothesis;
* whether the metric matches the hypothesis;
* whether thresholds are meaningful;
* whether success could be vanity metrics;
* whether attribution is possible;
* whether the experiment is too broad;
* whether the result could be confounded;
* whether a cheaper/higher-information test exists.

The review output must be structured and persisted.

---

# PRE-ACTION GATE

Before external/public execution, validate:

## Claims

* supported?
* not fabricated?
* no unsupported accuracy claims?
* no fake testimonials?
* no invented customer results?

## Platform

* rules known?
* promotion allowed?
* disclosure required?
* spam risk?

## Audience

* correct ICP?
* or just broad reach?

## CTA

* CTA actually tests the hypothesis?

## Tracking

* experiment ID attached?
* campaign/UTM or equivalent tracking present when appropriate?

## Reputation / Legal

* any material external-side-effect risk?

Result:

```text
PASS
```

or:

```text
BLOCKED
reason:
recommended_fix:
```

---

# EXECUTION

Marketer7 should support multiple executor types.

Initial executor support should include:

```text
signal7
manual
external
```

The architecture must allow future executors:

```text
hyper7
browser
email
crm
analytics
```

Do NOT hardcode Signal7 as the only execution backend.

Use an execution contract/interface.

---

# SIGNAL7 EXECUTION BRIEF

When Marketer7 delegates to Signal7, create a standardized execution brief.

Example:

```yaml
experiment_id: EX-021
mission_id: M1

executor: signal7

goal:
  Generate qualified Romanian accountant testers.

audience:
  Romanian accountants

channel:
  linkedin

asset_type:
  social_post

hypothesis:
  Challenge framing outperforms free-trial framing.

message:
  Give Banu five difficult fiscal questions.

cta:
  test_banu

claims_allowed:
  - legislation-backed answers
  - cited legal sources
  - beta access

claims_forbidden:
  - guaranteed correctness
  - unsupported accuracy percentages

tracking:
  utm_campaign: EX-021
```

Signal7 should consume this without needing to understand the entire Marketer7 strategic state.

---

# EVIDENCE MODEL

Evidence must be first-class.

Recommended experiment evidence:

```text
URL
platform
published_at
asset_id
signal_task_id
screenshots
raw metrics
comments/replies
qualified replies
analytics source
measurement timestamp
```

Store raw evidence separately where useful.

Do not permit the evaluation layer to invent or infer missing metrics.

Unknown values must remain unknown.

---

# MEASUREMENT

Create a dedicated measurement step.

This should not be mixed with content publishing.

Example marketing metrics:

```text
impressions
reach
clicks
visits
signups
first_question
five_plus_questions
7d_return
30d_return
willing_to_pay
paid
qualified_replies
demo_requests
revenue
```

Metrics must be extensible.

Do not hardcode Marketer7 to Banu-specific metrics.

---

# KPI HIERARCHY

Introduce optional business-value ranking.

Default conceptual hierarchy:

```text
1. payment / revenue
2. willingness to pay
3. retention
4. activation
5. signup
6. click
7. engagement
8. impression
```

If an experiment gets high engagement but fails its higher-value KPI, the evaluator must not classify it as a win.

Example:

```text
WARNING:
Engagement improved, but the primary activation metric failed.
Do not classify this experiment as successful.
```

---

# EVIDENCE CONFIDENCE

Support evidence strength.

Suggested levels:

```text
A — observed behavior
    payment, usage, conversion

B — direct qualitative evidence
    interview, direct user statement

C — survey / stated intention

D — engagement signal
    likes, comments, impressions

E — model assumption / hypothesis
```

The evaluator should distinguish strong behavioral evidence from weak stated intention.

---

# EVALUATION

Create a dedicated evaluation skill.

Required verdicts:

```text
WIN
LOSS
INCONCLUSIVE
```

The evaluator must compare actual evidence against the experiment's pre-declared success/failure criteria.

It must not move the goalposts after seeing the result.

Persist:

```text
actual results
threshold comparison
verdict
confidence
confounders
what was learned
what was NOT learned
recommended next move
```

---

# LEARNING / ADAPTIVE LOOP

After evaluation:

```text
OBSERVE
what happened?

ORIENT
what does the evidence mean?

DECIDE
what changes?

ACT
what experiment comes next?
```

Record durable learnings.

Example:

```text
Observation:
LinkedIn produced 7,000 impressions but 1 tester.

Facebook accountant group produced 300 impressions
and 5 activated accountants.

Learning:
Smaller professional communities produce higher
qualified conversion.

Decision:
Shift next acquisition experiments toward communities.
```

Update mission route and active hypotheses.

Do not silently overwrite historical decisions.

---

# MEMORY

Create:

```text
.marketer/memory/
```

for durable non-obvious learnings.

Examples:

```text
Romanian accountants respond poorly to generic AI positioning.

Challenge framing produced higher qualified reply rate.

Specific Facebook group removes external links.

Users who ask one question rarely return.

Technical fiscal case studies outperform generic posts.
```

Use an index similar to Hyper7 memory conventions.

Read memory on mission resume.

---

# CHANNEL KNOWLEDGE

Support per-channel state or recipes.

Examples:

```text
.marketer/channels/linkedin.md
.marketer/channels/facebook.md
.marketer/channels/reddit.md
```

Track:

```text
audience fit
known rules
working formats
failed formats
tracking limitations
historical experiment results
reputation risks
```

This should become reusable evidence, not generic static advice.

---

# RECIPES

Support reusable growth recipes.

Examples:

```text
reddit-organic
linkedin-founder-post
facebook-group-challenge
direct-accountant-outreach
landing-page-activation-test
newsletter-reactivation
```

Recipes should define process, not fixed copy.

---

# BACKLOG / HANDOFF / RETRO

Reuse Hyper7/Signal7 design patterns.

Marketer7 should include equivalents for:

```text
backlog
task/mission status
handoff
retro
memory
```

Do not duplicate code unnecessarily if existing patterns can be adapted cleanly.

---

# TEAM / MULTI-MODEL REVIEW

Design Marketer7 so that future or existing team delegation can be used for:

```text
strategy review
experiment critique
research
measurement verification
evaluation critique
```

Do not require team functionality for v1 if doing so would overcomplicate the architecture, but do not make future integration difficult.

---

# PART B — MODIFY SIGNAL7

Modify Signal7 ONLY enough to support Marketer7 integration cleanly.

Do NOT move experiment ownership into Signal7.

Add optional experiment-aware metadata.

---

# SIGNAL7 BACKWARDS COMPATIBILITY — CRITICAL REQUIREMENT

Existing Signal7 projects and files may use the old format.

They may NOT contain:

```text
experiment_id
mission_id
tracking
source_experiment
executor metadata
```

These older files MUST continue to parse, validate, load, resume, create, review, publish, and archive exactly as before.

Do NOT make new fields required in existing Signal7 schemas.

All new experiment-related fields must be optional unless a task explicitly declares that it originates from Marketer7 or experimental context.

---

# REQUIRED BACKWARDS-COMPATIBILITY BEHAVIOR

Old asset:

```yaml
id: A3
type: social
channel: linkedin
status: review
```

must still work.

New experiment-aware asset may be:

```yaml
id: A3
type: social
channel: linkedin
status: review

experiment_id: EX-021
mission_id: M1
source_system: marketer7

tracking:
  utm_campaign: EX-021
```

Both must be valid.

---

# NO ID MIGRATION REQUIREMENT

Signal7 already has existing legacy files that may lack newer identifiers or experimental identifiers.

Do NOT require migration before use.

Do NOT rewrite legacy files merely to add IDs.

Do NOT fail parsing because an ID field is absent when the legacy schema historically allowed that absence.

Where an ID is genuinely needed for a new operation, generate it only for new artifacts or use a safe runtime fallback.

Preserve original legacy file content unless a normal Signal7 operation already modifies that file.

---

# SCHEMA VERSIONING

Evaluate whether explicit schema versioning is appropriate.

For example:

```yaml
schema_version: 2
```

But:

* legacy files without `schema_version` must default to legacy behavior;
* no forced migration;
* parsers must detect old/new shape safely;
* tests must cover both.

If schema versioning adds unnecessary complexity, use feature detection instead.

Make this an explicit architectural decision in the technical plan.

---

# SIGNAL7 ASSET METADATA

Add optional fields such as:

```yaml
source_system: marketer7
experiment_id: EX-021
mission_id: M1

tracking:
  utm_campaign: EX-021
  utm_source: linkedin
```

Use names consistent with current Signal7 conventions.

Do not arbitrarily rename existing fields.

---

# SIGNAL7 PUBLISH LEDGER

Extend publish-log / publish ledger entries to optionally include:

```text
experiment_id
mission_id
source_system
tracking metadata
```

Legacy publish entries must still be valid.

Do not break idempotency logic.

---

# SIGNAL7 EXECUTION RESULT

When Signal7 executes a Marketer7-originated request, produce enough machine-readable output for Marketer7 to associate:

```text
signal task
asset
publication
URL
timestamp
experiment
tracking
status
```

This does not need to include performance metrics.

Performance belongs to Marketer7 measurement.

---

# SIGNAL7 REVIEW

Signal7 review continues to own:

```text
brand fit
copy quality
claims compliance
channel fit
asset correctness
```

Marketer7 owns:

```text
hypothesis quality
experiment quality
KPI choice
growth evaluation
```

Keep this boundary explicit in docs and code.

---

# TESTING REQUIREMENTS

Add strong tests/evals.

At minimum:

## Signal7 backwards compatibility

Test existing legacy fixtures unchanged.

Test:

```text
old quick task
old campaign
old publish ledger
old asset without experiment fields
old task resume
```

All must pass unchanged.

## New Signal7 experiment metadata

Test:

```text
asset with experiment_id
execution brief from Marketer7
publish ledger experiment metadata
resume experiment-aware task
```

## Marketer7

Test:

```text
create mission
create experiment
reject non-measurable hypothesis
review experiment
approve
delegate to Signal7 contract
record evidence
record measurement
evaluate WIN
evaluate LOSS
evaluate INCONCLUSIVE
write learning
reroute mission
resume mission across session
memory recall
```

## Evaluation correctness

Fixture examples should prove:

* high likes + zero activation != WIN;
* payment evidence outranks stated willingness;
* missing metric produces INCONCLUSIVE rather than fabricated conclusion;
* thresholds cannot be changed after execution without explicit recorded override.

---

# FAILURE MODES TO GUARD AGAINST

Explicitly design against:

```text
vanity metric optimization
goalpost shifting
invented metrics
invented attribution
silent strategy rewrites
duplicate experiments
duplicate publication
experiment marked done before measurement
legacy Signal7 parse failure
forced migration of old files
Signal7 owning growth strategy
Marketer7 duplicating Signal7 content logic
```

---

# DOCUMENTATION

Update/create documentation explaining:

```text
what Hyper7 owns
what Signal7 owns
what Marketer7 owns
integration boundaries
legacy compatibility
experiment lifecycle
mission lifecycle
execution contract
evidence model
measurement
evaluation
learning loop
```

Include at least one complete end-to-end example.

Example:

```text
Marketer7:
M1 acquisition
EX-021 challenge framing

↓

Signal7:
creates LinkedIn asset
reviews
publishes/logs

↓

Marketer7:
collects analytics
5 activated testers

↓

evaluation:
WIN

↓

learning:
challenge framing works better

↓

next experiment:
test same positioning in Facebook accountant groups
```

---

# IMPLEMENTATION STRATEGY

Use Hyper7 adaptive workflow.

Suggested parts:

```text
P1 — Inspect current Signal7 architecture and legacy data contracts
P2 — Define Marketer7 architecture and execution interface
P3 — Implement Marketer7 core state + missions + experiments
P4 — Add Signal7 optional experiment metadata with backwards compatibility
P5 — Implement measurement/evaluation/learning loop
P6 — Add integration contract + fixtures
P7 — Verify legacy Signal7 regression suite
P8 — Documentation + final architecture review
```

Adjust after inspecting the actual repositories.

Do NOT code against assumptions from this prompt if the repository contradicts them.

Inspect:

```text
Signal7 README
AGENTS.md
skills/
schemas
fixtures
tests
publish ledger
task state
parsers
validators
existing Hyper7 conventions
```

before committing to design.

---

# NON-NEGOTIABLES

1. Signal7 existing files remain backwards compatible.
2. No forced migration of legacy Signal7 projects.
3. New experiment metadata in Signal7 is optional.
4. Marketer7 owns experiments and growth strategy.
5. Signal7 owns marketing asset execution.
6. Publishing does not equal experiment completion.
7. Evaluation requires evidence.
8. Missing evidence must remain unknown.
9. Vanity metrics cannot override primary KPI.
10. Historical decisions and experiment outcomes remain auditable.
11. Persist state to disk using human-readable Markdown/YAML.
12. Multi-session resume must work.
13. Avoid unnecessary framework complexity.
14. Reuse Hyper7/Signal7 conventions when they already solve the problem.
15. Do not duplicate Signal7 content-generation workers inside Marketer7.

---

# DEFINITION OF DONE

The work is done only when:

* Marketer7 exists as an installable/useable Agent Skills workflow;
* a user can create and resume a growth mission;
* experiments are persisted;
* experiments have measurable hypotheses and pre-declared evaluation criteria;
* experiment review/gates work;
* Signal7 can receive an experiment-aware execution brief;
* Signal7 can create/review/publish assets with optional experiment metadata;
* old Signal7 files work unchanged;
* no forced migration occurs;
* Marketer7 can persist evidence and metrics;
* Marketer7 evaluates WIN / LOSS / INCONCLUSIVE correctly;
* learning updates the active mission route;
* historical experiment evidence remains inspectable;
* tests/evals cover legacy + new paths;
* docs clearly explain ownership boundaries;
* final Hyper7 verification passes.

---

# FIRST ACTION

Start a new Hyper7 adaptive loop.

Before implementation:

1. inspect Signal7 thoroughly;
2. inspect Hyper7 conventions relevant to state, gates, memory, handoff, and adaptive loops;
3. identify all existing Signal7 file formats that may require backwards compatibility;
4. identify current parsers/validators/schema assumptions;
5. pressure-test whether Marketer7 should reuse any Signal7 infrastructure versus remain fully independent;
6. produce a concrete architecture and compatibility plan;
7. explicitly list legacy behaviors that must not regress;
8. only then request approval for implementation.

Do not start by creating files blindly.

The most important risks are architectural overlap and breaking existing Signal7 project files.
