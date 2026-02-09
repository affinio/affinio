# DataGrid Vue Demo Acceptance Matrix (Must-Pass)

Baseline date: `2026-02-08`  
Status: `frozen-v1` (see `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-contract-freeze-v1.md`)  
Scope: parity between demo contract and `@affino/datagrid-vue` integration layer  
Contract source: `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-canonical-behavior-contract.md`

This matrix defines blocking acceptance criteria for migration from demo-first implementation to package adapter runtime.

## Blocking Rule

- Every row in this matrix is `MUST PASS`.
- Any single failure blocks parity sign-off for `@affino/datagrid-vue`.
- A matrix row may be closed only with automated coverage (preferred) or explicit temporary waiver.
- Temporary waiver requires owner + expiration date and is valid for one release window only.

## Acceptance Matrix

| ID | Area | Canonical Contract Ref | Must-Pass Behavior | Validation Mode | Coverage Source | Fail Condition |
| --- | --- | --- | --- | --- | --- | --- |
| DG-VUE-PARITY-001 | Selection | Section 1.2 | Click sets `anchor=focus=active` on target data cell | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Any mismatch in active-cell/selection indicators |
| DG-VUE-PARITY-002 | Selection | Section 1.2 | `Shift+click` extends range from existing anchor | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Range not extended from original anchor |
| DG-VUE-PARITY-003 | Selection | Section 1.2 | Drag selection extends continuously while pointer moves | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Selection stalls/skips cells under drag |
| DG-VUE-PARITY-004 | Selection | Section 1.3 | Keyboard nav (`arrows/tab/home/end/page`) updates active cell deterministically | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Unexpected active cell position drift |
| DG-VUE-PARITY-005 | Selection | Section 1.3 | `Escape` clears selection state | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Selection state remains non-empty after `Escape` |
| DG-VUE-PARITY-006 | Fill Handle | Section 2.1 | Fill handle visible only on range-end cell | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Handle appears on non-range-end cells |
| DG-VUE-PARITY-007 | Fill Handle | Section 2.1/2.2 | Fill preview updates on pointer move and edge auto-scroll | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Preview not updating during drag/edge-scroll |
| DG-VUE-PARITY-008 | Fill Handle | Section 2.2 | Apply repeats source pattern and touches only editable columns | e2e + unit | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/components/__tests__/overlayFillHandle.contract.spec.ts` | Non-editable cells mutated or pattern broken |
| DG-VUE-PARITY-009 | Inline Edit | Section 3.1 | Double click starts inline edit only for editable columns | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Non-editable columns enter edit mode |
| DG-VUE-PARITY-010 | Inline Edit | Section 3.1/3.2 | Enum trigger opens select mode without breaking active-cell state | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Active-cell/edit-state desync |
| DG-VUE-PARITY-011 | Inline Edit | Section 3.2 | `Enter` commit / `Escape` cancel / `Tab` commit+move | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Wrong commit/cancel semantics |
| DG-VUE-PARITY-012 | Inline Edit | Section 3.2 | `blur` and scroll commit active edit | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Lost edits or stale editor after scroll/blur |
| DG-VUE-PARITY-013 | Pinning/Layering | Section 4.1 | Pinned columns stay fixed during horizontal scroll | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Pinned cell position drifts on horizontal scroll |
| DG-VUE-PARITY-014 | Pinning/Layering | Section 4.2 | Pinned cells mask scroll overlays beneath them | e2e + visual | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Overlay rendered above pinned layer |
| DG-VUE-PARITY-015 | Virtualization | Section 5 | Window metric reflects visible row range under long sessions | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Window metric stuck/incorrect under scroll |
| DG-VUE-PARITY-016 | Virtualization | Section 5 | Empty state appears only for empty filtered dataset | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Empty state visible with non-empty dataset |
| DG-VUE-PARITY-017 | Determinism | Section 6 | No page errors during long vertical/horizontal sessions | e2e | `/Users/anton/Projects/affinio/tests/e2e/datagrid.regression.spec.ts` | Any `pageerror` during scenario |
| DG-VUE-PARITY-018 | Determinism | Section 6 | Repeated no-delta updates keep stable visible output | unit/contract | `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/__tests__/selectionOverlayTransform.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/components/__tests__/overlayRenderer.spec.ts` | Output changes with no state delta |

## Execution Gate

- Focused parity gate: `pnpm run test:e2e:datagrid:parity`
- Primary command: `pnpm run test:e2e:critical`
- Supporting strict contracts: `pnpm run test:datagrid:strict-contracts`
- Quality lock gate: `pnpm run quality:lock:datagrid`

Parity for migration steps `05` and `08` is accepted only when this matrix is green end-to-end.

## Waiver Template (Temporary)

- Matrix ID:
- Owner:
- Reason:
- Expiration date:
- Replacement test/contract ETA:
