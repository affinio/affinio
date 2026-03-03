<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  type ComponentPublicInstance,
} from "vue"
import type {
  DataGridColumnPin,
  DataGridRowNode,
} from "@affino/datagrid-vue"
import type { UseAffinoDataGridResult } from "@affino/datagrid-vue"
import { useDataGridManagedWheelScroll } from "@affino/datagrid-vue/advanced"
import {
  isCellInRange,
  isRangeFocusCell,
} from "../../../demo-shared/datagridInteractionEngine.js"

type RowLike = {
  rowId?: string | number
}

interface DataGridSugarDataCellClickPayload {
  rowNode: DataGridRowNode<RowLike>
  rowIndex: number
  columnKey: string
  event: MouseEvent
}

const props = defineProps<{
  grid: UseAffinoDataGridResult<RowLike>
  showPagination?: boolean
  treeTabular?: boolean
  treePrimaryColumnKey?: string
  treeSubtitleColumnKey?: string
  onDataCellClick?: (payload: DataGridSugarDataCellClickPayload) => void
  wheelMode?: "managed" | "native"
  wheelAxisLock?: "off" | "dominant" | "vertical-preferred" | "horizontal-preferred"
  wheelPreventDefaultWhenHandled?: boolean
  wheelMinDeltaToApply?: number
}>()

const grid = computed(() => props.grid)
const showPagination = computed(() => props.showPagination ?? true)
const treeTabular = computed(() => props.treeTabular ?? false)

const visibleColumns = computed(() => {
  const snapshot = grid.value.columnState.snapshot.value
  const byKey = new Map(snapshot.columns.map(column => [column.key, column] as const))
  const ordered = snapshot.order
    .map(key => byKey.get(key))
    .filter((column): column is NonNullable<typeof column> => Boolean(column))
    .filter(column => column.visible)

  const left = ordered.filter(column => column.pin === "left")
  const center = ordered.filter(column => column.pin === "none")
  const right = ordered.filter(column => column.pin === "right")
  return [...left, ...center, ...right]
})

const resolvedTreePrimaryColumnKey = computed(() => {
  const configured = props.treePrimaryColumnKey?.trim()
  if (configured && configured.length > 0) {
    return configured
  }
  return visibleColumns.value.find(column => column.key !== "select")?.key ?? null
})

const resolvedTreeSubtitleColumnKey = computed(() => {
  const configured = props.treeSubtitleColumnKey?.trim()
  if (!configured || configured.length === 0) {
    return null
  }
  return configured
})

const resolveColumnWidth = (columnKey: string, fallbackWidth: number | null | undefined): number => {
  const column = grid.value.columnState.snapshot.value.columns.find(entry => entry.key === columnKey)
  const width = column?.width ?? fallbackWidth ?? 140
  return Math.max(84, Math.round(width))
}

const gridTemplateColumns = computed(() => (
  visibleColumns.value.map(column => `${resolveColumnWidth(column.key, column.width)}px`).join(" ")
))

const pinnedOffsets = computed(() => {
  const leftOffsets = new Map<string, number>()
  const rightOffsets = new Map<string, number>()

  let left = 0
  for (const column of visibleColumns.value) {
    if (column.pin !== "left") {
      continue
    }
    leftOffsets.set(column.key, left)
    left += resolveColumnWidth(column.key, column.width)
  }

  let right = 0
  for (let index = visibleColumns.value.length - 1; index >= 0; index -= 1) {
    const column = visibleColumns.value[index]
    if (!column || column.pin !== "right") {
      continue
    }
    rightOffsets.set(column.key, right)
    right += resolveColumnWidth(column.key, column.width)
  }

  return { leftOffsets, rightOffsets }
})

const rowModelRevision = ref(0)
const viewportRef = ref<HTMLElement | null>(null)
const viewportMetrics = ref<{ scrollTop: number; height: number }>({ scrollTop: 0, height: 0 })
let unsubscribeRowModel: (() => void) | null = null

const updateViewportMetrics = (): void => {
  const viewport = viewportRef.value
  if (!viewport) {
    return
  }
  viewportMetrics.value = {
    scrollTop: viewport.scrollTop,
    height: viewport.clientHeight,
  }
}

