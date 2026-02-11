# DataGrid Vue Sugar Idealization Pipeline

Updated: `2026-02-11`  
Scope: `@affino/datagrid-vue` (`useAffinoDataGrid`, `useAffinoDataGridUi`, `AffinoDataGridSimple`)  
Goal: sugar should cover practical AG/Sheets baseline scenarios without forcing users to drop into internal demo orchestration.

## Coverage Audit (Current)

### Implemented (good)
- Row selection model (`features.selection`) with stable row identity contract.
- Row clipboard flows (`copy/cut/paste/clear`) via sugar action API.
- Inline cell editing (`features.editing`) with commit hook.
- Sort model (`sortState`, `toggleColumnSort`, `clearSort`).
- Filter model + advanced expression setter (`features.filtering.setAdvancedExpression`).
- Tree/group controls (`features.tree` groupBy/expand/collapse).
- Selection summary (`features.summary`) via core summary API.
- Column visibility toggles (`features.visibility`).
- Basic header/cell context-menu bindings.

### Partially implemented (risky/confusing)
- Context actions include `filter` / `auto-size` ids, but action runner marks them as unmapped.
- Clipboard is row-oriented in sugar path, while internal demo is range/cell-oriented.
- Transactions exist in runtime, but sugar does not expose first-class undo/redo UX helpers.

### Missing vs internal demo parity (must close)
- Cell range selection model (anchor/focus/ranges) in sugar API.
- Fill handle and range move flows in sugar API.
- Excel-like keyboard navigation primitives (cell-level, not row-level only).
- Auto row-height controls (`fixed/auto`, measure/re-measure) in sugar API.
- Drag-drop reorder API (column reorder UX helper; row reorder helper policy).
- Pagination convenience API in sugar (`pageSize/currentPage/snapshot`).
- Full column-state roundtrip helpers (`order/visibility/width/pin` apply/restore).
- Advanced filter builder helpers (set/date presets, add/replace set flow).

## Execution Rules
- Close strictly from `S1` to `S10`.
- Each step needs proof (`e2e` or visual + contract test).
- No “hidden internal only” behavior for sugar-documented features.

## Pipeline (Simple -> Complex)

- [x] `S1` Expose missing core-native controls in sugar API.
Scope:
- Pagination wrappers.
- Column-state wrappers (`order/pin/width/visibility` + snapshot apply).
- Transaction wrappers (`undo/redo/canUndo/canRedo`).
Proof:
- Unit/contract test for `useAffinoDataGrid` API surface.
- README/playbook examples compile and run.
Exit:
- Integrator can use these flows without direct `grid.api.*` calls.
Comment:
- Implemented in `useAffinoDataGrid` via new sections: `pagination`, `columnState`, `history`.
- `AffinoDataGridSimple` now forwards `filtering/summary/visibility/tree` feature inputs (parity fix for sugar surface).

- [x] `S2` Row-height sugar contract.
Scope:
- `features.rowHeight` (`mode`, `base`, `setMode`, `setBase`, `measureVisible`).
- Deterministic no-op on runtimes without viewport row-height capability.
Proof:
- Contract tests for capability detection and method wiring.
- Visual demo toggle fixed/auto + measure behavior.
Exit:
- Auto row-height is first-class in sugar.
Comment:
- Added `features.rowHeight` sugar API with capability detection (`supported`) and deterministic no-op fallback.
- Methods available: `setMode`, `setBase`, `measureVisible`, `apply`.

- [x] `S3` Context-action completeness.
Scope:
- Map `filter` and `auto-size` actions in sugar action runner.
- Add clear message contract for unsupported contexts.
Proof:
- Action-runner tests for all action ids.
- Context-menu e2e for header filter/auto-size.
Exit:
- No “unmapped action” paths for documented menu items.
Comment:
- `auto-size` mapped to deterministic width estimation + `setColumnWidth`.
- `filter` mapped with explicit unsupported-context messages (missing column, feature disabled, no UI handler, handler rejected).
- Removed generic “unmapped action” fallback for these actions in sugar runner.

- [x] `S4` Column drag-reorder sugar helper.
Scope:
- Provide drag bindings for column reorder in sugar bindings.
- Keep behavior deterministic with pinned columns.
Proof:
- E2E: drag reorder + persistence through snapshot roundtrip.
Exit:
- Column reorder works without custom orchestration.
Comment:
- Added `bindings.headerReorder(columnKey)` sugar binding.
- `bindings.headerCell(columnKey)` now includes reorder events (`dragstart/dragover/drop/dragend`) and keyboard reorder (`Alt+Shift+ArrowLeft/ArrowRight`).
- Reorder applies through `setColumnOrder` and remains compatible with column-state snapshot roundtrip.

