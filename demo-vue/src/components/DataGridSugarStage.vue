<script setup lang="ts">
import { computed, ref, watch, type ComponentPublicInstance } from "vue"
import type {
  DataGridColumnPin,
  DataGridRowNode,
} from "@affino/datagrid-core"
import type { UseAffinoDataGridResult } from "@affino/datagrid-vue"

type RowLike = {
  rowId?: string | number
}

type HeaderFilterType = "text" | "number" | "date" | "set"

interface HeaderFilterStateLike {
  open: boolean
  columnKey: string | null
  query: string
  operator: string
  type: HeaderFilterType
}

const props = defineProps<{
  grid: UseAffinoDataGridResult<any>
}>()

const grid = computed(() => props.grid as UseAffinoDataGridResult<RowLike>)

const headerTextValue = ref("")
const headerNumberMin = ref("")
const headerNumberMax = ref("")
const headerDateFrom = ref("")
const headerDateTo = ref("")
const headerSetSearch = ref("")

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

const renderedRows = computed(() => {
  const count = grid.value.rowModel.getRowCount()
  if (count <= 0) {
    return [] as readonly DataGridRowNode<RowLike>[]
  }
  return grid.value.rowModel.getRowsInRange({ start: 0, end: count - 1 }) as readonly DataGridRowNode<RowLike>[]
})

const leafRowKeys = computed(() => (
  renderedRows.value
    .filter((row): row is DataGridRowNode<RowLike> & { kind: "leaf" } => row.kind === "leaf")
    .map(row => String(row.rowId))
))

const allVisibleRowsSelected = computed(() => (
  leafRowKeys.value.length > 0 &&
  leafRowKeys.value.every(rowKey => grid.value.features.selection.isSelectedByKey(rowKey))
))

const someVisibleRowsSelected = computed(() => (
  !allVisibleRowsSelected.value &&
  leafRowKeys.value.some(rowKey => grid.value.features.selection.isSelectedByKey(rowKey))
))

const selectionRange = computed(() => grid.value.cellSelection.range.value)

const shouldShowRangeHandles = (rowIndex: number, columnIndex: number): boolean => {
  const range = selectionRange.value
  if (!range) {
    return false
  }
  const column = visibleColumns.value[columnIndex]
  if (!column || column.key === "select") {
    return false
  }
  return rowIndex === range.endRow && columnIndex === range.endColumn
}

