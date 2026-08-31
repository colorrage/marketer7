# Future updates

## Signal7 UI integration

Status: deferred. The Marketer7 core workflow and file-based harness now pass; begin this milestone only with explicit UI scope approval.

Scope for that later milestone:

- Surface Signal7's optional `source_system`, `mission_id`, `experiment_id`, and `tracking` metadata in the Laravel UI.
- Add experiment-aware filtering and navigation where it improves operator workflow.
- Preserve compatibility with legacy Signal7 tasks, assets, and publish-ledger entries that do not have the new metadata.
- Add UI-specific tests only after the file-based Agent Skills contract is proven by the harness.

This remains explicitly out of scope for the current Marketer7 v1 implementation. No Laravel/UI files change until a dedicated, approved UI milestone begins.