- [x] `S5` Row reorder sugar helper (client model).
Scope:
- Provide explicit reorder API and drag binding policy.
- Deterministic transaction logging for reorder.
Proof:
- Contract tests for reorder + rollback.
- E2E scenario with grouped/filtered guards.
Exit:
- Row reorder available in sugar with predictable constraints.
Comment:
- Added `rowReorder` sugar API: `supported`, `canReorder`, `reason`, `moveByIndex`, `moveByKey`.
- Added `bindings.rowReorder(row, rowIndex)` with drag-drop and keyboard (`Alt+Shift+ArrowUp/ArrowDown`).
- Reorder writes through transaction-aware `replaceRows` with intent `rows-reorder` and deterministic `affectedRange`.
- Guard policy enforced in sugar: reorder disabled when non-client row model, active group-by, or active filter model.

- [x] `S6` Cell-range selection feature for sugar.
Scope:
- Add cell anchor/focus/ranges model and bindings.
- Keep row selection backward-compatible.
Proof:
- E2E: mouse drag + Shift navigation metrics.
- Contract tests for deterministic snapshots.
Exit:
- Sugar supports range-centric spreadsheet interaction baseline.
Comment:
- Core wiring implemented in `useAffinoDataGrid` (`cellSelection` API + `bindings.cellSelection` + keyboard nav bridge + snapshot sync).
- Added contract coverage in `useAffinoDataGrid.contract.spec.ts` for anchor/focus/range + `setCellByKey(..., { extend: true })`.
- Verified green by full test pass (user confirmation).

- [x] `S7` Range-engine clipboard/fill/move in sugar.
Scope:
- Cell-range copy/paste/cut/clear.
- Fill-handle preview/apply.
- Range move intent.
Proof:
- E2E regression bundle (copy/paste/cut/fill/move).
- Transaction history restore pass.
Exit:
- Sugar reaches internal demo parity for core spreadsheet interactions.
Comment:
- Added `cellRange` sugar API in `useAffinoDataGrid`: `copy/paste/cut/clear`, preview state (`copiedRange/fillPreviewRange/rangeMovePreviewRange`), and apply methods (`applyFillPreview`, `applyRangeMove`).
- Wired through orchestration primitives (`useDataGridClipboardBridge`, `useDataGridClipboardMutations`, `useDataGridRangeMutationEngine`) with intent-transaction recording and row-flow fallback in action runner.
- Added contract coverage in `useAffinoDataGrid.contract.spec.ts` for copy/cut/paste/clear + fill preview/apply + range-move preview/apply.
- Verified green by full test pass (user confirmation).

- [x] `S8` Advanced filter UX helpers.
Scope:
- Helper APIs for set/date/text numeric compositions.
- Add/replace set-filter mode helpers.
Proof:
- Contract tests for AST output determinism.
- Visual demo scenario for Excel-like set filter.
Exit:
- Complex filtering usable without manual AST building.
Comment:
- Added `features.filtering.helpers` in `useAffinoDataGrid` with typed builders and mutators:
  - `condition`, `and`, `or`, `not`, `apply`, `clearByKey`
  - `setText`, `setNumber`, `setDate`, `setSet` (`valueMode`: `replace|append|remove`, `mergeMode`: `replace|merge-and|merge-or`)
- Updated sugar playbook with helper-driven examples.
- Verified green by full test pass (user confirmation).

- [x] `S9` Perf + stability lock for sugar path.
Scope:
- Bench + e2e stress for sugar-heavy paths.
- Ensure no recursion/reactivity regressions.
Proof:
- `bench:datagrid:harness:ci` green.
- `quality:perf:datagrid` green.
- Critical e2e bundle green.
Exit:
- Sugar path meets same stability floor as internal demo.
Comment:
- Added targeted scripts in `/Users/anton/Projects/affinio/package.json`:
  - `test:datagrid:sugar:contracts`
  - `test:e2e:datagrid:sugar`
  - `quality:gates:datagrid:sugar`
- Verified green by full test pass (user confirmation).

- [x] `S10` Docs/junior DX finalization.
Scope:
- 60-second sugar guide updated to real feature set.
- “When to use sugar vs advanced/internal” decision chart.
Proof:
- Docs reviewed against exported API and examples.
Exit:
- Junior can integrate feature-complete table without reading internal demo code.
Comment:
- Updated `/Users/anton/Projects/affinio/packages/datagrid-vue/README.md` with current sugar surface (`rowHeight`, `pagination`, `columnState`, `history`, `rowReorder`, `cellSelection`, `cellRange`, filtering helpers).
- Updated `/Users/anton/Projects/affinio/docs/datagrid-vue-sugar-playbook.md` with advanced-filter helpers and API tier guidance.
- Verified green by full test pass (user confirmation).
