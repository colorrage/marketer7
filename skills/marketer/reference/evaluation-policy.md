# Evaluation policy

## Business-value tiers

Every decisive primary KPI declares one tier. The rank is conceptual business value, not a hardcoded metric name, so custom metrics remain valid when their tier and rationale are explicit.

| Rank | Tier | Examples |
| --- | --- | --- |
| 1 | `payment` | revenue, paid conversion, collected payment |
| 2 | `willingness_to_pay` | price acceptance, committed purchase intent |
| 3 | `retention` | renewal, retained active account |
| 4 | `activation` | completed meaningful first-use event |
| 5 | `signup` | qualified registration |
| 6 | `click` | tracked click-through |
| 7 | `engagement` | reply, reaction, comment |
| 8 | `impression` | delivered reach or view |
| custom | `other` | named metric with an explicit business-value rationale |

The locked primary KPI determines `win`, `loss`, or `inconclusive`. A lower-value tier cannot make a higher-value primary KPI successful. For example, engagement cannot turn a failed activation experiment into a win. A metric classified as `other` remains decisive only for its own declared experiment and never silently substitutes for a named tier.

## Evidence strength

Every evidence entry cited for a numeric measurement has one grade:

| Grade | Meaning | Examples |
| --- | --- | --- |
| A | observed behavior | payment, product usage, conversion |
| B | direct qualitative evidence | recorded interview or direct user statement |
| C | survey or stated intention | survey response, preference poll |
| D | engagement signal | likes, comments, impressions |
| E | model assumption or hypothesis | forecast, unobserved assumption |

Evidence strength says how direct the observation is; it is not causal certainty. An evaluation records the weakest grade among its cited primary-metric entries separately from conclusion confidence and confounders. Only cited A–D entries whose metric matches the declared primary metric may supply a numeric primary value. Grade E records a model assumption or hypothesis and can provide context only; it cannot supply a numeric primary value, a `win`, or a `loss`. Other entries remain explanatory context.

## Threshold corrections

Before execution, changed criteria return to draft and review. After recorded execution completion, only success/failure thresholds may change and only through the explicit immutable override defined in `gates.md`. The original review fingerprint is retained forever; an override never erases it.
