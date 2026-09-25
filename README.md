# Marketer7

Marketer7 is a disk-backed Agent Skills workflow for turning a business goal into measurable experiments, retaining source-linked evidence, and deciding what to learn or do next. It owns strategy, experiment criteria, measurement interpretation, evaluation, learning, and rerouting.

It can prepare a versioned handoff for Signal7, but it does not write content, publish to a channel, or treat publication as experiment success.

## What is shipped

`README.md` is the source of truth for shipped capabilities.

| Capability | Status |
| --- | --- |
| Project-local `.marketer/` state, missions, experiments, decisions, reusable channel knowledge, recipes, memory, handoffs, and retros | Shipped |
| Experiment lifecycle: planning, independent review, execution record, evidence, measurement, evaluation, and rerouting recommendation | Shipped |
| Immutable review snapshot and governed post-execution threshold correction | Shipped |
| Source-linked A–E evidence strength and threshold-based `win`, `loss`, or `inconclusive` evaluation | Shipped |
| File-based `signal7-execution-brief/v1` handoff and optional Signal7 origin metadata | Shipped |
| Static package checks, full-state validation, and deterministic behavioral fixtures | Shipped |
| Live analytics, ad-platform, SEO, CMS, or publishing adapters | Not shipped |
| Laravel/UI projection | Deferred; see [FUTURE.md](FUTURE.md) |
| Analyzer7 as an independent evidence provider | Shipped as file contracts (`external-evidence-reference/v1`, `analyzer-opportunity/v1`) plus a read-only pending-exports helper; canonical state remains in `.analyzer/` |

## Install for Codex

Marketer7 is an Agent Skills package, not an application server or a shell CLI. Its repository-local installer discovers every folder under `skills/` that contains `SKILL.md`, then creates safe symlinks for them.

```sh
git clone https://github.com/colorrage/marketer7.git
cd marketer7
bash .claude/skills/install-marketer/scripts/install.sh install
```

By default, the installer uses every supported agent location whose parent directory already exists:

| Directory | Agent |
| --- | --- |
| `~/.claude/skills/` | Claude Code |
| `~/.codex/skills/` | Codex |
| `~/.agents/skills/` | agent-common |
| `~/.pi/agent/skills/` | PI |

Use these commands from the repository checkout:

```sh
# Show whether every shipped skill is linked, absent, or owned elsewhere.
bash .claude/skills/install-marketer/scripts/install.sh status

# Remove only links that point back to this checkout.
bash .claude/skills/install-marketer/scripts/install.sh uninstall

# Install or refresh again after updating the checkout.
bash .claude/skills/install-marketer/scripts/install.sh install
```

The installer never replaces an existing file, directory, or link to another source. `uninstall` leaves those entries alone too. Because installed skills are symlinks, updating this checkout makes the new skill content available without copying or a separate upgrade command.

For an isolated target, such as a test agent directory, provide an explicit colon-separated list of absolute paths:

```sh
MARKETER_INSTALL_TARGETS=/path/to/agent-skills \
  bash .claude/skills/install-marketer/scripts/install.sh install
```

### Manual Codex fallback

If you intentionally want to manage only Codex links yourself, use the following non-overwriting setup. Run it only when none of the Marketer7 skill names already exists in `~/.codex/skills/`.

```sh
mkdir -p ~/.codex/skills
ln -s "$(pwd)"/skills/* ~/.codex/skills/
```

After installation, start with `/marketer` in the project where you want the operational state stored. Do not create live state inside this repository.

## Core concepts

| Concept | Meaning |
| --- | --- |
| **Mission** | Durable strategic goal with a decisive KPI, business-value tier, baseline, constraints, and current route. Mission IDs are `M<N>`. |
| **Experiment** | One falsifiable test for a mission, with its own audience, action, primary metric, thresholds, tracking plan, and measurement window. Experiment IDs are `EX-<NNN>`. |
| **Primary KPI** | The one locked metric that decides the experiment outcome. Secondary metrics may explain the result but cannot reverse it. |
| **Evidence** | Append-only observations with source, period, metric, data quality, and evidence strength. Missing data is `unknown`, never zero. |
| **Gate** | A persisted `pass`, `needs_input`, `blocked`, or `fail` decision that must exist before the next legal lifecycle transition. |
| **Decision** | An append-only record of approval, cancellation, reroute, or other governance action. |

