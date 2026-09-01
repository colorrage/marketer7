# Marketer7 data model

Every Marketer7-owned artifact begins with `schema_version: 1` YAML frontmatter. Unknown additional fields are preserved by readers; required fields are never inferred.

| Artifact | Owner | Purpose |
| --- | --- | --- |
| `project.md` | router/bootstrap | project context and globally monotonic ID counters |
| `missions/M<N>-*/mission.md` | mission skill | durable strategic goal, KPI tier, explicit mission constraints, active route, experiment index |
| `experiments/EX-<NNN>-*/experiment.md` | planning/review | immutable-after-approval experiment definition and lifecycle status |
| `review.md` | review | independent planning/pre-action findings plus the immutable reviewed-definition snapshot |
| `execution.md` | execution skill | prepared brief, executor handoff, and factual execution record |
| `evidence.md` | evidence skill | append-only observations and source links |
| `measurement.md` | measurement skill | declared measurement window and normalized result values |
| `evaluation.md` | evaluation skill | primary-KPI verdict, confidence, learning, and reroute recommendation |
| `criteria-overrides/CO-<NNN>.md` | criteria override skill | immutable approved post-execution threshold correction |
| `decisions.md` | router/management | append-only mission and governance decisions |
| `backlog.md` | backlog skill | uncommitted experiment or mission ideas |
| `memory.md` | memory skill | sparse, reusable lessons with provenance |
| `metrics/baselines.md` | router/bootstrap | retained metric baseline records and unknown-baseline rationale |
| `metrics/funnel.json` | router/bootstrap | structured, extensible funnel-stage definitions |
| `channels/*.md` | operator | reusable channel evidence, constraints, and reputation risks |
| `recipes/*.md` | recipe skill | reusable growth process with evidence requirements |
| `contracts/*.md` | contract creator | versioned boundary documents only |
| `handoffs/*.md`, `retros/*.md` | management skills | durable operational context and evidence-linked reflection |

## Required experiment definition

Before approval, `experiment.md` must contain all of these non-empty fields or explicit `unknown` where allowed:

- `id`, `mission_id`, `status`, `owner`, and `created_at`.
- A falsifiable `hypothesis` expressed as action/audience/expected measurable change.
- `audience`, `channel`, `action_type`, and `executor`.
- `primary_metric`, its declared business-value tier from `evaluation-policy.md`, and ordered `secondary_metrics`; the primary metric is decisive.
- `baseline` with a value or `status: unknown` plus the reason it is unknown.
- Numeric `success_threshold` and `failure_threshold`, an operator, and a declared `measurement_window`.
- `tracking` that names what will be observed and how its source is retained.
- `claims` with allowed and forbidden claims for any executor.

At the `approved` transition, set `criteria_locked_at`, record a review decision, and preserve both the review's canonical locked-definition snapshot and its SHA-256 fingerprint of the normalized definition from `## Hypothesis` through immediately before `## Criteria lock`. Before execution, any material change to hypothesis, audience, action, primary metric, KPI tier, thresholds, baseline interpretation, tracking, or window resets the experiment to `draft` and requires a new review record. After recorded execution completion, only success/failure thresholds may change through an immutable, explicitly approved `criteria-overrides/CO-<NNN>.md` with prior/replacement fingerprints, a complete Locked/Replacement table verified against the review snapshot/current definition, and a linked append-only decision.

`cancelled` is a terminal state only when `cancelled_at` and `cancellation_reason` are both recorded. Cancellation preserves every prior lifecycle artifact and does not erase an unfinished measurement or evaluation.

## Evidence discipline

`evidence.md` is append-only. Each observation includes a stable entry ID, observed time, recorder, source kind, source reference, metric, value/unit or `unknown`, period, evidence strength A–E, data quality, and a note. `measurement.md` may normalize cited observations but must retain entry IDs and never invent values. A numeric primary value cites evidence entries for the declared primary metric graded A–D; grade E is a model assumption or hypothesis and may only provide contextual explanation. Lower-value or secondary evidence may explain a result but cannot supply the primary result. An absent reading is `unknown`, not zero.

## Evaluation discipline

`evaluation.md` compares the recorded primary-metric value with the locked thresholds. It records `win`, `loss`, or `inconclusive`; only explicitly authorized cancellation can produce `cancelled`. Its evidence-strength grade is the weakest cited primary-evidence grade and remains separate from conclusion confidence and causality. A grade-E assumption cannot support a numeric primary value or terminal result. Secondary metrics may explain a result but cannot reverse the primary-KPI verdict. The record must distinguish `learning` from `not_learned`, confidence from causality, and a route recommendation from a completed mission reroute.
