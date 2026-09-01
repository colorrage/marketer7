---
schema_version: 1
experiment_id: EX-001
status: passed
reviewed_at: 2026-08-02T09:00:00Z
reviewer: fixture-reviewer
criteria_fingerprint: d9992ca1f120d46bbb78c2b75ab84ec0be0918e45b9170e559ce0c6d7a436de8
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

## Locked definition snapshot

```markdown
## Hypothesis

If we send a lifecycle email to activated trial users through email, then qualified_signups will increase by at least 40 signups within seven days, compared with the prior seven-day baseline.

## Definition

| Field | Value |
| --- | --- |
| Audience | activated trial users in the first 24 hours |
| Channel | email |
| Action type | lifecycle email |
| Executor | signal7 |
| Primary metric | qualified_signups |
| Primary KPI tier | signup |
| Secondary metrics | open_rate, explanatory only |
| Baseline | 80 qualified_signups in the prior seven days |
| Success threshold | >= 120 |
| Failure threshold | <= 90 |
| Measurement window | 2026-08-03T00:00:00Z to 2026-08-09T23:59:59Z |
| Tracking | local fixture export `qualified_signup` grouped by experiment ID |

## Claims and execution scope

### Allowed claims

- Start a trial and configure your workspace.

### Forbidden claims

- Guaranteed revenue outcomes.

### Stop conditions

- Pause on an approved compliance issue.
```

## Gate verdict

Verdict: pass

Actor: fixture-reviewer

At: 2026-08-02T09:00:00Z

Checked artifacts: `experiment.md`

Reasons:

- All pre-action checks pass.