## Runtime state

All live state belongs in the consuming project's `.marketer/` directory:

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

An empty root containing `project.md` is valid before the first mission or experiment. Once a lifecycle begins, `memory.md`, `metrics/baselines.md`, and `metrics/funnel.json` are required operational records. IDs are globally monotonic and never reused, including after cancellation or archival.

## How to invoke Marketer7

These are Agent Skill prompts typed into your agent chat, not shell commands. Angle brackets mean text you provide; square brackets mean optional text. The agent reads the project state and routes work to the next legal phase.

### Main workflow

| Prompt form | Use it for |
| --- | --- |
| `/marketer <goal>` | Start work, bootstrap `.marketer/` if needed, or route a stated goal to the next legal mission/experiment action. |
| `/marketer Continue mission M<N>` | Resume a mission using its route, experiment index, decisions, and relevant memory. |
| `/marketer Continue experiment EX-<NNN>` | Resume an experiment from its persisted lifecycle state and open gate. |
| `/marketer Plan an experiment for M<N>: <hypothesis and intended action>` | Start a falsifiable experiment definition; the router allocates the next `EX-<NNN>`. |
| `/marketer Measure EX-<NNN> from <source>` | Record source-linked observations and normalize the primary result or explicit `unknown`. |
| `/marketer Evaluate EX-<NNN>` | Compare the recorded primary value to the locked thresholds and request `win`, `loss`, or `inconclusive`. |

The router invokes lifecycle phase skills itself. Do not skip planning, review, execution, measurement, or evaluation by treating a phase skill as a standalone approval command.

### Mission and knowledge management

| Prompt form | Result |
| --- | --- |
| `/marketer-task list` | List missions with status, decisive KPI, active experiments, latest evaluation, and next legal action. |
| `/marketer-task status M<N>` | Show one mission's current strategic state and next legal action. |
| `/marketer-task Create a mission: <business goal>` | Allocate a mission ID and create the durable mission record through the router. |
| `/marketer-task defer M<N> because <reason>` | Preserve the mission and its experiments while recording a reasoned pause. |
| `/marketer-task resume M<N>` | Record resumption and report the next legal action. |
| `/marketer-task cancel M<N> because <reason>` | Retain history, append a decision, and separately route any active experiment through explicit cancellation. |
| `/marketer-task close M<N>` | Close only after every experiment is terminal or deferred and a final route decision exists. |
| `/marketer-backlog Add idea: <title>; why: <reason>; evidence: <source or unknown>` | Capture an uncommitted growth idea without authorizing an experiment. |
| `/marketer-backlog list` | List uncommitted ideas. |
| `/marketer-backlog promote B<N>` | Mark an idea promoted and start normal mission or experiment planning; promotion is not approval or execution. |
| `/marketer-backlog close B<N> because <reason>` | Retain an idea as `declined`, `superseded`, or `tested`. |
| `/marketer-recipe Create recipe: <title>` | Record a reusable process with prerequisites, evidence requirements, constraints, and provenance. |
| `/marketer-recipe list` | List reusable growth-process recipes and status. |
| `/marketer-recipe update RCP-<NNN> because <reason>` | Append a dated, provenance-linked revision instead of replacing prior process history. |
| `/marketer-recipe retire RCP-<NNN> because <reason>` | Retain the recipe while recording why it is no longer active. |
| `/marketer-memory Record lesson from EX-<NNN>: <lesson>` | Add a sparse, provenance-linked lesson only when evaluated evidence supports it. |
| `/marketer-handoff M<N>` or `/marketer-handoff EX-<NNN>` | Write a resumption snapshot without changing lifecycle state. |
| `/marketer-retro M<N>` | Write an evidence-linked retrospective without revising historical verdicts. |

