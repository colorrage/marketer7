---
schema_version: 1
experiment_id: EX-001
status: complete
verdict: win
evaluated_at: 2026-08-10T00:02:00Z
primary_metric: qualified_signups
primary_value: 125
criteria_locked_at: 2026-08-02T09:00:00Z
---

# Evaluation — EX-001

## Primary-KPI comparison

| Item | Locked value | Observed value | Comparison | Result |
| --- | --- | --- | --- | --- |
| Success threshold | >= 120 | 125 | pass | win |
| Failure threshold | <= 90 | 125 | fail | not_loss |

## Verdict

The primary KPI meets the locked success threshold.

## Confidence and confounders

- Confidence: medium
- Confounders: Fixture values do not establish causality.
- Causality claim: no causal conclusion from this record alone.

## Learning

- Learned: The fixture route meets its declared success threshold.
- Not learned: Whether this effect generalizes beyond fixture data.

## Route recommendation

Recommend reroute to test this message with a new audience hypothesis.

## Gate verdict

Verdict: pass

Actor: fixture-owner

At: 2026-08-10T00:02:00Z

Checked artifacts: `experiment.md`, `measurement.md`, `evidence.md`

Reasons:

- Primary threshold comparison is complete.
