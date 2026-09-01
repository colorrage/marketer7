---
schema_version: 1
experiment_id: EX-<NNN>
status: not_started
verdict: null
evaluated_at: null
primary_metric: <metric and unit>
primary_value: unknown
criteria_locked_at: <timestamp copied from experiment.md>
evidence_strength: unknown
---

# Evaluation — EX-<NNN>

## Primary-KPI comparison

| Item | Locked value | Observed value | Comparison | Result |
| --- | --- | --- | --- | --- |
| Success threshold | <threshold/operator> | unknown | not_evaluable | unknown |
| Failure threshold | <threshold/operator> | unknown | not_evaluable | unknown |

The verdict is based on this table alone. Secondary metrics may explain, never replace, the primary-KPI result.

## Verdict

`not_started` — replace only with `win`, `loss`, or `inconclusive` after measurement. Use `cancelled` only when the experiment was explicitly cancelled before a normal evaluation.

## Evidence strength, confidence, and confounders

- Evidence strength: unknown (the weakest cited primary-evidence grade; grade E cannot support a numeric result)
- Conclusion confidence: unknown
- Confounders: <known external changes, missing tracking, or `unknown`>
- Causality claim: no causal conclusion from this record alone.

## Learning

- Learned: <supported lesson or `unknown`>
- Not learned: <what remains unknown>

## Route recommendation

Recommend continue, iterate, reroute, or stop. This is not a mission-route change until a separate decision is appended.

## Gate verdict

Verdict: needs_input

Actor: <actor>

At: <ISO-8601 timestamp>

Checked artifacts: `experiment.md`, `measurement.md`, `evidence.md`

Reasons:

- Evaluation has not started.
