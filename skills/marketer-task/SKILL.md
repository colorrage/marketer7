---
name: marketer-task
description: Lists, creates, defers, resumes, cancels, and reports durable Marketer7 mission state.
---

# Mission management

Read `../marketer/reference/bootstrap.md`, `data-model.md`, `state-graph.md`, and `gates.md`. Use this user-facing management skill for mission status, not for experiment planning or evaluation.

## Write ownership

This skill may update the operational status/frontmatter and current-route index of `missions/M<N>-<slug>/mission.md` and append a reasoned entry to `.marketer/decisions.md`. It must not alter experiment definitions, phase artifacts, evidence, measurements, or terminal experiment verdicts.

## Operations

- **List/status:** Read-only. Report mission ID, title, status, decisive KPI, active experiments, latest evaluation, and next legal action.
- **Create:** Request router/bootstrap allocation of a new `M<N>` before using `marketer-mission` to create its artifact.
- **Defer/resume:** Record actor, reason, timestamp, and a next legal step. Deferring a mission does not cancel its experiments.
- **Cancel:** Require an explicit user reason. Retain every artifact and append an immutable decision. If active experiments must stop, route each through its own explicit cancellation record.
- **Close:** Require all experiments to be terminal or explicitly deferred and a final route decision.

Return `complete` for a successful status operation, `needs_input` for a missing reason or target, and `blocked` if a request would bypass an experiment gate.
