---
schema_version: 1
experiment_id: EX-<NNN>
status: not_reviewed
reviewed_at: null
reviewer: <reviewer>
criteria_fingerprint: null
---

# Review — EX-<NNN>

## Planning checks

| Check | Result | Evidence | Finding |
| --- | --- | --- | --- |
| Falsifiable hypothesis | needs_input | `experiment.md` | <finding> |
| Primary KPI and baseline | needs_input | `experiment.md` | <finding> |
| KPI tier and evidence plan | needs_input | `experiment.md`, `evaluation-policy.md` | <finding> |
| Thresholds and window | needs_input | `experiment.md` | <finding> |
| Tracking source | needs_input | `experiment.md` | <finding> |
| Claims and executor scope | needs_input | `experiment.md` | <finding> |
| Goalpost protection | needs_input | `experiment.md` | <finding> |

## Findings

- <severity: blocking / advisory> — <finding>

## Locked definition snapshot

On a passing review, replace this block with the exact normalized source from `experiment.md`, starting at `## Hypothesis` and ending immediately before `## Criteria lock`. Preserve its headings, rows, and values verbatim inside this one fenced block.

```markdown
## Hypothesis

<copy the normalized reviewed definition here>
```

## Gate verdict

Verdict: needs_input

Actor: <reviewer>

At: <ISO-8601 timestamp>

Checked artifacts: `experiment.md`

Reasons:

- Review has not yet occurred.

## Decision

On `pass`, copy the normalized reviewed definition into the single `Locked definition snapshot` fence, then store its SHA-256 fingerprint in `criteria_fingerprint` and run the review phase validator. Only a passing validation authorizes a router-applied `reviewed → approved` transition and criteria lock. On any other verdict, return the experiment to `draft` for material repair; do not edit past evidence or execute work.
