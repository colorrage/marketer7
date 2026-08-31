# Contract versioning

Boundary files declare a stable `contract` identifier and `schema_version`. Version 1 contracts are Markdown/YAML documents that can be passed by path and inspected by a human.

| Contract | Producer | Consumer | Rule |
| --- | --- | --- | --- |
| `signal7-execution-brief/v1` | Marketer7 execution phase | Signal7 integration | execution scope only; optional metadata; no direct state writes |
| `external-evidence-reference/v1` | external provider or Marketer7 reference phase | Marketer7 evidence phase | reference/provenance only; canonical source remains external |

Consumers must reject an unknown major contract version with a clear `blocked` verdict. They must tolerate missing optional fields and unknown additive fields. A breaking meaning or required-field change needs a new `/v<N>` contract; never reinterpret a prior contract silently.