const managedWheelScroll = useDataGridManagedWheelScroll({
  resolveWheelMode: () => props.wheelMode ?? "managed",
  resolveWheelAxisLockMode: () => props.wheelAxisLock ?? "dominant",
  resolvePreventDefaultWhenHandled: () => props.wheelPreventDefaultWhenHandled ?? true,
  resolveWheelPropagationMode: () => "release-at-boundary-when-unconsumed",
  resolveMinDeltaToApply: () => props.wheelMinDeltaToApply ?? 0,
  resolveBodyViewport() {
    return viewportRef.value
  },
  setHandledScrollTop(value) {
    const viewport = viewportRef.value
    if (!viewport) {
      return
    }
    if (viewport.scrollTop !== value) {
      viewport.scrollTop = value
    }
    updateViewportMetrics()
  },
  onWheelConsumed() {
    updateViewportMetrics()
  },
})

const onViewportWheel = (event: WheelEvent): void => {
  managedWheelScroll.onBodyViewportWheel(event)
}

const handleViewportScroll = (): void => {
  updateViewportMetrics()
}

const DEFAULT_ROW_HEIGHT = 36
const baseRowHeight = computed(() => DEFAULT_ROW_HEIGHT)
const BOOTSTRAP_VIEWPORT_ROWS = 160

const renderRange = computed(() => {
  // Row model APIs are imperative; pin computed reevaluation to model revision updates.
  void rowModelRevision.value
  const total = grid.value.rowModel.getRowCount()
  if (total <= 0) {
    return { start: 0, end: 0, total: 0 }
  }
  const height = viewportMetrics.value.height
  if (height <= 0) {
    // During first paint (especially worker-owned mode), viewport height can be 0.
    // Request a bounded window instead of the full dataset to avoid oversized bootstrap pulls.
    return { start: 0, end: Math.min(total - 1, BOOTSTRAP_VIEWPORT_ROWS - 1), total }
  }
  const rowHeight = Math.max(1, baseRowHeight.value)
  const overscan = 6
  const start = Math.max(0, Math.floor(viewportMetrics.value.scrollTop / rowHeight) - overscan)
  const visible = Math.ceil(height / rowHeight) + overscan * 2
  const end = Math.min(total - 1, start + visible)
  return { start, end, total }
})

const renderRangeStart = computed(() => renderRange.value.start)
const topSpacerHeight = computed(() => renderRange.value.start * baseRowHeight.value)
const bottomSpacerHeight = computed(() => {
  const total = renderRange.value.total
  const end = renderRange.value.end
  if (total <= 0) {
    return 0
  }
  return Math.max(0, (total - end - 1) * baseRowHeight.value)
})

watch(
  () => [grid.value.rowModel, renderRange.value.start, renderRange.value.end] as const,
  ([, start, end]) => {
    grid.value.api.view.setViewportRange({ start, end })
  },
  { immediate: true },
)

const renderedRows = computed(() => {
  void rowModelRevision.value
  const range = renderRange.value
  if (range.total <= 0) {
    return [] as readonly DataGridRowNode<RowLike>[]
  }
  return grid.value.rowModel.getRowsInRange({ start: range.start, end: range.end }) as readonly DataGridRowNode<RowLike>[]
})

const hasActiveFilters = computed(() => {
  const model = grid.value.api.rows.getSnapshot().filterModel
  if (!model) {
    return false
  }
  if (model.advancedExpression != null) {
    return true
  }
  const columnFilters = model.columnFilters ?? {}
  for (const entry of Object.values(columnFilters)) {
    if (!entry || typeof entry !== "object") {
      continue
    }
    const candidate = entry as { kind?: unknown; tokens?: unknown[] }
    if (candidate.kind === "valueSet") {
      if (Array.isArray(candidate.tokens) && candidate.tokens.length > 0) {
        return true
      }
      continue
    }
    return true
  }
  return false
})

const emptyStateMessage = computed(() => {
  // Keep loading/empty state in sync with worker-driven snapshot changes.
  void rowModelRevision.value
  const snapshot = grid.value.rowModel.getSnapshot()
  if (snapshot.loading) {
    return "Loading rows..."
  }
  if ((snapshot.rowCount ?? 0) <= 0) {
    return hasActiveFilters.value
      ? "No rows matched current filters."
      : "No rows available."
  }
  return hasActiveFilters.value
    ? "No rows matched current filters."
    : "No rows in current viewport yet."
})

