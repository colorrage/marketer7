---
schema_version: 1
id: EX-001
mission_id: M1
title: Lifecycle email for activated trial users
status: win
owner: fixture-owner
created_at: 2026-08-01T00:00:00Z
criteria_locked_at: 2026-08-02T09:00:00Z
reviewed_at: 2026-08-02T09:00:00Z
approved_at: 2026-08-02T09:01:00Z
cancelled_at: null
cancellation_reason: null
---

# EX-001 — Lifecycle email for activated trial users

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

## Criteria lock

Criteria were locked after the recorded review.

## Gate verdict

Verdict: pass

Actor: fixture-reviewer

At: 2026-08-02T09:01:00Z

Checked artifacts: `review.md`

Reasons:

- Measurable definition approved.

## Change history

- 2026-08-01T00:00:00Z — created as draft.