const isCellInPreview = (rowIndex: number, columnIndex: number): boolean => {
  const fillPreview = grid.value.cellRange.fillPreviewRange.value
  const movePreview = grid.value.cellRange.rangeMovePreviewRange.value
  const preview = fillPreview ?? movePreview
  if (!preview) {
    return false
  }
  return (
    rowIndex >= preview.startRow &&
    rowIndex <= preview.endRow &&
    columnIndex >= preview.startColumn &&
    columnIndex <= preview.endColumn
  )
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

const composeHandlers = <T extends (...args: any[]) => void>(
  ...handlers: Array<T | undefined>
): T => {
  return ((...args: any[]) => {
    for (const handler of handlers) {
      handler?.(...args)
    }
  }) as T
}

const bindLeafCell = (
  row: RowLike,
  rowIndex: number,
  columnKey: string,
): Record<string, unknown> => {
  if (columnKey === "select") {
    return {
      "data-row-key": String(row.rowId ?? ""),
      "data-column-key": columnKey,
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

  return {
    ...dataCell,
    ...selectionCell,
    ...rangeSurface,
    tabindex: 0,
    onFocus: () => {
      const rowKey = String(row.rowId ?? "")
      if (rowKey.length > 0) {
        grid.value.cellSelection.setCellByKey(rowKey, columnKey)
      }
    },
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
  for (const rowKey of leafRowKeys.value) {
    grid.value.features.selection.setSelectedByKey(rowKey, checked)
  }
}

const onToggleAllVisibleRowsChange = (event: Event): void => {
  const target = event.target as HTMLInputElement | null
  toggleAllVisibleRows(Boolean(target?.checked))
}

const onToggleRowSelectedChange = (rowKey: string, event: Event): void => {
  const target = event.target as HTMLInputElement | null
  grid.value.features.selection.setSelectedByKey(rowKey, Boolean(target?.checked))
}

const resolveNodeKey = (node: DataGridRowNode<RowLike>, fallbackIndex: number): string => {
  if (node.kind === "group") {
    return `group:${node.groupMeta?.groupKey ?? fallbackIndex}`
  }
  return String(node.rowId ?? node.rowKey ?? fallbackIndex)
}

const resolveDisplayValue = (row: RowLike, columnKey: string): string => {
  const value = row[columnKey as keyof RowLike]
  return value == null ? "" : String(value)
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

const resolveRowCellStyle = (columnKey: string, pin: DataGridColumnPin): Record<string, string> => ({
  minHeight: `${grid.value.features.rowHeight.base.value}px`,
  ...resolvePinnedCellStyle(columnKey, pin, false),
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

const headerFilter = computed(() => grid.value.features.headerFilters)
const headerFilterState = computed<HeaderFilterStateLike>(() => headerFilter.value?.state.value ?? {
  open: false,
  columnKey: null,
  query: "",
  operator: "contains",
  type: "text",
})

watch(
  () => headerFilterState.value.columnKey,
  () => {
    headerTextValue.value = ""
    headerNumberMin.value = ""
    headerNumberMax.value = ""
    headerDateFrom.value = ""
    headerDateTo.value = ""
    headerSetSearch.value = ""
  },
)

const openedHeaderOperators = computed(() => {
  const columnKey = headerFilterState.value.columnKey
  if (!columnKey || !headerFilter.value) {
    return []
  }
  return headerFilter.value.getOperators(columnKey)
})

const openedHeaderValues = computed(() => {
  const columnKey = headerFilterState.value.columnKey
  if (!columnKey || !headerFilter.value) {
    return []
  }
  const query = headerSetSearch.value.trim().toLowerCase()
  return headerFilter.value
    .getUniqueValues(columnKey)
    .filter(value => value.label.toLowerCase().includes(query))
})

const openHeaderFilter = (columnKey: string): void => {
  headerFilter.value?.toggle(columnKey)
}

const onHeaderOperatorChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement | null
  headerFilter.value?.setOperator(target?.value ?? "")
}

const onHeaderSetValueChange = (value: unknown, event: Event): void => {
  const target = event.target as HTMLInputElement | null
  const columnKey = headerFilterState.value.columnKey
  if (!columnKey) {
    return
  }
  headerFilter.value?.setValueSelected(columnKey, value, Boolean(target?.checked))
}

const applyOpenedHeaderFilter = (): void => {
  const filter = headerFilter.value
  const state = headerFilterState.value
  if (!filter || !state.columnKey) {
    return
  }
  if (state.type === "set") {
    filter.close()
    return
  }
  if (state.type === "number") {
    filter.applyNumber(state.columnKey, {
      operator: state.operator,
      value: headerNumberMin.value.trim() === "" ? undefined : Number(headerNumberMin.value),
      value2: headerNumberMax.value.trim() === "" ? undefined : Number(headerNumberMax.value),
      mergeMode: "merge-and",
    })
    filter.close()
    return
  }
  if (state.type === "date") {
    filter.applyDate(state.columnKey, {
      operator: state.operator,
      value: headerDateFrom.value || undefined,
      value2: headerDateTo.value || undefined,
      mergeMode: "merge-and",
    })
    filter.close()
    return
  }
  filter.applyText(state.columnKey, {
    operator: state.operator,
    value: headerTextValue.value,
    mergeMode: "merge-and",
  })
  filter.close()
}

const clearOpenedHeaderFilter = (): void => {
  const filter = headerFilter.value
  const state = headerFilterState.value
  if (!filter || !state.columnKey) {
    return
  }
  filter.clear(state.columnKey)
}

const contextMenuOpen = computed(() => grid.value.contextMenu.state.value.visible)
const contextMenuStyle = computed(() => grid.value.contextMenu.style.value)
const contextMenuGroups = computed(() => grid.value.contextMenu.groupedActions?.value ?? [])

const bindContextMenuRef = (value: Element | ComponentPublicInstance | null): void => {
  if (value && typeof value === "object" && "$el" in value) {
    grid.value.bindings.contextMenuRef((value.$el as Element | null) ?? null)
    return
  }
  grid.value.bindings.contextMenuRef(value as Element | null)
}

const headerFilterFloatingStyle = computed<Record<string, string>>(() => {
  if (!headerFilterState.value.open) {
    return { top: "0px", right: "0px" }
  }
  return {
    top: "70px",
    right: "16px",
  }
})

const visibleColumnCount = computed(() => visibleColumns.value.length)
</script>

<template>
  <main class="datagrid-sugar-stage" role="grid" aria-label="Affino DataGrid sugar demo">
    <div class="datagrid-sugar-stage__viewport">
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
              <button
                type="button"
                class="datagrid-sugar-stage__header-filter"
                @click.stop="openHeaderFilter(column.key)"
              >
                ⌕
              </button>
            </span>
            <span class="datagrid-sugar-stage__resize-handle" v-bind="grid.bindings.columnResizeHandle?.(column.key) ?? {}"></span>
          </template>
        </div>
      </div>

      <div
        v-for="(rowNode, rowIndex) in renderedRows"
        :key="resolveNodeKey(rowNode, rowIndex)"
        class="datagrid-sugar-stage__row"
        :style="{ gridTemplateColumns }"
      >
        <template v-if="rowNode.kind === 'group'">
          <div
            class="datagrid-sugar-stage__cell datagrid-sugar-stage__cell--group"
            :style="{ gridColumn: `1 / ${visibleColumnCount + 1}` }"
          >
            <button
              type="button"
              class="datagrid-sugar-stage__group-toggle"
              @click="rowNode.groupMeta?.groupKey ? grid.features.tree.toggleGroup(rowNode.groupMeta.groupKey) : null"
            >
              <span aria-hidden="true">{{ rowNode.state.expanded ? "▾" : "▸" }}</span>
              <span>{{ rowNode.groupMeta?.groupValue ?? "Group" }} ({{ rowNode.groupMeta?.childrenCount ?? 0 }})</span>
            </button>
          </div>
        </template>

        <template v-else>
          <div
            v-for="(column, columnIndex) in visibleColumns"
            :key="`${rowNode.rowId}:${column.key}`"
            class="datagrid-sugar-stage__cell"
            :class="{
              'is-select': column.key === 'select',
              'is-selected': grid.cellSelection.isCellSelected(rowIndex, columnIndex),
              'is-preview': isCellInPreview(rowIndex, columnIndex),
              'is-editing': grid.bindings.isCellEditing(String(rowNode.rowId), column.key),
              'is-pinned-left': column.pin === 'left',
              'is-pinned-right': column.pin === 'right',
            }"
            :style="resolveRowCellStyle(column.key, column.pin)"
            v-bind="bindLeafCell(rowNode.data, rowIndex, column.key)"
          >
            <template v-if="column.key === 'select'">
              <button
                type="button"
                class="datagrid-sugar-stage__drag"
                v-bind="grid.bindings.rowReorder(rowNode.data, rowIndex)"
                aria-label="Reorder row"
              >
                ⋮⋮
              </button>
              <input
                class="datagrid-sugar-stage__checkbox"
                type="checkbox"
                :checked="grid.features.selection.isSelectedByKey(String(rowNode.rowId))"
                @change="onToggleRowSelectedChange(String(rowNode.rowId), $event)"
              />
              <span class="datagrid-sugar-stage__row-resize-handle" v-bind="grid.bindings.rowResizeHandle?.(String(rowNode.rowId)) ?? {}"></span>
            </template>

            <input
              v-else-if="grid.bindings.isCellEditing(String(rowNode.rowId), column.key)"
              class="datagrid-sugar-stage__editor"
              v-bind="grid.bindings.inlineEditor({
                rowKey: String(rowNode.rowId),
                columnKey: column.key,
                commitOnBlur: true,
              })"
              autofocus
            />

            <span v-else>{{ resolveDisplayValue(rowNode.data, column.key) }}</span>

            <template v-if="shouldShowRangeHandles(rowIndex, columnIndex)">
              <span class="datagrid-sugar-stage__selection-handle" v-bind="bindRangeHandle(rowIndex, column.key, 'fill')"></span>
              <span class="datagrid-sugar-stage__selection-handle is-move" v-bind="bindRangeHandle(rowIndex, column.key, 'move')"></span>
            </template>
          </div>
        </template>
      </div>

      <div v-if="renderedRows.length === 0" class="datagrid-sugar-stage__empty">
        No rows matched current filters.
      </div>
    </div>

    <footer class="datagrid-sugar-stage__footer">
      <button type="button" @click="grid.pagination.goToFirstPage">First</button>
      <button type="button" @click="grid.pagination.goToPreviousPage">Prev</button>
      <span>Page {{ grid.pagination.snapshot.value.currentPage + 1 }} / {{ grid.pagination.snapshot.value.pageCount }}</span>
      <button type="button" @click="grid.pagination.goToNextPage">Next</button>
      <button type="button" @click="grid.pagination.goToLastPage">Last</button>
    </footer>
  </main>

  <section
    v-if="headerFilterState.open && headerFilterState.columnKey"
    class="datagrid-sugar-filter-popover"
    :style="headerFilterFloatingStyle"
    @mousedown.stop
  >
    <h4>{{ headerFilterState.columnKey }}</h4>

    <label>
      <span>Operator</span>
      <select
        :value="headerFilterState.operator"
        @change="onHeaderOperatorChange"
      >
        <option v-for="operator in openedHeaderOperators" :key="operator.value" :value="operator.value">
          {{ operator.label }}
        </option>
      </select>
    </label>

    <template v-if="headerFilterState.type === 'set'">
      <label>
        <span>Search values</span>
        <input v-model="headerSetSearch" type="search" placeholder="Search..." />
      </label>
      <div class="datagrid-sugar-filter-popover__set">
        <label v-for="entry in openedHeaderValues" :key="entry.key" class="datagrid-sugar-filter-popover__set-row">
          <input
            type="checkbox"
            :checked="entry.selected"
            @change="onHeaderSetValueChange(entry.value, $event)"
          />
          <span>{{ entry.label }} ({{ entry.count }})</span>
          <button
            type="button"
            class="is-link"
            @click="grid.features.headerFilters?.selectOnlyValue(headerFilterState.columnKey!, entry.value)"
          >
            Only
          </button>
        </label>
      </div>
    </template>

    <template v-else-if="headerFilterState.type === 'number'">
      <label>
        <span>Min</span>
        <input v-model="headerNumberMin" type="number" />
      </label>
      <label>
        <span>Max</span>
        <input v-model="headerNumberMax" type="number" />
      </label>
    </template>

    <template v-else-if="headerFilterState.type === 'date'">
      <label>
        <span>From</span>
        <input v-model="headerDateFrom" type="date" />
      </label>
      <label>
        <span>To</span>
        <input v-model="headerDateTo" type="date" />
      </label>
    </template>

    <template v-else>
      <label>
        <span>Contains</span>
        <input v-model="headerTextValue" type="text" placeholder="contains..." />
      </label>
    </template>

    <div class="datagrid-sugar-filter-popover__actions">
      <button type="button" class="is-primary" @click="applyOpenedHeaderFilter">Apply</button>
      <button type="button" class="is-ghost" @click="clearOpenedHeaderFilter">Reset</button>
      <button type="button" class="is-ghost" @click="grid.features.headerFilters?.close()">Close</button>
    </div>
  </section>

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
        :disabled="grid.contextMenu.isActionDisabled?.(action.id)"
        :title="grid.contextMenu.getActionDisabledReason?.(action.id) ?? ''"
        v-bind="grid.bindings.contextMenuAction(action.id)"
      >
        {{ action.label }}
      </button>
    </template>
  </section>
</template>

<style scoped>
.datagrid-sugar-stage {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.28));
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(11, 18, 32, 0.58)) 78%, transparent);
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.datagrid-sugar-stage__viewport {
  overflow: auto;
  min-width: 0;
  min-height: 0;
  position: relative;
}