onMounted(() => {
  watch(
    () => grid.value.rowModel,
    rowModel => {
      unsubscribeRowModel?.()
      unsubscribeRowModel = rowModel.subscribe(() => {
        // Worker-owned snapshots may not always advance a numeric revision.
        // Bump local revision counter on every snapshot event so viewport requests
        // and empty/loading state stay reactive on initial sync.
        rowModelRevision.value += 1
      })
      rowModelRevision.value += 1
    },
    { immediate: true },
  )
  updateViewportMetrics()
  viewportRef.value?.addEventListener("scroll", handleViewportScroll, { passive: true })
  window.addEventListener("pointerdown", handleContextMenuOutsidePointer, true)

  let resizeObserver: ResizeObserver | null = null
  if (typeof ResizeObserver !== "undefined" && viewportRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateViewportMetrics()
    })
    resizeObserver.observe(viewportRef.value)
  }
  onBeforeUnmount(() => {
    unsubscribeRowModel?.()
    unsubscribeRowModel = null
    viewportRef.value?.removeEventListener("scroll", handleViewportScroll)
    window.removeEventListener("pointerdown", handleContextMenuOutsidePointer, true)
    resizeObserver?.disconnect()
    managedWheelScroll.reset()
  })
})

const visibleLeafRows = computed(() => (
  renderedRows.value
    .map((rowNode, index) => ({ rowNode, rowIndex: resolveRenderedRowIndex(index) }))
    .filter((entry): entry is {
      rowNode: DataGridRowNode<RowLike> & { kind: "leaf" }
      rowIndex: number
    } => entry.rowNode.kind === "leaf")
))

const isLeafRowSelected = (row: RowLike, rowIndex: number): boolean => {
  return grid.value.bindings.rowSelection(row, rowIndex)["aria-selected"] === "true"
}

const setLeafRowSelected = (row: RowLike, rowIndex: number, selected: boolean): void => {
  const binding = grid.value.bindings.rowSelection(row, rowIndex)
  const isSelected = binding["aria-selected"] === "true"
  if (isSelected === selected) {
    return
  }
  binding.onClick()
}

const allVisibleRowsSelected = computed(() => (
  visibleLeafRows.value.length > 0 &&
  visibleLeafRows.value.every(({ rowNode, rowIndex }) => isLeafRowSelected(rowNode.data, rowIndex))
))

const someVisibleRowsSelected = computed(() => (
  !allVisibleRowsSelected.value &&
  visibleLeafRows.value.some(({ rowNode, rowIndex }) => isLeafRowSelected(rowNode.data, rowIndex))
))

const selectionRange = computed(() => grid.value.cellSelection.range.value)

const resolveRenderedRowIndex = (index: number): number => index + renderRangeStart.value

const shouldShowRangeHandles = (rowIndex: number, columnIndex: number): boolean => {
  const range = selectionRange.value
  if (!range) {
    return false
  }
  const column = visibleColumns.value[columnIndex]
  if (!column || column.key === "select") {
    return false
  }
  return isRangeFocusCell(range, rowIndex, columnIndex)
}

const isCellInPreview = (rowIndex: number, columnIndex: number): boolean => {
  const fillPreview = grid.value.cellRange.fillPreviewRange.value
  const movePreview = grid.value.cellRange.rangeMovePreviewRange.value
  const preview = fillPreview ?? movePreview
  if (!preview) {
    return false
  }
  return isCellInRange(preview, rowIndex, columnIndex)
}

const bindRangeHandle = (
  rowIndex: number,
  columnKey: string,
  mode: "fill" | "move",
): Record<string, unknown> => {
  if (!grid.value.bindings.rangeHandle) {
    return {}
  }
  return grid.value.bindings.rangeHandle({ rowIndex, columnKey, mode })
}

const bindRangeSurface = (
  rowIndex: number,
  columnKey: string,
): Record<string, unknown> => {
  if (!grid.value.bindings.rangeSurface) {
    return {}
  }
  return grid.value.bindings.rangeSurface({ rowIndex, columnKey })
}

const composeHandlers = <Args extends unknown[]>(
  ...handlers: Array<((...args: Args) => void) | undefined>
): ((...args: Args) => void) => {
  return ((...args: Args) => {
    for (const handler of handlers) {
      handler?.(...args)
    }
  })
}

