# Ownership boundaries

| System | Owns | Does not own |
| --- | --- | --- |
| Marketer7 | missions, hypotheses, experiments, criteria, measurement interpretation, evaluation, learning, rerouting | content production, publishing, source analytics adapters, independent causal/SEO observability |
| Signal7 | asset production, claims/brand review, publication, and executor-side records | growth strategy, experiment approval, threshold evaluation, mission rerouting |
| Analyzer7 (future) | independent SEO/analytics collection, evidence quality, uncertainty, and canonical `.analyzer/` records | Marketer7 mission/experiment lifecycle or content execution |
| Business7 (future) | cross-harness business orchestration and consumption of summaries | rewriting a harness's canonical evidence |

Execution is a file handoff: Marketer7 produces `signal7-execution-brief/v1`; Signal7 may consume it and produce its own result artifact. No Marketer7 skill writes `.signal/`, and no Signal7 skill writes `.marketer/`.

An Analyzer7 record enters Marketer7 only through `external-evidence-reference/v1`. The reference identifies the external artifact and its provenance; it does not copy, transform, or claim ownership of Analyzer7's evidence.