.datagrid-sugar-stage__header {
  display: grid;
  width: max-content;
  min-width: 100%;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25));
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.95)) 92%, transparent);
}

.datagrid-sugar-stage__row {
  display: grid;
  width: max-content;
  min-width: 100%;
  border-bottom: 1px solid color-mix(in srgb, var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25)) 82%, transparent);
}

.datagrid-sugar-stage__cell {
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 0.34rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.84rem;
  color: var(--datagrid-text-primary, #e2e8f0);
  border-right: 1px solid color-mix(in srgb, var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25)) 80%, transparent);
  position: relative;
  background: transparent;
}

.datagrid-sugar-stage__cell:last-child {
  border-right: 0;
}

.datagrid-sugar-stage__cell--header {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
  color: var(--datagrid-text-soft, #94a3b8);
  justify-content: space-between;
  user-select: none;
  cursor: pointer;
}

.datagrid-sugar-stage__cell--header.is-select,
.datagrid-sugar-stage__cell.is-select {
  justify-content: center;
  padding: 0.2rem 0.28rem;
}

.datagrid-sugar-stage__cell.is-selected {
  background: color-mix(in srgb, var(--datagrid-selection-range-bg, rgba(56, 189, 248, 0.18)) 92%, transparent);
}

.datagrid-sugar-stage__cell.is-preview {
  background: color-mix(in srgb, rgba(56, 189, 248, 0.11) 88%, transparent);
}

.datagrid-sugar-stage__cell.is-editing {
  background: color-mix(in srgb, var(--datagrid-selection-active-bg, rgba(56, 189, 248, 0.28)) 85%, transparent);
}

.datagrid-sugar-stage__cell--group {
  border-right: 0;
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.86)) 75%, transparent);
}

