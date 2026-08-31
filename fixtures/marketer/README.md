# Marketer7 deterministic fixtures

Run the local harness from the repository root:

```sh
node scripts/run-marketer-fixtures.mjs
```

The runner first validates the skill package, then copies `valid-lifecycle/` into a fresh temporary directory for each case. It applies a narrowly scoped mutation for negative and alternate-state cases, validates the temporary `.marketer/` state, checks the expected pass/fail verdict and error fragment, and removes only that temporary directory.

`valid-lifecycle/` is an audited end-to-end local example: mission → planned → reviewed → approved → running → measurement pending → evaluating → win. Its values are fixtures, not analytics or causal evidence. The Signal7 brief and Analyzer7 reference demonstrate only versioned file shapes; no external system is contacted or modified.
