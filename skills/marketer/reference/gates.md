# Gate protocol

Every gate records a markdown section named `Gate verdict` with one of `pass`, `needs_input`, `blocked`, or `fail`, its timestamp, reviewer/actor, checked artifact paths, and reasons. A gate never deletes or edits prior evidence.

## Planning gate

Permit `draft → planned` only when the experiment definition is falsifiable and contains a primary KPI, baseline/unknown-baseline rationale, numerical success and failure thresholds, tracking plan, measurement window, audience, action, and executor scope.

## Review and pre-action gate

Permit `reviewed → approved` only when planning passes and the review confirms:

- The hypothesis is measurable from the stated tracking source.
- The threshold direction/operator is unambiguous, primary KPI is decisive, and its business-value tier is declared from `evaluation-policy.md`.
- Claims are allowed, supported, and bounded for the executor.
- Execution scope, stop conditions, and manual fallback are explicit.
- No criteria are being retrofitted to a desired result, and the canonical locked-definition snapshot matches its recorded review fingerprint.

Record failures in the review artifact and return to `draft` for material repair. `approved` writes `criteria_locked_at`.

## Measurement gate

Permit evaluation only after `measurement.md` cites observations for the locked window or explicitly declares that the primary metric is unknown/missing. Unknown evidence may lead to `inconclusive`; it cannot be converted to a win or loss by guesswork. A numeric primary result must cite A–D graded evidence for the declared primary metric; grade E is a model assumption and cannot supply a numeric result. Lower-value or secondary evidence cannot substitute for it.

## Evaluation gate

Permit a terminal verdict only after evaluation compares the primary metric to the locked thresholds, reports data quality/confounders, records both learning and what remains unknown, and states the weakest cited primary-evidence grade. A route recommendation requires a separate mission decision before it alters `mission.md`.

## Post-execution threshold override gate

After `execution.md` records completion, success/failure thresholds remain locked unless the user explicitly authorizes a correction. Permit only a new immutable `criteria-overrides/CO-<NNN>.md` whose current definition matches the review snapshot after threshold normalization, whose complete Locked/Replacement table matches the snapshot/current values, and which records allowed changed fields, reason, actor, approver, completion timestamp, prior/replacement fingerprints, and a linked append-only governance decision. Any missing, mismatched, duplicate, or unapproved override is blocked. Other locked-definition fields always require a new draft/review cycle.
