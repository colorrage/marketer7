---
name: marketer-experiment
description: Plans one falsifiable Marketer7 experiment and validates its locked evaluation criteria before review.
---

# Experiment planning phase

Read `../marketer/reference/data-model.md`, `state-graph.md`, and `gates.md` before acting. Use only for a router-resolved `M<N>` and unique `EX-<NNN>`.

## Write ownership

Create or update only `experiments/EX-<NNN>-<slug>/experiment.md` while its status is `draft`. The router owns ID allocation and applies the requested lifecycle transition after this skill returns its verdict. Do not write `review.md`, execution/evidence/measurement/evaluation artifacts, mission routing, or executor state.

## Required planning work

1. Copy the experiment template and make the hypothesis falsifiable: action, defined audience, channel, expected direction/amount, primary KPI, and measurement window.
2. Set the executor scope, allowed/forbidden claims, stop conditions, ordered secondary metrics, tracking source, and baseline. A baseline may be `unknown` only with a reason and a plan for interpreting that limitation.
3. Set numerical success and failure thresholds with clear operators. They must be non-overlapping and comparable to the same primary metric/window.
4. Record a planning gate verdict. Missing, vague, non-numeric, or retrofitted criteria are `needs_input` or `fail`, never silently repaired from guesswork.

## Outcome

Return a structured verdict with the experiment path, status requested (`planned` only on a passing definition), required next artifact (`review.md`), and every missing/invalid field. Do not set `criteria_locked_at`; only the approval gate does that.
