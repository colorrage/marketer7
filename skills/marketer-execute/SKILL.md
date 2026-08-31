---
name: marketer-execute
description: Creates a versioned execution brief or factual manual execution record for an approved Marketer7 experiment.
---

# Execution phase

Read `../marketer/reference/ownership.md`, `state-graph.md`, `gates.md`, and `contract-versioning.md`. Work only when the router has confirmed `approved`, a passing `review.md`, and a non-null `criteria_locked_at`.

## Write ownership

Write `execution.md` and, when Signal7 is the authorized executor, `contracts/signal7-execution-brief.md`. These are execution-phase artifacts. The router applies `approved → running` or `running → measurement_pending` only from the returned factual gate verdict.

## Procedure

1. Recheck the approved experiment definition against its review; reject any difference in locked criteria.
2. For an authorized manual run, record exact action, actor, time, source reference, and completion/failure facts in `execution.md`.
3. For Signal7, render the versioned brief template with IDs, scope, allowed/forbidden claims, stop conditions, and optional tracking. It is a file handoff only: do not create or edit `.signal/`.
4. Record execution events as facts. An executor's completion or publication is not a measurement or experiment verdict.

## Outcome

Return `ready` with a brief path when execution is prepared, `complete` only for a factual execution record, or `blocked`/`needs_input` with the missing approval, authorization, or source reference. No live external action occurs without explicit user authority.
