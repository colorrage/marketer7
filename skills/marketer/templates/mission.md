---
schema_version: 1
id: M<N>
title: <short mission title>
status: active
owner: <owner>
created_at: <ISO-8601 timestamp>
primary_kpi: <metric name>
primary_kpi_priority: decisive
primary_kpi_tier: <payment | willingness_to_pay | retention | activation | signup | click | engagement | impression | other>
baseline_status: unknown
---

# M<N> — <short mission title>

## Goal

State the concrete business outcome and time horizon.

## Why

Explain why this outcome matters now and what decision it should inform.

## KPIs

| Role | Metric | Business-value tier | Notes |
| --- | --- | --- | --- |
| Primary (decisive) | <metric> | <tier from evaluation-policy.md> | <unit and interpretation> |
| Secondary (explanatory) | <metric> | <tier or other> | <why it cannot reverse the primary verdict> |

## Baseline

Record the known baseline with source and period, or `unknown` with the reason and interpretation limitation.

## Definition of done

State the business outcome that closes this mission, including the decision/evidence needed.

## Constraints

- <authority, channel, compliance, budget, timing, or evidence constraint>

## Current route

Describe the current strategic route. Change it only through an append-only decision after an evaluation.

## Active hypotheses

- <experiment ID>: <one-line hypothesis> — <status>

## Experiment index

| Experiment | Status | Primary KPI | Evaluation | Path |
| --- | --- | --- | --- | --- |
| EX-<NNN> | draft | <metric> | not_started | `../../experiments/EX-<NNN>-<slug>/` |

## Evidence digest

- <dated, source-linked summary or explicit unknown>

## Route decisions

- <decision ID/date or `none`>