const bindLeafCell = (
  rowNode: DataGridRowNode<RowLike>,
  rowIndex: number,
  columnKey: string,
): Record<string, unknown> => {
  const row = rowNode.data
  const rowIdentity = String(rowNode.rowId ?? rowNode.rowKey ?? "")
  if (columnKey === "select") {
    return {
      "data-row-key": rowIdentity,
      "data-column-key": columnKey,
      "data-row-index": rowIndex,
      "data-col-key": columnKey,
      tabindex: -1,
    }
  }
  const dataCell = grid.value.bindings.dataCell({
    row,
    rowIndex,
    columnKey,
    editable: columnKey !== "rowId" && columnKey !== "select",
    value: (row as Record<string, unknown>)[columnKey],
  })
  const selectionCell = grid.value.bindings.cellSelection({ row, rowIndex, columnKey })
  const rangeSurface = bindRangeSurface(rowIndex, columnKey)
  const onDataCellClick = (event: MouseEvent): void => {
    props.onDataCellClick?.({
      rowNode,
      rowIndex,
      columnKey,
      event,
    })
  }

  return {
    ...dataCell,
    ...selectionCell,
    ...rangeSurface,
    "data-row-index": rowIndex,
    "data-col-key": columnKey,
    tabindex: 0,
    onFocus: () => {
      if (rowIdentity.length > 0) {
        grid.value.cellSelection.setCellByKey(rowIdentity, columnKey)
      }
    },
    onClick: composeHandlers(
      (dataCell as { onClick?: (event: MouseEvent) => void }).onClick,
      (selectionCell as { onClick?: (event: MouseEvent) => void }).onClick,
      onDataCellClick,
    ),
    onKeydown: composeHandlers(dataCell.onKeydown, selectionCell.onKeydown),
    onMouseenter: composeHandlers(
      (selectionCell as { onMouseenter?: (event: MouseEvent) => void }).onMouseenter,
      (rangeSurface as { onMouseenter?: (event: MouseEvent) => void }).onMouseenter,
    ),
    onMouseup: composeHandlers(
      (selectionCell as { onMouseup?: (event?: MouseEvent) => void }).onMouseup,
      (rangeSurface as { onMouseup?: (event?: MouseEvent) => void }).onMouseup,
    ),
  }
}

const toggleAllVisibleRows = (checked: boolean): void => {
  for (const entry of visibleLeafRows.value) {
    setLeafRowSelected(entry.rowNode.data, entry.rowIndex, checked)
  }
}

const onToggleAllVisibleRowsChange = (event: Event): void => {
  const target = event.target as HTMLInputElement | null
  toggleAllVisibleRows(Boolean(target?.checked))
}

const onToggleRowSelectedChange = (
  row: RowLike,
  rowIndex: number,
  event: Event,
): void => {
  const target = event.target as HTMLInputElement | null
  setLeafRowSelected(row, rowIndex, Boolean(target?.checked))
}

const resolveNodeKey = (node: DataGridRowNode<RowLike>, fallbackIndex: number): string => {
  if (node.kind === "group") {
    return `group:${node.groupMeta?.groupKey ?? fallbackIndex}`
  }
  return String(node.rowId ?? node.rowKey ?? fallbackIndex)
}

const resolveLeafRowIdentity = (node: DataGridRowNode<RowLike>): string => (
  node.kind === "leaf" ? String(node.rowId ?? node.rowKey ?? "") : ""
)

const isPivotSubtotalRow = (node: DataGridRowNode<RowLike>): boolean => (
  node.kind === "leaf"
  && resolveLeafRowIdentity(node).startsWith("pivot:subtotal:")
)

const isPivotGrandTotalRow = (node: DataGridRowNode<RowLike>): boolean => (
  node.kind === "leaf"
  && resolveLeafRowIdentity(node) === "pivot:grand-total"
)

const resolveDisplayValue = (row: RowLike, columnKey: string): string => {
  const value = row[columnKey as keyof RowLike]
  return value == null ? "" : String(value)
}

const isTreePrimaryColumn = (columnKey: string): boolean => (
  treeTabular.value && resolvedTreePrimaryColumnKey.value === columnKey
)

const resolveGroupLevel = (rowNode: DataGridRowNode<RowLike>): number => (
  Math.max(0, Math.trunc(rowNode.groupMeta?.level ?? 0))
)

const resolveGroupToggleStyle = (rowNode: DataGridRowNode<RowLike>): Record<string, string> => ({
  paddingInlineStart: `${0.36 + (resolveGroupLevel(rowNode) * 1.05)}rem`,
})

const resolveLeafTreeLevel = (rowNode: DataGridRowNode<RowLike>): number => {
  const data = rowNode.data as Record<string, unknown>
  const path = data.path
  if (Array.isArray(path)) {
    return Math.max(0, path.length - 1)
  }
  return 0
}

const resolveLeafTreeCellStyle = (rowNode: DataGridRowNode<RowLike>, columnKey: string): Record<string, string> => {
  if (!isTreePrimaryColumn(columnKey)) {
    return {}
  }
  const level = resolveLeafTreeLevel(rowNode)
  return {
    paddingInlineStart: `${0.4 + (level * 1.05)}rem`,
  }
}

const resolveLeafSubtitleValue = (rowNode: DataGridRowNode<RowLike>): string => {
  const subtitleKey = resolvedTreeSubtitleColumnKey.value
  if (!subtitleKey) {
    return ""
  }
  return resolveDisplayValue(rowNode.data, subtitleKey)
}

