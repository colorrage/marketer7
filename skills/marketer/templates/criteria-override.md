---
schema_version: 1
id: CO-<NNN>
experiment_id: EX-<NNN>
status: approved
requested_at: <ISO-8601 timestamp>
approved_at: <ISO-8601 timestamp>
actor: <actor>
approver: <explicit approver>
execution_completed_at: <timestamp copied from execution.md>
changed_fields: [success_threshold]
prior_criteria_fingerprint: <review criteria_fingerprint>
replacement_criteria_fingerprint: <current experiment criteria fingerprint>
decision_id: D-<NNN>
---

# Criteria override — CO-<NNN>

This is an immutable, explicit post-execution exception. It never replaces the original review record. Its rows are checked against the review-time locked-definition snapshot and the current experiment definition.

## Reason and authorization

- Reason: <factual correction reason>
- User authorization: <explicit authorization reference>
- Approval: <approver and timestamp>

## Threshold correction

| Field | Locked value | Replacement value |
| --- | --- | --- |
| Success threshold | <exact value from review snapshot> | <exact current value> |
| Failure threshold | <exact value from review snapshot> | <exact current value> |

List exactly the rows whose values differ in `changed_fields`. Keep both rows even when one threshold is unchanged; its Locked and Replacement values must then be identical.

## Decision linkage

The router must append `D-<NNN>` in `decisions.md` with this override path, experiment ID, fingerprints, approval, and rationale before evaluation uses the replacement threshold.
