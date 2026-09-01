---
name: marketer-criteria-override
description: Records an explicit, approved post-execution threshold correction without erasing the original Marketer7 criteria lock.
---

# Criteria override management

Read `../marketer/reference/data-model.md`, `evaluation-policy.md`, `state-graph.md`, and `gates.md`. Use only after recorded execution completion and only when the user has explicitly authorized correction of a success or failure threshold.

## Write ownership

Write only one new `experiments/EX-<NNN>-<slug>/criteria-overrides/CO-<NNN>.md` from the criteria-override template. Never edit the experiment definition, review fingerprint, evidence, measurement, evaluation, execution record, or a prior override. The router appends the linked governance decision to `.marketer/decisions.md` and validates the resulting state.

## Procedure

1. Read the original review fingerprint, canonical locked-definition snapshot, current criteria fingerprint, execution completion timestamp, and the explicit user authorization. If the passed review has no unambiguous snapshot that matches its fingerprint, return `blocked`.
2. Permit only `success_threshold` and/or `failure_threshold` in `changed_fields`; reject any hypothesis, audience, action, metric, KPI tier, baseline, tracking, or window change. The current definition must match the review snapshot after normalizing only the two threshold values.
3. Complete both threshold rows in the template. Each Locked value must equal the review snapshot and each Replacement value must equal the current definition; `changed_fields` lists exactly the rows whose two values differ.
4. Record the reason, actor, approver, execution-complete timestamp, prior/replacement fingerprints, old/new threshold values, and the decision ID that the router must append.
4. The override is immutable once written. Missing approval, a missing decision, a mismatched fingerprint, or an override before execution completion is `blocked`.

## Outcome

Return `complete` with the override path and required decision ID, or `blocked` with the missing authorization or provenance. This skill never changes a lifecycle status or evaluates an experiment.
