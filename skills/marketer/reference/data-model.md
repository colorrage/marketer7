# Marketer7 data model

Every Marketer7-owned artifact begins with `schema_version: 1` YAML frontmatter. Unknown additional fields are preserved by readers; required fields are never inferred.

| Artifact | Owner | Purpose |
| --- | --- | --- |
| `project.md` | router/bootstrap | project context and globally monotonic ID counters |
| `missions/M<N>-*/mission.md` | mission skill | durable strategic goal, KPI priority, active route, experiment index |
| `experiments/EX-<NNN>-*/experiment.md` | planning/review | immutable-after-approval experiment definition and lifecycle status |
| `review.md` | review | independent planning and pre-action gate findings |
| `execution.md` | execution skill | prepared brief, executor handoff, and factual execution record |
| `evidence.md` | evidence skill | append-only observations and source links |
| `measurement.md` | measurement skill | declared measurement window and normalized result values |
| `evaluation.md` | evaluation skill | primary-KPI verdict, confidence, learning, and reroute recommendation |
| `decisions.md` | router/management | append-only mission and governance decisions |
| `backlog.md` | backlog skill | uncommitted experiment or mission ideas |
| `memory.md` | memory skill | sparse, reusable lessons with provenance |
| `contracts/*.md` | contract creator | versioned boundary documents only |
| `handoffs/*.md`, `retros/*.md` | management skills | durable operational context and evidence-linked reflection |

## Required experiment definition

Before approval, `experiment.md` must contain all of these non-empty fields or explicit `unknown` where allowed:

- `id`, `mission_id`, `status`, `owner`, and `created_at`.
- A falsifiable `hypothesis` expressed as action/audience/expected measurable change.
- `audience`, `channel`, `action_type`, and `executor`.
- `primary_metric` and ordered `secondary_metrics`; the primary metric is decisive.
- `baseline` with a value or `status: unknown` plus the reason it is unknown.
- Numeric `success_threshold` and `failure_threshold`, an operator, and a declared `measurement_window`.
- `tracking` that names what will be observed and how its source is retained.
- `claims` with allowed and forbidden claims for any executor.

At the `approved` transition, set `criteria_locked_at`, record a review decision, and preserve the review's SHA-256 fingerprint of the normalized definition from `## Hypothesis` through immediately before `## Criteria lock`. Any material change to hypothesis, audience, action, primary metric, thresholds, baseline interpretation, tracking, or window resets the experiment to `draft` and requires a new review record.

`cancelled` is a terminal state only when `cancelled_at` and `cancellation_reason` are both recorded. Cancellation preserves every prior lifecycle artifact and does not erase an unfinished measurement or evaluation.

## Evidence discipline

`evidence.md` is append-only. Each observation includes a stable entry ID, observed time, recorder, source kind, source reference, metric, value/unit or `unknown`, period, data quality, and a note. `measurement.md` may normalize cited observations but must retain entry IDs and never invent values. An absent reading is `unknown`, not zero.

## Evaluation discipline

`evaluation.md` compares the recorded primary-metric value with the locked thresholds. It records `win`, `loss`, or `inconclusive`; only explicitly authorized cancellation can produce `cancelled`. Secondary metrics may explain a result but cannot reverse the primary-KPI verdict. The record must distinguish `learning` from `not_learned`, confidence from causality, and a route recommendation from a completed mission reroute.
