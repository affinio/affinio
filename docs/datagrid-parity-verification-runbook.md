# DataGrid Parity Verification Runbook

Updated: `2026-02-09`

Scope:

- Vue datagrid parity (frozen contract)
- Laravel datagrid parity wiring smoke

## Single Command

```bash
pnpm run test:e2e:datagrid:parity
```

This runs:

- `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts`
- `/Users/anton/Projects/affinio/tests/e2e/datagrid.interactions.spec.ts`
- `/Users/anton/Projects/affinio/tests/e2e/laravel-datagrid.spec.ts`

## Pass Criteria

1. All tests are green (exit code `0`).
2. No parity-blocking regressions in selection/fill/edit/pin/virtualization flows.
3. Laravel datagrid smoke confirms filter/sort/pin/viewport window/runtime shift behavior.

## Pipeline Mapping

- Closes step `08.2` in:
  - `/Users/anton/Projects/affinio/docs/archive/datagrid/checklists/datagrid-vue-demo-first-refactor-pipeline-checklist.md`
- Enables closing final score of step `08`.
- Unblocks gate-only pending items in steps `10` and `11`.

## CI Mapping

- `test:e2e:datagrid:parity` is the focused local gate.
- `test:e2e:critical` remains broader release regression coverage.