.datagrid-sugar-stage__group-toggle {
  border: 0;
  background: transparent;
  color: var(--datagrid-text-primary, #e2e8f0);
  display: inline-flex;
  gap: 0.44rem;
  align-items: center;
  cursor: pointer;
  padding: 0;
}

.datagrid-sugar-stage__header-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
}

.datagrid-sugar-stage__header-sort {
  font-size: 0.66rem;
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-stage__header-priority {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.02rem;
  height: 1.02rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  color: #0f172a;
  background: #38bdf8;
}

.datagrid-sugar-stage__header-filter {
  border: 1px solid transparent;
  border-radius: 0.36rem;
  background: transparent;
  color: var(--datagrid-text-muted, #94a3b8);
  width: 1.2rem;
  height: 1.2rem;
  line-height: 1;
  padding: 0;
}

.datagrid-sugar-stage__resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 3;
}

.datagrid-sugar-stage__row-resize-handle {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: -3px;
  height: 6px;
  border-radius: 999px;
  cursor: row-resize;
  z-index: 3;
}

.datagrid-sugar-stage__drag {
  border: 0;
  background: transparent;
  color: var(--datagrid-text-muted, #94a3b8);
  cursor: grab;
  padding: 0 0.2rem 0 0;
  font-size: 0.85rem;
}

.datagrid-sugar-stage__checkbox {
  width: 0.9rem;
  height: 0.9rem;
  margin: 0;
}

.datagrid-sugar-stage__editor {
  width: 100%;
  border: 1px solid var(--datagrid-editor-border, rgba(148, 163, 184, 0.5));
  border-radius: 0.38rem;
  padding: 0.24rem 0.34rem;
  background: var(--datagrid-editor-bg, rgba(8, 10, 18, 0.96));
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-stage__selection-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  right: -4px;
  bottom: -4px;
  border-radius: 2px;
  background: #38bdf8;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.88);
  z-index: 5;
  cursor: crosshair;
}

.datagrid-sugar-stage__selection-handle.is-move {
  right: -4px;
  top: -4px;
  bottom: auto;
  background: #22c55e;
  cursor: grab;
}

.datagrid-sugar-stage__cell.is-pinned-left,
.datagrid-sugar-stage__cell.is-pinned-right {
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.88)) 82%, transparent);
}

