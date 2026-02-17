---
"@affino/datagrid-orchestration": patch
---

## Summary

Stabilized DataGrid runtime behavior and release-readiness updates in orchestration-adjacent flows, including managed wheel scroll handling refinements and quality gate alignment for release.

## User impact

Consumers of `@affino/datagrid-orchestration` get a patch-level update with improved runtime consistency and no intended breaking API changes.

## Migration

- No migration required.

## Validation

- quality gates: `pnpm run quality:max` passed
- benchmark/performance gates: `pnpm run bench:regression` passed (including tree-workload gate)
