# Marketer7

Marketer7 is a disk-backed Agent Skills workflow for turning growth goals into measurable experiments, recording evidence, and learning what to do next.

It owns strategy and experiment evaluation. It can prepare a versioned execution brief for Signal7, but it does not produce content, publish, or treat publication as experiment success.

## Status

The core workflow, package static-contract check, and deterministic behavioral fixture harness are implemented. Signal7 now offers the compatible, file-based `signal7-execution-brief/v1` bridge on its isolated integration branch; see [the integration guide](docs/signal7-integration.md). Laravel/UI projection remains intentionally deferred.

## Runtime state

Install the skills into a project and let `marketer` keep all operational state under that project's `.marketer/` directory. See [the router skill](skills/marketer/SKILL.md) and its references for the state model and gates.

An empty `.marketer/` root with `project.md` is valid before the first mission or experiment. Once a lifecycle begins, the retained baseline, funnel, and memory records become required so later evaluations stay reproducible.

## Experiment integrity

- A passing review stores an immutable snapshot of the definition it approved. Before execution, a material definition change returns the experiment to planning and review.
- After recorded execution, only an explicitly authorized success/failure threshold correction may be applied. The correction records old and new values, review and replacement fingerprints, and a linked governance decision; changes to audience, hypothesis, metric, KPI tier, tracking, or window remain blocked.
- A numeric primary result must cite source-linked A–D evidence for the experiment's locked primary metric. Grade E is a model assumption: it may add context but cannot supply a numeric result or a win/loss verdict.
- Signal7 publication and executor results are evidence inputs, never an experiment verdict. Legacy Signal7 artifacts remain valid when they omit Marketer metadata.

## Local verification

Run the static package contract check and behavioral state fixtures from this repository:

```sh
node scripts/validate-marketer-package.mjs
node scripts/run-marketer-fixtures.mjs
```

The behavioral harness includes a complete local lifecycle, a fresh-root case, and adversarial attempts to alter locked criteria or overstate evidence.

## Non-goals for v1

- Live analytics, ad-platform, SEO, or publishing adapters.
- Signal7 content-worker duplication or direct edits to `.signal/`.
- Laravel/UI changes.
- Replacing Analyzer7 as the canonical observability/evidence source.
