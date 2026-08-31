# Gate protocol

Every gate records a markdown section named `Gate verdict` with one of `pass`, `needs_input`, `blocked`, or `fail`, its timestamp, reviewer/actor, checked artifact paths, and reasons. A gate never deletes or edits prior evidence.

## Planning gate

Permit `draft → planned` only when the experiment definition is falsifiable and contains a primary KPI, baseline/unknown-baseline rationale, numerical success and failure thresholds, tracking plan, measurement window, audience, action, and executor scope.

## Review and pre-action gate

Permit `reviewed → approved` only when planning passes and the review confirms:

- The hypothesis is measurable from the stated tracking source.
- The threshold direction/operator is unambiguous and primary KPI is decisive.
- Claims are allowed, supported, and bounded for the executor.
- Execution scope, stop conditions, and manual fallback are explicit.
- No criteria are being retrofitted to a desired result.

Record failures in the review artifact and return to `draft` for material repair. `approved` writes `criteria_locked_at`.

## Measurement gate

Permit evaluation only after `measurement.md` cites observations for the locked window or explicitly declares that the primary metric is unknown/missing. Unknown evidence may lead to `inconclusive`; it cannot be converted to a win or loss by guesswork.

## Evaluation gate

Permit a terminal verdict only after evaluation compares the primary metric to the locked thresholds, reports data quality/confounders, and records both learning and what remains unknown. A route recommendation requires a separate mission decision before it alters `mission.md`.
