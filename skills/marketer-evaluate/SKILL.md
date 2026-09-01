---
name: marketer-evaluate
description: Evaluates a measured Marketer7 experiment against its locked primary KPI and records learning without overstating causality.
---

# Evaluation and learning phase

Read `../marketer/reference/data-model.md`, `evaluation-policy.md`, `state-graph.md`, `gates.md`, and `memory.md`. Work only when the router has routed the experiment to `evaluating` and `measurement.md` covers the locked window or explicitly preserves an unknown primary value.

## Write ownership

Write only `evaluation.md`. The router records the terminal experiment status; a mission skill or router writes a separate route decision after evaluation. Never edit locked criteria, evidence entries, measurements, or the mission route.

## Procedure

1. Read the locked primary metric, baseline interpretation, thresholds, and window from `experiment.md`; compare only the recorded primary value from `measurement.md`.
2. Set `win` only if the primary metric meets the locked success threshold, `loss` only if it meets the locked failure threshold, otherwise `inconclusive`. Unknown/partial/non-comparable primary data is `inconclusive`.
3. Record the comparison table, evidence paths, data quality, evidence strength, conclusion confidence, confounders, learning, what was not learned, and a route recommendation. The evaluation strength is the weakest grade among cited primary-metric entries; a grade-E assumption cannot support a numeric value or terminal verdict. Secondary metrics are explanatory only.
4. Before requesting a terminal status, run `node scripts/validate-marketer-state.mjs .marketer --phase evaluate --experiment EX-<NNN>`. A non-zero result is `blocked`; do not request a terminal transition.
5. Do not infer causality from one observation or convert an executor outcome into a result.

## Outcome

Return `complete` with one requested terminal status (`win`, `loss`, or `inconclusive`) and the evaluation path, or `blocked` if locked criteria are absent or tampered with. Recommend a route but do not apply it.