.datagrid-sugar-stage__cell.is-pinned-left {
  box-shadow: 1px 0 0 color-mix(in srgb, var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.28)) 92%, transparent);
}

.datagrid-sugar-stage__cell.is-pinned-right {
  box-shadow: -1px 0 0 color-mix(in srgb, var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.28)) 92%, transparent);
}

.datagrid-sugar-stage__empty {
  padding: 0.8rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-stage__footer {
  border-top: 1px solid var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25));
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.55rem;
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.9)) 92%, transparent);
}

.datagrid-sugar-stage__footer button {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.3));
  border-radius: 0.45rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.28rem 0.5rem;
}

.datagrid-sugar-stage__footer span {
  font-size: 0.8rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-filter-popover {
  position: fixed;
  z-index: 146;
  min-width: 240px;
  max-width: 300px;
  display: grid;
  gap: 0.36rem;
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.62rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(15, 23, 42, 0.96)) 90%, rgba(2, 6, 23, 0.45));
  box-shadow: 0 16px 36px rgba(2, 6, 23, 0.42);
  padding: 0.52rem;
}

.datagrid-sugar-filter-popover h4 {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-filter-popover label {
  display: grid;
  gap: 0.14rem;
  font-size: 0.72rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-filter-popover input,
.datagrid-sugar-filter-popover select {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.32));
  border-radius: 0.36rem;
  background: color-mix(in srgb, var(--datagrid-editor-bg, rgba(8, 10, 18, 0.95)) 90%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.28rem 0.36rem;
  font-size: 0.74rem;
}

.datagrid-sugar-filter-popover__set {
  max-height: 240px;
  overflow: auto;
  display: grid;
  gap: 0.22rem;
}

.datagrid-sugar-filter-popover__set-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.26rem;
}

