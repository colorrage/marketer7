---
name: marketer-measure
description: Appends source-linked experiment observations and records normalized measurement without fabricating missing data.
---

# Evidence and measurement phase

Read `../marketer/reference/data-model.md`, `evaluation-policy.md`, `state-graph.md`, `gates.md`, and `ownership.md`. Use after the router has routed the experiment to `measurement_pending`, or to append factual evidence while it is running.

## Write ownership

Write only `evidence.md`, `measurement.md`, and an external reference under `contracts/` when needed. Do not alter the experiment definition, review, execution facts, terminal verdict, mission route, or external canonical evidence.

## Procedure

1. Append each local/manual observation with an entry ID, observed time, source reference, metric, value/unit or `unknown`, period, evidence strength A–E, quality, and limitations. Never overwrite an entry. Grade E records a model assumption only: it may be contextual evidence but cannot be cited for a numeric primary value.
2. For Analyzer7 input, find pending references with `node scripts/list-analyzer-exports.mjs <project-root>`. Copy the listed `external-evidence-reference/v1` into the experiment's `contracts/`, validate it, and cite it as an external source rather than copying the provider's canonical evidence.
3. Normalize only observations whose source entry IDs are retained. Record full/partial/no coverage of the locked window. A numeric primary value requires one or more matching primary-metric entries graded A–D; retain `unknown` when the available support is only grade E.
4. If the primary value is missing, retain `unknown`, record why, and return a measurement gate that permits only an uncertainty-aware evaluation. Before returning `ready` or requesting `measurement_pending → evaluating`, run `node scripts/validate-marketer-state.mjs .marketer --phase measure --experiment EX-<NNN>`. A non-zero result is `blocked`; do not request the transition.

## Outcome

Return `ready` for a complete primary-metric measurement, or `needs_input` with explicit unknown/missing coverage. Ask the router to apply `measurement_pending → evaluating` only after `measurement.md` records coverage and its gate verdict.
