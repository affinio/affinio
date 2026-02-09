# DataGrid Vue Advanced Entrypoint

Updated: `2026-02-08`

This document defines the explicit advanced namespace for power-user hooks in `@affino/datagrid-vue`.

## Entrypoint

- `@affino/datagrid-vue/advanced`

## Advanced Surface

- `useDataGridViewportBridge`
- `useDataGridHeaderOrchestration`
- `createDataGridHeaderBindings`
- `useDataGridCellPointerDownRouter`
- `useDataGridCellPointerHoverRouter`
- `useDataGridDragSelectionLifecycle`
- `useDataGridDragPointerSelection`
- `useDataGridFillSelectionLifecycle`
- `useDataGridRangeMoveLifecycle`
- `useDataGridRangeMoveStart`
- `useDataGridTabTargetResolver`
- `useDataGridCellNavigation`
- `useDataGridInlineEditorKeyRouter`
- `useDataGridHeaderContextActions`
- `useDataGridHeaderSortOrchestration`
- `useDataGridHeaderResizeOrchestration`
- `useDataGridContextMenuAnchor`
- `useDataGridContextMenuActionRouter`
- `useDataGridViewportContextMenuRouter`
- `useDataGridViewportBlurHandler`
- `useDataGridGlobalPointerLifecycle`
- `useDataGridPointerAutoScroll`
- `useDataGridPointerPreviewRouter`
- `useDataGridPointerCellCoordResolver`
- `useDataGridAxisAutoScrollDelta`
- `useDataGridCellVisibilityScroller`
- `useDataGridGlobalMouseDownContextMenuCloser`
- `useDataGridKeyboardCommandRouter`
- `useDataGridRowSelectionFacade`
- `useDataGridFindReplaceFacade`
- `useDataGridClipboardBridge`
- `useDataGridClipboardMutations`
- `useDataGridIntentHistory`

## Boundary Rule

- Root/stable entrypoint (`@affino/datagrid-vue`, `@affino/datagrid-vue/stable`) must not export advanced hooks.
- Advanced entrypoint is for integrators who intentionally opt into lower-level orchestration APIs.

## Contract Guards

- `/Users/anton/Projects/affinio/packages/datagrid-vue/src/__tests__/advancedApi.contract.spec.ts`
- `/Users/anton/Projects/affinio/packages/datagrid-vue/src/__tests__/publicApi.contract.spec.ts`
