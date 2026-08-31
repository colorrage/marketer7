---
name: marketer-handoff
description: Records a durable Marketer7 handoff for a mission or experiment without changing its lifecycle state.
---

# Handoff management

Read `../marketer/reference/data-model.md`, `state-graph.md`, and `memory.md`. Write only a new `.marketer/handoffs/H-<NNN>-<slug>.md` copied from the handoff template.

## Procedure

Capture the current mission and experiment statuses, latest gates, locked criteria where applicable, exact paths for decision/evidence/evaluation records, open questions, authority boundaries, risks, and one next atomic move. Preserve uncertainty and refer to paths rather than duplicating long histories.

Do not alter mission status, experiment status, criteria, evidence, or memory. The handoff is a snapshot for resumption, not an approval.

Return `complete` with the handoff path or `needs_input` when the target mission cannot be resolved.