.datagrid-sugar-filter-popover__set-row .is-link {
  border: 0;
  background: transparent;
  color: #38bdf8;
  font-size: 0.68rem;
}

.datagrid-sugar-filter-popover__actions {
  display: flex;
  gap: 0.28rem;
}

.datagrid-sugar-filter-popover__actions button {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.3));
  border-radius: 0.34rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.22rem 0.38rem;
  font-size: 0.7rem;
}

.datagrid-sugar-filter-popover__actions button.is-primary {
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.56) 85%, transparent);
  background: color-mix(in srgb, rgba(56, 189, 248, 0.22) 82%, transparent);
  color: #dff6ff;
}

.datagrid-sugar-context {
  position: fixed;
  z-index: 140;
  min-width: 220px;
  display: grid;
  gap: 0.18rem;
  padding: 0.36rem;
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.68rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(15, 23, 42, 0.96)) 92%, transparent);
  box-shadow: 0 20px 44px rgba(2, 6, 23, 0.46);
}

.datagrid-sugar-context__group-title {
  margin: 0.16rem 0 0.1rem;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-context__item {
  border: 1px solid transparent;
  border-radius: 0.44rem;
  background: transparent;
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.3rem 0.42rem;
  text-align: left;
}

.datagrid-sugar-context__item:disabled {
  opacity: 0.45;
}
</style>
