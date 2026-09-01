# Bootstrap and ID allocation

All operational state is project-local:

```text
.marketer/
  project.md
  context.md
  decisions.md
  backlog.md
  memory.md
  metrics/
    baselines.md
    funnel.json
  channels/
  recipes/
  handoffs/
  retros/
  missions/M<N>-<slug>/mission.md
  experiments/EX-<NNN>-<slug>/
    experiment.md
    review.md
    execution.md
    evidence.md
    measurement.md
    evaluation.md
    criteria-overrides/
    contracts/
```

Create the root only after the user starts Marketer7 work in that project. Copy the corresponding files from `../templates/`; do not store live state in this repository.

`project.md` contains the canonical counters `next_mission_id` and `next_experiment_id`. Allocate the next number by inspecting every current and archived mission/experiment directory before incrementing the counter. IDs are never reused, including after cancellation or archival.

Create an experiment directory and its six lifecycle files together. Empty files are still explicit records: `review.md`, `evidence.md`, `measurement.md`, and `evaluation.md` must say `not_recorded` or `unknown` rather than being inferred from absence.

An empty root containing `project.md` is valid before any mission or experiment exists. Create `backlog.md`, `memory.md`, `decisions.md`, `metrics/baselines.md`, and `metrics/funnel.json` when the first mission or experiment lifecycle begins; after that point they are required operational state, not optional omissions. Create empty `channels/` and `recipes/` directories; channel and recipe files are optional, schema-versioned reusable knowledge. Create an empty `criteria-overrides/` directory with each experiment. Handoffs go in `handoffs/`; retrospectives go in `retros/`; both are append-only snapshots and never replace mission or experiment history.
