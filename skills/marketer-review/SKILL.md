---
name: marketer-review
description: Independently reviews a planned Marketer7 experiment and produces the persisted pre-action gate verdict.
---

# Review and pre-action phase

Read `../marketer/reference/data-model.md`, `state-graph.md`, and `gates.md`. Accept only an experiment currently routed as `planned` with a complete `experiment.md`.

## Write ownership

Write only `experiments/EX-<NNN>-<slug>/review.md`. The router alone records lifecycle status and the criteria-lock timestamp in `experiment.md` after a pass verdict. Never alter the hypothesis, thresholds, audience, claims, or tracking to make a review pass.

## Review procedure

Independently check the falsifiable hypothesis, baseline/unknown-baseline rationale, primary KPI, numeric and non-overlapping thresholds, measurement window, tracking, executor scope, claims boundaries, stop conditions, and goalpost protection.

Record each check and any blocking/advisory finding in the review template. On a pass, record the SHA-256 fingerprint of the normalized experiment definition from `## Hypothesis` through immediately before `## Criteria lock`; this makes a later criterion change detectable. Unsupported claims, missing tracking, unclear metric comparability, a missing threshold, or an attempted post-hoc criterion change fail the pre-action gate.

## Outcome

Return `pass`, `needs_input`, `blocked`, or `fail` with the review path. On `pass`, request the router to record `reviewed → approved`, set `criteria_locked_at`, and append a governance decision. On any other verdict, request return to `draft`; no execution may start.
