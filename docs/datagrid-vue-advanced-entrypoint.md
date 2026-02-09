# DataGrid Vue Advanced Entrypoint

Updated: `2026-02-09`

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
- `useDataGridFillHandleStart`
- `useDataGridRangeMoveLifecycle`
- `useDataGridRangeMoveStart`
- `useDataGridSelectionMoveHandle`
- `useDataGridTabTargetResolver`
- `useDataGridCellNavigation`
- `useDataGridClipboardValuePolicy`
- `useDataGridCellDatasetResolver`
- `useDataGridCellRangeHelpers`
- `useDataGridNavigationPrimitives`
- `useDataGridMutationSnapshot`
- `useDataGridCellVisualStatePredicates`
- `useDataGridRangeMutationEngine`
- `useDataGridA11yCellIds`
- `useDataGridColumnUiPolicy`
- `useDataGridEditableValuePolicy`
- `useDataGridMoveMutationPolicy`
- `useDataGridInlineEditorSchema`
- `useDataGridInlineEditOrchestration`
- `useDataGridInlineEditorTargetNavigation`
- `useDataGridInlineEditorKeyRouter`
- `useDataGridHeaderContextActions`
- `useDataGridCopyRangeHelpers`
- `useDataGridHeaderSortOrchestration`
- `useDataGridHeaderResizeOrchestration`
- `useDataGridHeaderInteractionRouter`
- `useDataGridColumnFilterOrchestration`
- `useDataGridEnumTrigger`
- `useDataGridGroupValueLabelResolver`
- `useDataGridGroupMetaOrchestration`
- `useDataGridGroupBadge`
- `useDataGridGroupingSortOrchestration`
- `useDataGridViewportMeasureScheduler`
- `useDataGridVisibleRowsSyncScheduler`
- `useDataGridColumnLayoutOrchestration`
- `useDataGridSelectionOverlayOrchestration`
- `useDataGridRowsProjection`
- `useDataGridRowSelectionOrchestration`
- `useDataGridRowSelectionInputHandlers`
- `useDataGridVirtualRangeMetrics`
- `useDataGridContextMenuAnchor`
- `useDataGridContextMenuActionRouter`
- `useDataGridViewportContextMenuRouter`
- `useDataGridViewportBlurHandler`
- `useDataGridViewportScrollLifecycle`
- `useDataGridClearSelectionLifecycle`
- `useDataGridGlobalPointerLifecycle`
- `useDataGridPointerAutoScroll`
- `useDataGridPointerPreviewRouter`
- `useDataGridPointerCellCoordResolver`
- `useDataGridAxisAutoScrollDelta`
- `useDataGridCellVisibilityScroller`
- `useDataGridGlobalMouseDownContextMenuCloser`
- `useDataGridKeyboardCommandRouter`
- `useDataGridQuickFilterActions`
- `useDataGridCellCoordNormalizer`
- `useDataGridSelectionComparators`
- `useDataGridPointerModifierPolicy`
- `useDataGridHistoryActionRunner`
- `useDataGridInlineEditorFocus`
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
