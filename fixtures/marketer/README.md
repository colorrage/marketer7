# Marketer7 deterministic fixtures

Run the local harness from the repository root:

```sh
node scripts/run-marketer-fixtures.mjs
```

The runner first runs the package static-contract check, then copies `valid-lifecycle/` or the minimal `fresh-root/` into a fresh temporary directory for each behavioral case. It applies a narrowly scoped mutation for negative and alternate-state cases, validates the temporary `.marketer/` state, checks the expected pass/fail verdict and error fragment, and removes only that temporary directory.

`valid-lifecycle/` is an audited end-to-end local example: mission → planned → reviewed → approved → running → measurement pending → evaluating → win. It includes source-linked metrics, memory, channel knowledge, a reusable process recipe, and the exact review-time definition snapshot. Its values are fixtures, not analytics or causal evidence. The harness derives phase-gate states, payment-versus-stated-willingness cases, and explicit criteria overrides from this canonical state, including adversarial attempts to hide audience, metric, hypothesis, or tier changes. `fresh-root/` proves that a newly bootstrapped project is valid before its first lifecycle state. The Signal7 brief and Analyzer7 reference demonstrate only versioned file shapes; no external system is contacted or modified.
