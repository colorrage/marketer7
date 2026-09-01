---
schema_version: 1
id: M1
title: Improve qualified trial signups
status: active
owner: fixture-owner
created_at: 2026-08-01T00:00:00Z
primary_kpi: qualified_signups
primary_kpi_priority: decisive
primary_kpi_tier: signup
baseline_status: known
---

# M1 — Improve qualified trial signups

## Goal

Increase weekly qualified signups using evidence-linked experiments.

## Why

Qualifying trial signups is the current acquisition constraint and determines whether lifecycle changes deserve further investment.

## KPIs

| Role | Metric | Business-value tier | Notes |
| --- | --- | --- | --- |
| Primary (decisive) | qualified_signups | signup | Weekly qualified trial registrations. |
| Secondary (explanatory) | open_rate | engagement | Explains email reach; cannot reverse the signup verdict. |

## Baseline

80 qualified signups in the prior seven days from `metrics/baselines.md#BL-001`.

## Definition of done

Record a source-linked experiment verdict and a route decision for the next acquisition test.

## Constraints

- Fixture state only; it cannot claim production causality.
- Signal7 may execute the email but cannot evaluate the experiment.

## Current route

Use a lifecycle email for recently activated trial users.
