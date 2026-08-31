---
schema_version: 1
experiment_id: EX-<NNN>
status: not_reviewed
reviewed_at: null
reviewer: <reviewer>
criteria_fingerprint: null
---

# Review — EX-<NNN>

## Planning checks

| Check | Result | Evidence | Finding |
| --- | --- | --- | --- |
| Falsifiable hypothesis | needs_input | `experiment.md` | <finding> |
| Primary KPI and baseline | needs_input | `experiment.md` | <finding> |
| Thresholds and window | needs_input | `experiment.md` | <finding> |
| Tracking source | needs_input | `experiment.md` | <finding> |
| Claims and executor scope | needs_input | `experiment.md` | <finding> |
| Goalpost protection | needs_input | `experiment.md` | <finding> |

## Findings

- <severity: blocking / advisory> — <finding>

## Gate verdict

Verdict: needs_input

Actor: <reviewer>

At: <ISO-8601 timestamp>

Checked artifacts: `experiment.md`

Reasons:

- Review has not yet occurred.

## Decision

On `pass`, store the SHA-256 fingerprint of the normalized `## Hypothesis` through `## Criteria lock` portion of `experiment.md` in `criteria_fingerprint`. This review then authorizes a router-applied `reviewed → approved` transition and criteria lock. On any other verdict, return the experiment to `draft` for material repair; do not edit past evidence or execute work.
