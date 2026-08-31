---
name: marketer-mission
description: Creates, resumes, and records the durable strategic state of one Marketer7 growth mission.
---

# Mission phase

Use only after the `marketer` router has bootstrapped `.marketer/` and allocated a unique `M<N>` ID. Read `../marketer/reference/bootstrap.md`, `data-model.md`, `ownership.md`, and `memory.md` first.

## Write ownership

Write only `missions/M<N>-<slug>/mission.md`. The router allocates IDs and applies state routing; this skill never creates an experiment, rewrites evidence, calls an executor, or changes a future Analyzer7 record.

## Create or resume

For a new mission, copy the mission template and record a concrete business outcome, decisive primary KPI, time horizon, owner, known baseline or unknown-baseline rationale, initial route, and evidence digest. Do not claim a metric baseline without a source.

For a resumed mission, read its experiment index, current route, route decisions, and relevant memory. Report its active experiments and the next legal experiment action. Do not replace historical route decisions with a summary.

## Verdict

Return `ready` only if the goal and primary KPI are meaningful enough to frame a measurable experiment. Otherwise return `needs_input` with the missing mission field. Return `blocked` when a requested change belongs to Signal7, Analyzer7, Business7, or an unauthorized external system.
