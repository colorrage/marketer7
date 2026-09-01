---
schema_version: 1
id: EX-<NNN>
mission_id: M<N>
title: <short experiment title>
status: draft
owner: <owner>
created_at: <ISO-8601 timestamp>
criteria_locked_at: null
reviewed_at: null
approved_at: null
cancelled_at: null
cancellation_reason: null
---

# EX-<NNN> — <short experiment title>

## Hypothesis

If we <specific action> for <specific audience> through <channel>, then <primary metric> will <increase/decrease> by <amount> within <measurement window>, compared with <baseline or explicit unknown baseline>.

## Definition

| Field | Value |
| --- | --- |
| Audience | <defined audience> |
| Channel | <channel> |
| Action type | <action> |
| Executor | manual / signal7 / other authorized executor |
| Primary metric | <metric and unit> |
| Primary KPI tier | <tier from evaluation-policy.md> |
| Secondary metrics | <ordered, explanatory only metrics> |
| Baseline | <numeric value and period, or `unknown` plus rationale> |
| Success threshold | <numeric threshold and operator> |
| Failure threshold | <numeric threshold and operator> |
| Measurement window | <start/end or duration, timezone> |
| Tracking | <source, event/query, retention path> |

## Claims and execution scope

### Allowed claims

- <supported claim>

### Forbidden claims

- <claim or category that must not be used>

### Stop conditions

- <condition requiring pause/cancellation>

## Criteria lock

Before approval, record the complete criterion set above. On approval set `criteria_locked_at` in frontmatter and append the review decision below. Before execution, a material change after that lock returns this experiment to `draft`. After recorded execution completion, only the success/failure thresholds may change through an explicitly approved immutable criteria override; it retains both fingerprints and an append-only decision. A `cancelled` terminal state requires both `cancelled_at` and a non-empty `cancellation_reason`.

## Gate verdict

Verdict: needs_input

Actor: <actor>

At: <ISO-8601 timestamp>

Checked artifacts: <paths>

Reasons:

- Definition not yet complete.

## Change history

- <ISO-8601 timestamp> — created as draft.
