---
name: marketer-review
description: Independently reviews a planned Marketer7 experiment and produces the persisted pre-action gate verdict.
---

# Review and pre-action phase

Read `../marketer/reference/data-model.md`, `evaluation-policy.md`, `state-graph.md`, and `gates.md`. Accept only an experiment currently routed as `planned` with a complete `experiment.md`.

## Write ownership

Write only `experiments/EX-<NNN>-<slug>/review.md`. The router alone records lifecycle status and the criteria-lock timestamp in `experiment.md` after a pass verdict. Never alter the hypothesis, thresholds, audience, claims, or tracking to make a review pass.

## Review procedure

Independently check the falsifiable hypothesis, baseline/unknown-baseline rationale, primary KPI and declared business-value tier, numeric and non-overlapping thresholds, measurement window, tracking, evidence-strength plan, executor scope, claims boundaries, stop conditions, and goalpost protection.

Record each check and any blocking/advisory finding in the review template. On a pass, copy the normalized experiment definition from `## Hypothesis` through immediately before `## Criteria lock` verbatim into the template's `Locked definition snapshot` fenced block, then record its SHA-256 fingerprint in `criteria_fingerprint`. The snapshot and fingerprint make every later field change comparable to the reviewed state. Then run `node scripts/validate-marketer-state.mjs .marketer --phase review --experiment EX-<NNN>`. A non-zero result is `blocked`; do not request a lifecycle transition. Unsupported claims, missing tracking, unclear metric comparability, a missing threshold, an ambiguous snapshot, or an attempted post-hoc criterion change fail the pre-action gate.

## Outcome

Return `pass`, `needs_input`, `blocked`, or `fail` with the review path. On `pass`, request the router to record `reviewed → approved`, set `criteria_locked_at`, and append a governance decision. On any other verdict, request return to `draft`; no execution may start.
