---
schema_version: 1
experiment_id: EX-001
status: recorded
measurement_window: 2026-08-03T00:00:00Z to 2026-08-09T23:59:59Z
primary_metric: qualified_signups
primary_value: 125
source_entry_ids: [E-001]
recorded_at: 2026-08-10T00:01:00Z
---

# Measurement — EX-001

## Window coverage

The locked window is fully covered by E-001.

## Normalized results

| Metric | Value | Unit | Evidence entries | Quality | Notes |
| --- | --- | --- | --- | --- | --- |
| qualified_signups | 125 | signups | E-001 | medium | Fixture-only value. |

## Gate verdict

Verdict: pass

Actor: fixture-owner

At: 2026-08-10T00:01:00Z

Checked artifacts: `evidence.md`, `experiment.md`

Reasons:

- Primary metric is recorded for the locked window.