const resolveLeafAvatarText = (rowNode: DataGridRowNode<RowLike>): string => {
  const subtitleValue = resolveLeafSubtitleValue(rowNode)
  if (subtitleValue.length > 0) {
    return subtitleValue.slice(0, 2).toUpperCase()
  }
  const primaryKey = resolvedTreePrimaryColumnKey.value
  const primaryValue = primaryKey ? resolveDisplayValue(rowNode.data, primaryKey) : ""
  if (primaryValue.length > 0) {
    return primaryValue.slice(0, 2).toUpperCase()
  }
  return "DG"
}

const resolveGroupPrimaryValue = (rowNode: DataGridRowNode<RowLike>): string => {
  const primaryKey = resolvedTreePrimaryColumnKey.value
  if (!primaryKey) {
    return rowNode.groupMeta?.groupValue ? String(rowNode.groupMeta.groupValue) : "Group"
  }
  const value = resolveDisplayValue(rowNode.data, primaryKey)
  if (value.length > 0) {
    return value
  }
  return rowNode.groupMeta?.groupValue ? String(rowNode.groupMeta.groupValue) : "Group"
}

const resolveGroupSubtitleValue = (rowNode: DataGridRowNode<RowLike>): string => {
  const subtitleKey = resolvedTreeSubtitleColumnKey.value
  if (!subtitleKey) {
    return ""
  }
  return resolveDisplayValue(rowNode.data, subtitleKey)
}

const resolveGroupColumnValue = (rowNode: DataGridRowNode<RowLike>, columnKey: string): string => {
  if (isTreePrimaryColumn(columnKey)) {
    return resolveGroupPrimaryValue(rowNode)
  }
  return resolveDisplayValue(rowNode.data, columnKey)
}

const resolvePinnedCellStyle = (
  columnKey: string,
  pin: DataGridColumnPin,
  isHeader: boolean,
): Record<string, string> => {
  if (pin === "left") {
    const left = pinnedOffsets.value.leftOffsets.get(columnKey) ?? 0
    return {
      position: "sticky",
      left: `${left}px`,
      zIndex: isHeader ? "14" : "7",
    }
  }
  if (pin === "right") {
    const right = pinnedOffsets.value.rightOffsets.get(columnKey) ?? 0
    return {
      position: "sticky",
      right: `${right}px`,
      zIndex: isHeader ? "14" : "7",
    }
  }
  return {}
}

const resolveHeaderCellStyle = (columnKey: string, pin: DataGridColumnPin): Record<string, string> => ({
  ...resolvePinnedCellStyle(columnKey, pin, true),
})

const resolveSort = (columnKey: string): "none" | "ascending" | "descending" => (
  grid.value.bindings.headerSort(columnKey)["aria-sort"]
)

const sortPriorityMap = computed(() => {
  const map = new Map<string, number>()
  for (const [index, sortEntry] of grid.value.sortState.value.entries()) {
    map.set(sortEntry.key, index + 1)
  }
  return map
})

const contextMenuOpen = computed(() => grid.value.contextMenu.state.value.visible)
const contextMenuStyle = computed(() => grid.value.contextMenu.style.value)
const contextMenuGroups = computed(() => grid.value.contextMenu.groupedActions?.value ?? [])

const handleContextMenuKeydown = (event: KeyboardEvent): void => {
  if (!grid.value.contextMenu.state.value.visible) {
    return
  }
  grid.value.contextMenu.onKeyDown(event, {
    onEscape: () => {
      grid.value.contextMenu.close()
    },
  })
}

watch(contextMenuOpen, async (open) => {
  if (!open) {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleContextMenuKeydown, true)
    }
    return
  }
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleContextMenuKeydown, true)
  }
  await nextTick()
  const menuEl = grid.value.contextMenu.contextMenuRef.value
  if (!menuEl) {
    return
  }
  const firstItem = menuEl.querySelector<HTMLElement>(".datagrid-sugar-context__item")
  firstItem?.focus()
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleContextMenuKeydown, true)
  }
})

const handleContextMenuOutsidePointer = (event: PointerEvent): void => {
  if (!grid.value.contextMenu.state.value.visible) {
    return
  }
  const menuEl = grid.value.contextMenu.contextMenuRef.value
  const target = event.target as Node | null
  if (!menuEl || !target) {
    grid.value.contextMenu.close()
    return
  }
  if (!menuEl.contains(target)) {
    grid.value.contextMenu.close()
  }
}

