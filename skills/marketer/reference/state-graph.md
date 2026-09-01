# Experiment state graph

```text
draft -> planned -> reviewed -> approved -> running -> measurement_pending -> evaluating
                                                                  |              |
                                                                  v              v
                                                              cancelled    win | loss | inconclusive
```

`cancelled`, `win`, `loss`, and `inconclusive` are terminal. A cancellation requires a recorded reason and leaves historical artifacts intact.

| Transition | Required writer | Required durable proof |
| --- | --- | --- |
| `draft → planned` | planning | complete measurable experiment definition |
| `planned → reviewed` | review | review record with independent findings |
| `reviewed → approved` | review/router | pass verdict and `criteria_locked_at` |
| `approved → running` | execution | execution brief or manual execution record |
| `running → measurement_pending` | execution | action completion or measurement-window start record |
| `measurement_pending → evaluating` | measurement | measurement record covering the locked window, or explicit unknown/missing result |
| `evaluating → terminal` | evaluation | threshold comparison, uncertainty, learning, route recommendation |

An approved criteria override after execution completion is not a lifecycle transition. It is a narrow, immutable governance record that changes only declared success/failure thresholds and must be linked to a decision before a subsequent evaluation can use it.

No skill may skip a transition or write a terminal verdict from publication, an executor's success report, or a secondary engagement metric. The mission route may change only through a separate append-only decision after evaluation.