### Exceptional threshold correction

Use `/marketer-criteria-override EX-<NNN>` only after recorded execution completion and explicit user authorization. It may correct only `success_threshold` and/or `failure_threshold`; it cannot rewrite the hypothesis, audience, action, primary metric, KPI tier, baseline interpretation, tracking, or measurement window. The record must retain old and replacement values, review and replacement fingerprints, approval, and a linked decision.

## Mission and experiment lifecycle

Start with a mission: a concrete business outcome, why it matters, one decisive KPI and its business-value tier, supporting KPIs, a known or explicitly unknown baseline, definition of done, constraints, and current route.

Each experiment then follows exactly this path:

```text
draft -> planned -> reviewed -> approved -> running -> measurement_pending -> evaluating
                                                                  |              |
                                                                  v              v
                                                              cancelled    win | loss | inconclusive
```

`cancelled`, `win`, `loss`, and `inconclusive` are terminal. A cancellation needs a recorded time and reason; it never erases prior work.

| Transition | What must be true |
| --- | --- |
| `draft -> planned` | The definition is falsifiable and names the audience, action, executor, primary KPI and tier, baseline or unknown-baseline rationale, numerical success/failure thresholds, window, tracking, claims, and stop conditions. |
| `planned -> reviewed -> approved` | Independent review passes, the exact reviewed definition is copied into the immutable snapshot, the snapshot fingerprint matches, and `criteria_locked_at` is recorded. |
| `approved -> running -> measurement_pending` | A manual factual record or authorized execution brief exists. Execution completion/publication is not a performance result. |
| `measurement_pending -> evaluating` | `measurement.md` covers the locked window or explicitly records why the primary value is `unknown`. |
| `evaluating -> win|loss|inconclusive` | Evaluation compares only the locked primary value to the locked thresholds and records evidence strength, confidence, learning, unknowns, and route recommendation. |

The persisted gate is the authority at every step. If it is `needs_input`, supply the missing information; if it is `blocked` or `fail`, repair the named artifact rather than forcing a status change.

## Evidence, metrics, and evaluation

The primary KPI is decisive. Its business-value tier is declared for every experiment:

`payment` -> `willingness_to_pay` -> `retention` -> `activation` -> `signup` -> `click` -> `engagement` -> `impression` -> `other`

A lower-value or secondary metric can explain why something happened but cannot turn a failed primary KPI into a win.

| Grade | Meaning | Can supply a numeric primary value? |
| --- | --- | --- |
| A | Observed behavior, such as payment, product usage, or conversion | Yes |
| B | Direct qualitative evidence, such as a recorded interview | Yes |
| C | Survey or stated intention | Yes, only when it matches the locked primary metric |
| D | Engagement signal, such as a reaction or impression | Yes, only when it matches the locked primary metric |
| E | Model assumption or hypothesis | No — contextual only |

Every numeric primary value cites one or more source entries for the locked primary metric. The evaluation records the weakest cited A–D grade. Grade E cannot supply a numeric primary value, `win`, or `loss`; when the result is absent or non-comparable, preserve `unknown` and evaluate as `inconclusive`.

## Goalpost protection

Before approval, any material change returns the experiment to planning and review. After execution, thresholds remain locked unless a governed correction proves exactly what changed against the review-time snapshot. The correction requires:

- explicit user authorization and approval;
- a completed execution record;
- exactly one immutable criteria-override record;
- both success and failure threshold rows with exact locked and replacement values;
- matching prior/replacement fingerprints; and
- a linked append-only governance decision.

All other criterion changes require a new review cycle. This prevents a result from changing the definition of success after the fact.

## Signal7, Analyzer7, and UI boundaries

| System | Role |
| --- | --- |
| Marketer7 | Strategy, mission/experiment criteria, measurement interpretation, evaluation, learning, and rerouting. |
| Signal7 | Bounded asset execution, claims/brand review, publication, and executor-side factual records. |
| Analyzer7 | Independent observability/evidence provider; its canonical evidence stays in `.analyzer/`. |

