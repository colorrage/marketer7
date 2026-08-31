---
schema_version: 1
experiment_id: EX-001
status: passed
reviewed_at: 2026-08-02T09:00:00Z
reviewer: fixture-reviewer
criteria_fingerprint: ed4e66af596e683f1e936eff63a8e1749aac2ca5a74e00c1fe7f0730fd74f2c7
---

# Review — EX-001

## Planning checks

| Check | Result | Evidence | Finding |
| --- | --- | --- | --- |
| Falsifiable hypothesis | pass | `experiment.md` | Concrete audience, action, and KPI. |
| Primary KPI and baseline | pass | `experiment.md` | Primary KPI is decisive. |
| Thresholds and window | pass | `experiment.md` | Numeric thresholds share a unit. |
| Tracking source | pass | `experiment.md` | Fixture export is retained locally. |
| Claims and executor scope | pass | `experiment.md` | Claims boundary is explicit. |
| Goalpost protection | pass | `experiment.md` | Fingerprint is recorded. |

## Findings

- advisory — Fixture values are not causal evidence.

## Gate verdict

Verdict: pass

Actor: fixture-reviewer

At: 2026-08-02T09:00:00Z

Checked artifacts: `experiment.md`

Reasons:

- All pre-action checks pass.