const bindContextMenuRef = (value: Element | ComponentPublicInstance | null): void => {
  if (value && typeof value === "object" && "$el" in value) {
    grid.value.bindings.contextMenuRef((value.$el as Element | null) ?? null)
    return
  }
  grid.value.bindings.contextMenuRef(value as Element | null)
}

const visibleColumnCount = computed(() => visibleColumns.value.length)

const rowHeights = ref<Record<string, number>>({})
const rowResizeState = ref<{
  rowKey: string
  startY: number
  startHeight: number
} | null>(null)

const resolveRowHeight = (rowKey: string): number => {
  const custom = rowHeights.value[rowKey]
  if (typeof custom === "number" && Number.isFinite(custom) && custom > 0) {
    return Math.max(24, Math.round(custom))
  }
  return baseRowHeight.value
}

const resolveRowCellStyleForRow = (
  rowKey: string,
  columnKey: string,
  pin: DataGridColumnPin,
): Record<string, string> => ({
  minHeight: `${resolveRowHeight(rowKey)}px`,
  ...resolvePinnedCellStyle(columnKey, pin, false),
})

const updateRowHeight = (rowKey: string, height: number): void => {
  rowHeights.value = {
    ...rowHeights.value,
    [rowKey]: Math.max(24, Math.round(height)),
  }
}

const resetRowHeight = (rowKey: string): void => {
  const next = { ...rowHeights.value }
  delete next[rowKey]
  rowHeights.value = next
}

const onRowResizeMove = (event: MouseEvent): void => {
  const state = rowResizeState.value
  if (!state) {
    return
  }
  const delta = event.clientY - state.startY
  updateRowHeight(state.rowKey, state.startHeight + delta)
}

const onRowResizeEnd = (): void => {
  if (!rowResizeState.value) {
    return
  }
  rowResizeState.value = null
  if (typeof window !== "undefined") {
    window.removeEventListener("mousemove", onRowResizeMove)
    window.removeEventListener("mouseup", onRowResizeEnd)
  }
}

const startRowResize = (rowKey: string, event: MouseEvent): void => {
  event.preventDefault()
  rowResizeState.value = {
    rowKey,
    startY: event.clientY,
    startHeight: resolveRowHeight(rowKey),
  }
  if (typeof window !== "undefined") {
    window.addEventListener("mousemove", onRowResizeMove)
    window.addEventListener("mouseup", onRowResizeEnd)
  }
}

const bindRowResizeHandle = (rowKey: string): Record<string, unknown> => ({
  role: "separator",
  tabindex: 0,
  "aria-orientation": "horizontal",
  "data-row-key": rowKey,
  onMousedown: (event: MouseEvent) => {
    startRowResize(rowKey, event)
  },
  onDblclick: () => {
    resetRowHeight(rowKey)
  },
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("mousemove", onRowResizeMove)
    window.removeEventListener("mouseup", onRowResizeEnd)
  }
})
</script>

