# Marketer7 — Agent Instructions

Marketer7 is a skill-based growth strategy and experimentation workflow. Skills live below `skills/`; `README.md` § Status is the source of truth for shipped capabilities.

## State and ownership

- Runtime state belongs in the consuming project's `.marketer/` directory, never in this repository or in a skill directory.
- Marketer7 owns growth missions, hypotheses, experiments, measurement, evaluation, learning, and strategy rerouting.
- Signal7 owns execution assets, brand and claims review, publication, and its own execution evidence. Marketer7 writes a versioned execution brief and never edits `.signal/` directly.
- Analyzer7 is a future independent observability system. Its canonical evidence remains in `.analyzer/`; Marketer7 may retain only a versioned external-evidence reference.

## Working rules

- Use human-readable Markdown/YAML state and preserve append-only decisions and evidence.
- Never advance an experiment without the gate artifact required by the state graph.
- Lock hypothesis, primary KPI, thresholds, and measurement window before approval. A material change requires a new review cycle.
- Preserve uncertainty: missing or weak evidence remains unknown, and secondary/vanity metrics cannot override the primary KPI.
- Keep executor contracts optional and backwards-compatible. Do not add Laravel/UI work until the harness is stable and passing.
