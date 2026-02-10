# DataGrid Parity Matrix (Cross-Framework)

Updated: `2026-02-10`  
Scope: `@affino/datagrid-core` + `@affino/datagrid-vue` + Laravel Livewire demo bridge  
Status: `in-progress` (матрица считается `green` только после полного `quality:lock:datagrid:parity`)

## Purpose

- Единая матрица parity для всего datagrid стекa (не только Vue demo).
- Единые критерии приемки для core, Vue и Laravel.
- Блокирующий источник истины для релизного sign-off.

## Blocking Rule

- Любой пункт ниже должен быть покрыт автоматической проверкой.
- Любой `fail` в parity gate блокирует релизный lock.
- Временный waiver допускается только с owner + expiry.

## Matrix

| ID | Area | Must-pass behavior | Core | Vue | Laravel | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| DG-PARITY-001 | Row identity + determinism | Stable row identity, deterministic snapshots, no index fallback | required | required | required | `pnpm run test:datagrid:strict-contracts` |
| DG-PARITY-002 | Virtualization + pinning | Pinned left/right remain fixed; scroll window stays deterministic in long sessions | required | required | required | `tests/e2e/datagrid.regression.spec.ts`, `tests/e2e/laravel-datagrid.spec.ts` |
| DG-PARITY-003 | Selection + keyboard nav | Anchor/focus/active semantics deterministic for mouse + keyboard | required | required | required | `tests/e2e/datagrid.interactions.spec.ts`, `tests/e2e/laravel-datagrid-interactions.spec.ts` |
| DG-PARITY-004 | Inline editing | Enter/escape/tab commit rules, no layout drift, editable-only guard | required | required | required | `tests/e2e/datagrid.interactions.spec.ts`, `tests/e2e/laravel-datagrid-interactions.spec.ts` |
| DG-PARITY-005 | Clipboard | Copy/paste/cut matrix behavior with blocked-cell accounting | required | required | required | `tests/e2e/datagrid.regression.spec.ts`, `tests/e2e/laravel-datagrid-interactions.spec.ts` |
| DG-PARITY-006 | Fill + move | Fill-handle and range-move stay stable with virtualized+pinned viewport | required | required | required | `tests/e2e/datagrid.interactions.spec.ts`, `tests/e2e/datagrid.regression.spec.ts`, `tests/e2e/laravel-datagrid-interactions.spec.ts` |
| DG-PARITY-007 | Filtering + sorting | Quick filter + column/advanced filter + sort compose deterministically | required | required | required | `tests/e2e/datagrid.regression.spec.ts`, `tests/e2e/laravel-datagrid.spec.ts` |
| DG-PARITY-008 | Group/tree projection | `filter -> sort -> group/tree -> flatten -> viewport` contract preserved | required | required | optional | core contracts + `tests/e2e/datagrid.regression.spec.ts` |
| DG-PARITY-009 | Summary + visibility | Selection summary + column visibility do not desync selection/projection | required | required | target | core summary contracts + Vue/Laravel interaction checks |
| DG-PARITY-010 | Undo/redo intents | Intent-level history for edit/paste/cut/fill/move works via keyboard and controls | required | required | required | `tests/e2e/datagrid.regression.spec.ts`, `tests/e2e/laravel-datagrid-interactions.spec.ts` |
| DG-PARITY-011 | A11y + context menu | Keyboard entrypoints and menu focus handling remain deterministic | required | required | required | `tests/e2e/datagrid.regression.spec.ts` |
| DG-PARITY-012 | Perf budgets | Bench gates pass for row models + harness CI + regression gate | required | required | required | `pnpm run bench:regression` |

## Parity Lock Command

```bash
pnpm run quality:lock:datagrid:parity
```

## Notes

- Vue-specific canonical behavior remains defined in:
  - `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-canonical-behavior-contract.md`
  - `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-acceptance-matrix.md`
- This matrix is the cross-framework umbrella and release gate source.