<template>
  <main
    class="datagrid-sugar-stage"
    :class="{ 'is-tree-variant': treeTabular }"
    role="grid"
    aria-label="Affino DataGrid sugar demo"
  >
    <div ref="viewportRef" class="datagrid-sugar-stage__viewport" @wheel="onViewportWheel">
      <div class="datagrid-sugar-stage__header" :style="{ gridTemplateColumns }">
        <div
          v-for="column in visibleColumns"
          :key="`header:${column.key}`"
          class="datagrid-sugar-stage__cell datagrid-sugar-stage__cell--header"
          :class="{
            'is-select': column.key === 'select',
            'is-pinned-left': column.pin === 'left',
            'is-pinned-right': column.pin === 'right',
            'is-sorted': resolveSort(column.key) !== 'none',
          }"
          :style="resolveHeaderCellStyle(column.key, column.pin)"
          v-bind="column.key === 'select' ? {} : grid.bindings.headerCell(column.key)"
        >
          <template v-if="column.key === 'select'">
            <input
              class="datagrid-sugar-stage__checkbox"
              type="checkbox"
              :checked="allVisibleRowsSelected"
              :indeterminate.prop="someVisibleRowsSelected"
              aria-label="Select all visible rows"
              @change="onToggleAllVisibleRowsChange"
            />
          </template>
          <template v-else>
            <span class="datagrid-sugar-stage__header-label">{{ column.column.label ?? column.key }}</span>
            <span class="datagrid-sugar-stage__header-meta">
              <span v-if="resolveSort(column.key) !== 'none'" class="datagrid-sugar-stage__header-sort">
                {{ resolveSort(column.key) === "ascending" ? "▲" : "▼" }}
              </span>
              <span v-if="sortPriorityMap.get(column.key)" class="datagrid-sugar-stage__header-priority">
                {{ sortPriorityMap.get(column.key) }}
              </span>
            </span>
            <span
              class="datagrid-sugar-stage__resize-handle"
              v-bind="grid.bindings.columnResizeHandle?.(column.key) ?? {}"
              @pointerdown.stop
              @mousedown.stop
              @click.stop
            ></span>
          </template>
        </div>
      </div>

      <div
        v-if="topSpacerHeight > 0"
        class="datagrid-sugar-stage__spacer"
        :style="{ height: `${topSpacerHeight}px` }"
      ></div>

      <div
        v-for="(rowNode, rowIndex) in renderedRows"
        :key="resolveNodeKey(rowNode, resolveRenderedRowIndex(rowIndex))"
        class="datagrid-sugar-stage__row"
        :class="{
          'is-pivot-subtotal': isPivotSubtotalRow(rowNode),
          'is-pivot-grand-total': isPivotGrandTotalRow(rowNode),
        }"
        :style="{ gridTemplateColumns }"
      >
        <template v-if="rowNode.kind === 'group' && !treeTabular">
          <div
            class="datagrid-sugar-stage__cell datagrid-sugar-stage__cell--group"
            :style="{ gridColumn: `1 / ${visibleColumnCount + 1}` }"
          >
            <button
              type="button"
              class="datagrid-sugar-stage__group-toggle"
              @click="rowNode.groupMeta?.groupKey ? grid.api.rows.toggleGroup(rowNode.groupMeta.groupKey) : null"
            >
              <span aria-hidden="true">{{ rowNode.state.expanded ? "▾" : "▸" }}</span>
              <span>{{ rowNode.groupMeta?.groupValue ?? "Group" }} ({{ rowNode.groupMeta?.childrenCount ?? 0 }})</span>
            </button>
          </div>
        </template>

        <template v-else-if="rowNode.kind === 'group'">
          <div
            v-for="column in visibleColumns"
            :key="`group:${resolveNodeKey(rowNode, resolveRenderedRowIndex(rowIndex))}:${column.key}`"
            class="datagrid-sugar-stage__cell datagrid-sugar-stage__cell--group-tabular"
            :class="{
              'is-pinned-left': column.pin === 'left',
              'is-pinned-right': column.pin === 'right',
            }"
            :style="resolvePinnedCellStyle(column.key, column.pin, false)"
          >
            <button
              v-if="isTreePrimaryColumn(column.key)"
              type="button"
              class="datagrid-sugar-stage__group-toggle datagrid-sugar-stage__group-toggle--tabular"
              :style="resolveGroupToggleStyle(rowNode)"
              @click="rowNode.groupMeta?.groupKey ? grid.api.rows.toggleGroup(rowNode.groupMeta.groupKey) : null"
            >
              <span class="datagrid-sugar-stage__group-chevron" aria-hidden="true">{{ rowNode.state.expanded ? "▾" : "▸" }}</span>
              <span class="datagrid-sugar-stage__group-copy">
                <span class="datagrid-sugar-stage__group-label">{{ resolveGroupPrimaryValue(rowNode) }}</span>
                <span v-if="resolveGroupSubtitleValue(rowNode)" class="datagrid-sugar-stage__group-subtitle">
                  {{ resolveGroupSubtitleValue(rowNode) }}
                </span>
              </span>
              <span class="datagrid-sugar-stage__group-count">{{ rowNode.groupMeta?.childrenCount ?? 0 }}</span>
            </button>
            <span
              v-else
              class="datagrid-sugar-stage__group-value"
              :class="{ 'datagrid-sugar-stage__group-placeholder': resolveGroupColumnValue(rowNode, column.key).length === 0 }"
            >
              {{ resolveGroupColumnValue(rowNode, column.key) }}
            </span>
          </div>
        </template>

        <template v-else>
          <div
            v-for="(column, columnIndex) in visibleColumns"
            :key="`${rowNode.rowId}:${column.key}`"
            class="datagrid-sugar-stage__cell"
            :class="{
              'is-select': column.key === 'select',
              'is-selected': grid.cellSelection.isCellSelected(resolveRenderedRowIndex(rowIndex), columnIndex),
              'is-preview': isCellInPreview(resolveRenderedRowIndex(rowIndex), columnIndex),
              'is-editing': grid.bindings.isCellEditing(String(rowNode.rowId), column.key),
              'is-pinned-left': column.pin === 'left',
              'is-pinned-right': column.pin === 'right',
            }"
            :style="resolveRowCellStyleForRow(String(rowNode.rowId ?? rowNode.rowKey ?? resolveRenderedRowIndex(rowIndex)), column.key, column.pin)"
            v-bind="bindLeafCell(rowNode, resolveRenderedRowIndex(rowIndex), column.key)"
          >
            <template v-if="column.key === 'select'">
              <button
                type="button"
                class="datagrid-sugar-stage__drag"
                v-bind="grid.bindings.rowReorder(rowNode.data, resolveRenderedRowIndex(rowIndex))"
                aria-label="Reorder row"
              >
                ⋮⋮
              </button>
              <input
                class="datagrid-sugar-stage__checkbox"
                type="checkbox"
                :checked="isLeafRowSelected(rowNode.data, resolveRenderedRowIndex(rowIndex))"
                @change="onToggleRowSelectedChange(rowNode.data, resolveRenderedRowIndex(rowIndex), $event)"
              />
              <span
                class="datagrid-sugar-stage__row-resize-handle"
                v-bind="bindRowResizeHandle(String(rowNode.rowId ?? rowNode.rowKey ?? resolveRenderedRowIndex(rowIndex)))"
              ></span>
            </template>

            <input
              v-else-if="grid.bindings.isCellEditing(String(rowNode.rowId), column.key)"
              class="datagrid-sugar-stage__editor"
              v-bind="grid.bindings.inlineEditor({
                rowKey: String(rowNode.rowId),
                columnKey: column.key,
                commitOnBlur: true,
              })"
              @keydown.stop
              @mousedown.stop
              autofocus
            />

            <span
              v-else-if="isTreePrimaryColumn(column.key)"
              class="datagrid-sugar-stage__tree-leaf"
              :style="resolveLeafTreeCellStyle(rowNode, column.key)"
            >
              <span class="datagrid-sugar-stage__tree-avatar">{{ resolveLeafAvatarText(rowNode) }}</span>
              <span class="datagrid-sugar-stage__tree-copy">
                <span class="datagrid-sugar-stage__tree-title">{{ resolveDisplayValue(rowNode.data, column.key) }}</span>
                <span v-if="resolveLeafSubtitleValue(rowNode)" class="datagrid-sugar-stage__tree-subtitle">
                  {{ resolveLeafSubtitleValue(rowNode) }}
                </span>
              </span>
            </span>

            <span v-else>{{ resolveDisplayValue(rowNode.data, column.key) }}</span>

            <template v-if="shouldShowRangeHandles(resolveRenderedRowIndex(rowIndex), columnIndex)">
              <span class="datagrid-sugar-stage__selection-handle" v-bind="bindRangeHandle(resolveRenderedRowIndex(rowIndex), column.key, 'fill')"></span>
              <span class="datagrid-sugar-stage__selection-handle is-move" v-bind="bindRangeHandle(resolveRenderedRowIndex(rowIndex), column.key, 'move')"></span>
            </template>
          </div>
        </template>
      </div>

        <div
          v-if="bottomSpacerHeight > 0"
          class="datagrid-sugar-stage__spacer"
          :style="{ height: `${bottomSpacerHeight}px` }"
        ></div>

      <div v-if="renderedRows.length === 0" class="datagrid-sugar-stage__empty">
        {{ emptyStateMessage }}
      </div>
    </div>

    <footer v-if="showPagination" class="datagrid-sugar-stage__footer">
      <button type="button" @click="grid.pagination.goToFirstPage">First</button>
      <button type="button" @click="grid.pagination.goToPreviousPage">Prev</button>
      <span>Page {{ grid.pagination.snapshot.value.currentPage + 1 }} / {{ grid.pagination.snapshot.value.pageCount }}</span>
      <button type="button" @click="grid.pagination.goToNextPage">Next</button>
      <button type="button" @click="grid.pagination.goToLastPage">Last</button>
    </footer>
  </main>

  <section
    v-if="contextMenuOpen"
    :ref="bindContextMenuRef"
    class="datagrid-sugar-context"
    :style="contextMenuStyle"
    v-bind="grid.bindings.contextMenuRoot()"
  >
    <template v-for="group in contextMenuGroups" :key="group.id">
      <h5 class="datagrid-sugar-context__group-title">{{ group.label }}</h5>
      <button
        v-for="action in group.actions"
        :key="action.id"
        type="button"
        class="datagrid-sugar-context__item"
        :data-datagrid-menu-action="action.id"
        :disabled="grid.contextMenu.isActionDisabled?.(action.id)"
        :title="grid.contextMenu.getActionDisabledReason?.(action.id) ?? ''"
        v-bind="grid.bindings.contextMenuAction(action.id)"
      >
        {{ action.label }}
      </button>
    </template>
  </section>
</template>