For an approved experiment, Marketer7 can create `signal7-execution-brief/v1`. Signal7 may return task-local execution facts, but neither system writes the other's state root. A Signal7 publication or completion record is evidence to measure later; it is never an experiment verdict. See [Signal7 integration](docs/signal7-integration.md) for the complete handoff contract.

Analyzer7 hands over two versioned files in its own `.analyzer/exports/`: `external-evidence-reference/v1` for a measured experiment, and `analyzer-opportunity/v1` for an SEO opportunity that is a backlog candidate. To see what is pending, run:

```sh
node scripts/list-analyzer-exports.mjs <project-root> [--json]
```

The helper is read-only. It rejects unknown contract versions, gives the exact `contracts/` target for each evidence reference, and prints a ready backlog row (keeping the `analyzer7:SEO-OPP-NNN` reference) for each opportunity. Copying a reference and adding a backlog row stay normal Marketer7 actions, through `marketer-measure` and `marketer-backlog`.

Laravel/UI projection is intentionally out of scope until the file-based harness is stable; see [FUTURE.md](FUTURE.md).

## Walkthrough: lifecycle email experiment

The checked fixture is a complete local example, not production analytics or causal evidence.

```text
You: /marketer Create a mission to improve qualified trial signups this quarter.
Marketer7: Creates M1 with qualified_signups as its decisive primary KPI and a signup tier.

You: /marketer Plan an experiment for M1: send a lifecycle email to activated trial users and measure qualified signups for seven days.
Marketer7: Creates EX-001 as draft, asks for the baseline, thresholds, tracking, allowed/forbidden claims, and stop conditions, then requests review.

You: approve the review.
Marketer7: Stores the reviewed-definition snapshot, locks criteria, and allows an authorized execution record or Signal7 brief.

You: /marketer Measure EX-001 from the retained signup export.
Marketer7: Records source-linked evidence and the primary value, or retains unknown coverage if the export cannot answer the metric.

You: /marketer Evaluate EX-001.
Marketer7: Applies the predeclared thresholds to the locked primary KPI and records win, loss, or inconclusive plus what was and was not learned.
```

Read the complete state files in [the deterministic fixture](fixtures/marketer/README.md). They demonstrate the exact mission, experiment, review snapshot, evidence, measurement, evaluation, reusable recipe, channel record, and Signal7/Analyzer7 contract shapes.

## Verification commands

Run these from a Marketer7 repository checkout. The first two validate the package and its behavioral fixture harness; the remaining commands validate a consuming project's `.marketer/` state.

```sh
node scripts/validate-marketer-package.mjs
node scripts/run-marketer-fixtures.mjs
node scripts/validate-marketer-state.mjs <state-root>
node scripts/validate-marketer-state.mjs <state-root> --phase review --experiment EX-001
node scripts/validate-marketer-state.mjs <state-root> --phase measure --experiment EX-001
node scripts/validate-marketer-state.mjs <state-root> --phase evaluate --experiment EX-001
```

`<state-root>` is the project's `.marketer` directory. `--phase` accepts only `review`, `measure`, or `evaluate`; `--experiment EX-<NNN>` is required whenever `--phase` is supplied. A non-zero result is a blocked gate: retain the artifact and repair the reported issue before asking the router to transition state.

## Further reading

- [Signal7 integration](docs/signal7-integration.md) — execution-brief handoff, return evidence, compatibility, and cross-harness verification.
- [Deterministic fixtures](fixtures/marketer/README.md) — runnable lifecycle example and behavioral regression coverage.
- [Data model](skills/marketer/reference/data-model.md) — authoritative artifact ownership and schema rules.
- [Gate protocol](skills/marketer/reference/gates.md) — legal transitions and approval requirements.
- [Evaluation policy](skills/marketer/reference/evaluation-policy.md) — business-value tiers, evidence grades, and threshold-correction rules.
- [Future updates](FUTURE.md) — explicitly deferred UI work.
