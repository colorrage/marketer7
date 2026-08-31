# Marketer7

Marketer7 is a disk-backed Agent Skills workflow for turning growth goals into measurable experiments, recording evidence, and learning what to do next.

It owns strategy and experiment evaluation. It can prepare a versioned execution brief for Signal7, but it does not produce content, publish, or treat publication as experiment success.

## Status

The core workflow and deterministic 16-case harness are implemented. Signal7 now offers the compatible, file-based `signal7-execution-brief/v1` bridge on its isolated integration branch; see [the integration guide](docs/signal7-integration.md). Laravel/UI projection remains intentionally deferred.

## Runtime state

Install the skills into a project and let `marketer` keep all operational state under that project's `.marketer/` directory. See [the router skill](skills/marketer/SKILL.md) and its references for the state model and gates.

## Non-goals for v1

- Live analytics, ad-platform, SEO, or publishing adapters.
- Signal7 content-worker duplication or direct edits to `.signal/`.
- Laravel/UI changes.
- Replacing Analyzer7 as the canonical observability/evidence source.
