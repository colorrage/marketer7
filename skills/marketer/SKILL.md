---
name: marketer
description: Starts or resumes growth missions and experiment workflows with durable disk state, explicit gates, evidence-driven evaluation, and safe executor delegation.
---

# Marketer7 router

Use this skill when the user wants to create, resume, inspect, plan, review, run, measure, evaluate, learn from, or reroute a growth experiment.

## Read first

- `reference/bootstrap.md` for project-state setup and ID allocation.
- `reference/data-model.md` for the authoritative `.marketer/` artifacts.
- `reference/state-graph.md` and `reference/gates.md` before changing any status.
- `reference/evaluation-policy.md` before classifying KPI value or evidence strength.
- `reference/ownership.md` before delegating execution or accepting outside evidence.
- `reference/memory.md` before recording durable lessons.
- `reference/contract-versioning.md` before creating an executor or external-evidence contract.

## Router contract

The router owns mission-level routing, state discovery, and user-facing gate verdicts. It does not write phase artifacts that belong to a specialized phase skill, silently rewrite historical evidence, or call external platforms.

1. Discover or bootstrap `.marketer/` using `reference/bootstrap.md`.
2. Resolve the requested mission (`M<N>`) and, when relevant, experiment (`EX-<NNN>`). Allocate IDs globally; never reuse an archived ID.
3. Read the experiment state and required gate artifact. Route only to the phase that can produce the next legal transition.
4. After a phase returns a valid gate verdict, validate the proposed resulting `.marketer/` state with `node scripts/validate-marketer-state.mjs .marketer` before recording the legal experiment status/lock transition requested by `reference/state-graph.md`. A non-zero result is `blocked`: leave the transition unapplied and retain the phase artifact and errors for repair. On success, leave the phase's substantive artifact untouched. Append a decision when the transition approves, cancels, terminates, changes a mission route, or approves a criteria override.
5. Return a concise verdict: `ready`, `needs_input`, `blocked`, or `complete`, with the exact artifact/path that supports it.
6. For execution, generate or hand over an explicit versioned brief. An executor result becomes evidence, not an evaluation.

## Hard stops

- Do not approve or execute an experiment lacking a falsifiable hypothesis, primary KPI, baseline or explicit unknown baseline, numerical success and failure thresholds, measurement window, and tracking plan.
- Do not reinterpret locked criteria after results appear. A passed review must retain its canonical locked-definition snapshot and matching fingerprint. Before execution, send a changed criterion back through planning and review. After recorded execution completion, only an explicitly user-authorized, approved `criteria-overrides/CO-<NNN>.md` may change success/failure thresholds; validate its decision, snapshot-backed delta, fingerprints, and exact table values before using it.
- Do not treat a model assumption as a measured result. Grade-E evidence may provide context, but cannot supply a numeric primary measurement or a terminal verdict.
- Do not call an outside system unless the user has explicitly authorized it. v1 records manual/local evidence only.
- Do not change Signal7, Laravel, or UI code from this skill.

Internal phase and management skills are documented in their own `SKILL.md` files. They share this state contract but have narrower write ownership.
