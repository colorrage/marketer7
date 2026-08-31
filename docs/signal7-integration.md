# Marketer7 and Signal7 integration

Marketer7 can delegate bounded execution to Signal7 without sharing a runtime state directory. Marketer7 remains responsible for mission strategy, hypotheses, approval, primary KPI thresholds, evidence interpretation, evaluation, and rerouting. Signal7 remains responsible for assets, brand/claims review, publication, and factual executor-side records.

## Handoff

For an approved experiment, `marketer-execute` renders `contracts/signal7-execution-brief.md` using `signal7-execution-brief/v1`. The handoff includes only:

- `source_system: marketer7`, mission ID, experiment ID, and `executor: signal7`;
- requested action, audience, channel, stop conditions, and allowed/forbidden claims;
- optional tracking metadata.

The operator supplies the brief path when starting a new Signal7 task. Signal7's internal `signal-marketer` bridge validates the contract, retains a bounded task-local snapshot, and then continues the normal Signal7 brief, creation, review, and publish gates. Neither system writes the other's state root.

## Return path

For Marketer-originated Signal tasks, Signal7 records optional origin metadata on the task, newly generated assets, and new publish-ledger rows. It also maintains task-local `execution-result.md` with `signal7-execution-result/v1` and append-only factual event rows. A result associates Signal task/asset/status/timestamp/tracking/publication URL when known; it contains no performance metric and does not mark the experiment successful.

Marketer7 can add this execution result as source-linked evidence, then separately run measurement and evaluation against its locked criteria. A missing result or metric remains unknown.

## Compatibility and UI

The contract is feature-detected: legacy Signal7 task, asset, and ledger files with none of the new fields remain valid and are not migrated. The current implementation changes only Agent Skills, Markdown/YAML templates, documentation, and static fixtures. Laravel/UI projection is deliberately deferred in [FUTURE.md](../FUTURE.md).

## Local verification

Run the Marketer harness from this repository:

```sh
node scripts/run-marketer-fixtures.mjs
```

Run Signal7's integration and legacy regression suite from the clean Signal7 worktree:

```sh
scripts/run-signal-fixtures.sh
```
