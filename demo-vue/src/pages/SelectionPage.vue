<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  clearSelection,
  extendSelectionToPoint,
  isCellSelected,
  selectSingleCell,
  toggleCellSelection,
  type GridSelectionContext,
} from '@affino/selection-core'
import { createSelectionStore } from '@/stores/selectionStore'

interface GridRow {
  id: string
  label: string
}

const columns = Array.from({ length: 8 }, (_, index) => ({
  key: `col-${index}`,
  label: formatColumn(index),
}))

const rows: GridRow[] = Array.from({ length: 12 }, (_, index) => ({
  id: `row-${index + 1}`,
  label: `Row ${index + 1}`,
}))

const context: GridSelectionContext<string> = {
  grid: { rowCount: rows.length, colCount: columns.length },
  getRowIdByIndex: (rowIndex: number) => rows[rowIndex]?.id ?? null,
}

const store = createSelectionStore<string>()

type SelectionSnapshot = ReturnType<typeof store.getState>
const selection = ref(store.getState())
const dragging = ref(false)
const gridShell = ref<HTMLDivElement | null>(null)
let unsubscribe: (() => void) | null = null

const stopDragging = () => {
  dragging.value = false
}

const focusGridShell = () => {
  gridShell.value?.focus({ preventScroll: true })
}

onMounted(() => {
  unsubscribe = store.subscribe((state: SelectionSnapshot) => {
    selection.value = state
  })
  store.applyResult(selectSingleCell({ point: { rowIndex: 0, colIndex: 0 }, context }))
  focusGridShell()
  window.addEventListener('pointerup', stopDragging)
})

onBeforeUnmount(() => {
  unsubscribe?.()
  window.removeEventListener('pointerup', stopDragging)
})

const selectedCellCount = computed(() =>
  selection.value.areas.reduce<number>((total, area) => {
    const rowsCovered = area.endRow - area.startRow + 1
    const colsCovered = area.endCol - area.startCol + 1
    return total + rowsCovered * colsCovered
  }, 0),
)

const activeRangeLabel = computed(() => {
  const { activeRangeIndex, ranges } = selection.value
  const range = activeRangeIndex >= 0 ? ranges[activeRangeIndex] : null
  if (!range) {
    return '—'
  }
  const start = `${formatColumn(range.startCol)}${range.startRow + 1}`
  const end = `${formatColumn(range.endCol)}${range.endRow + 1}`
  return start === end ? start : `${start} – ${end}`
})

const cursorLabel = computed(() => {
  const point = selection.value.selectedPoint
  if (!point) {
    return '—'
  }
  return `${formatColumn(point.colIndex)}${point.rowIndex + 1}`
})

const interactions = [
  { combo: 'Click', detail: 'start a fresh range' },
  { combo: 'Shift + Click', detail: 'extend from the current anchor' },
  { combo: 'Cmd / Ctrl + Click', detail: 'toggle any individual cell' },
  { combo: 'Drag', detail: 'paint a live rectangular selection' },
]

function formatColumn(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let label = ''
  let current = index
  do {
    label = alphabet[current % 26] + label
    current = Math.floor(current / 26) - 1
  } while (current >= 0)
  return label
}

function cellClasses(rowIndex: number, colIndex: number): string {
  const classes = ['grid-cell']
  if (isCellSelected(selection.value.areas, rowIndex, colIndex)) {
    classes.push('grid-cell--selected')
  }
  const cursor = selection.value.selectedPoint
  if (cursor && cursor.rowIndex === rowIndex && cursor.colIndex === colIndex) {
    classes.push('grid-cell--cursor')
  }
  return classes.join(' ')
}

function cellValue(rowIndex: number, colIndex: number): string {
  return `${formatColumn(colIndex)}${rowIndex + 1}`
}

function moveSelectionBy(rowStep: number, colStep: number, extend: boolean) {
  const rowCount = context.grid.rowCount
  const colCount = context.grid.colCount
  if (rowCount <= 0 || colCount <= 0) {
    return
  }

  const currentPoint = selection.value.selectedPoint ?? { rowIndex: 0, colIndex: 0 }
  const nextRow = Math.min(Math.max(currentPoint.rowIndex + rowStep, 0), rowCount - 1)
  const nextCol = Math.min(Math.max(currentPoint.colIndex + colStep, 0), colCount - 1)
  if (
    nextRow === currentPoint.rowIndex &&
    nextCol === currentPoint.colIndex &&
    selection.value.selectedPoint
  ) {
    return
  }

  const nextPoint = { rowIndex: nextRow, colIndex: nextCol }

  if (extend) {
    const state = store.peekState()
    if (state.ranges.length) {
      store.applyResult(
        extendSelectionToPoint({
          state,
          activeRangeIndex: state.activeRangeIndex,
          point: nextPoint,
          context,
        }),
      )
      focusGridShell()
      return
    }
  }

  store.applyResult(selectSingleCell({ point: nextPoint, context }))
  focusGridShell()
}

function handleGridKeydown(event: KeyboardEvent) {
  let rowDelta = 0
  let colDelta = 0
  switch (event.key) {
    case 'ArrowUp':
      rowDelta = -1
      break
    case 'ArrowDown':
      rowDelta = 1
      break
    case 'ArrowLeft':
      colDelta = -1
      break
    case 'ArrowRight':
      colDelta = 1
      break
    default:
      return
  }

  moveSelectionBy(rowDelta, colDelta, event.shiftKey)
  event.preventDefault()
}

function handlePointerDown(rowIndex: number, colIndex: number, event: PointerEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  focusGridShell()
  const point = { rowIndex, colIndex }
  const state = store.peekState()

  if (event.shiftKey && state.ranges.length) {
    store.applyResult(
      extendSelectionToPoint({
        state,
        activeRangeIndex: state.activeRangeIndex,
        point,
        context,
      }),
    )
  } else if (event.metaKey || event.ctrlKey) {
    store.applyResult(
      toggleCellSelection({
        state,
        point,
        context,
      }),
    )
  } else {
    store.applyResult(selectSingleCell({ point, context }))
    dragging.value = true
  }
}

function handlePointerEnter(rowIndex: number, colIndex: number) {
  if (!dragging.value) return
  const state = store.peekState()
  store.applyResult(
    extendSelectionToPoint({
      state,
      activeRangeIndex: state.activeRangeIndex,
      point: { rowIndex, colIndex },
      context,
    }),
  )
}

function handleReset() {
  store.applyResult(clearSelection({ context }))
}
</script>

<template>
  <section class="selection-page">
    <header class="selection-hero">
      <p class="selection-eyebrow">Selection core</p>

      <h2 class="selection-title">Deterministic grid selection.</h2>

      <p class="selection-body">
        This demo is wired directly to <strong>@affino/selection-core</strong>. All interactions are
        pure state transitions — the table only renders.
      </p>
      <div class="chip-row">
        <div v-for="interaction in interactions" :key="interaction.combo" class="interaction-chip">
          <span class="chip-combo">{{ interaction.combo }}</span>
          <span class="chip-detail">{{ interaction.detail }}</span>
        </div>
      </div>
    </header>

    <div class="selection-stage">
      <aside class="selection-status">
        <div class="status-header">
          <p class="status-label">Selected cells</p>
          <p class="status-value">{{ selectedCellCount }}</p>
        </div>
        <div class="status-grid">
          <div>
            <p class="status-label">Active range</p>
            <p class="status-pill">{{ activeRangeLabel }}</p>
          </div>
          <div>
            <p class="status-label">Cursor</p>
            <p class="status-pill">{{ cursorLabel }}</p>
          </div>
        </div>
        <button type="button" class="reset-button" @click="handleReset">Clear selection</button>
      </aside>

      <div
        ref="gridShell"
        class="grid-shell"
        role="grid"
        tabindex="0"
        aria-label="Selection grid"
        @pointerleave="stopDragging"
        @pointerdown="focusGridShell"
        @keydown="handleGridKeydown"
      >
        <table class="selection-grid" @pointerup="stopDragging">
          <thead>
            <tr>
              <th class="row-header" />
              <th v-for="column in columns" :key="column.key" class="col-header">
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in rows" :key="row.id">
              <th class="row-header">{{ row.label }}</th>
              <td
                v-for="(column, colIndex) in columns"
                :key="column.key"
                :class="cellClasses(rowIndex, colIndex)"
                @pointerdown.prevent="handlePointerDown(rowIndex, colIndex, $event as PointerEvent)"
                @pointerenter="handlePointerEnter(rowIndex, colIndex)"
              >
                {{ cellValue(rowIndex, colIndex) }}
              </td>
            </tr>
          </tbody>
        </table>
        <p class="text-xs uppercase tracking-[0.2em] mt-2 text-(--text-muted)">
          Powered by @affino/selection-core
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.selection-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 2rem 1.25rem 3rem;
}

.selection-hero {
  background: var(--surface-alt);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  padding: 2.25rem;
  box-shadow: var(--shadow-soft);
}

.selection-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.selection-title {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.selection-title h2 {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 600;
  margin: 0;
}

.powered-pill {
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent, #6d7cff) 60%, transparent);
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(109, 124, 255, 0.12);
  color: var(--accent, #c7d2ff);
}

.selection-body {
  max-width: 640px;
  font-size: 1rem;
  color: var(--text-muted);
}

.chip-row {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.interaction-chip {
  border-radius: 18px;
  border: 1px solid var(--glass-border);
  padding: 0.9rem 1rem;
  backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--panel, #0b0d16) 90%, transparent);
}

.chip-combo {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
}

.chip-detail {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.selection-stage {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 260px 1fr;
  align-items: stretch;
}

@media (max-width: 960px) {
  .selection-stage {
    grid-template-columns: 1fr;
  }
}

.selection-status {
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  padding: 1.5rem;
  background: var(--surface-card);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}

.status-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.status-label {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.status-value {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.status-pill {
  margin-top: 0.25rem;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  padding: 0.35rem 0.9rem;
  display: inline-flex;
  font-weight: 600;
  color: var(--text-primary);
}

.reset-button {
  margin-top: 0.5rem;

  border-radius: 999px;
  border: 1px dashed var(--glass-border);

  padding: 0.45rem 1.1rem;

  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  color: var(--text-soft);
  background: transparent;

  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.reset-button:hover {
  color: var(--text-primary);
  border-color: var(--glass-highlight);
  background: rgba(255, 255, 255, 0.04);
}

.reset-button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--accent) 40%, transparent);
}


.grid-shell {
  border-radius: 28px;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-soft);
  overflow: auto;
}

.selection-grid {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  color: var(--text-primary);
}

.selection-grid th,
.selection-grid td {
  border: 1px solid color-mix(in srgb, var(--glass-border) 80%, transparent);
  min-width: 60px;
  height: 48px;
  text-align: center;
  font-size: 0.9rem;
  user-select: none;
}

.col-header,
.row-header {
  font-weight: 600;
  background: color-mix(in srgb, var(--panel, #0b0d16) 85%, transparent);
  color: var(--text-muted);
  backdrop-filter: blur(6px);
  position: sticky;
  z-index: 1;
}

.col-header {
  top: 0;
}

.row-header {
  left: 0;
}

.grid-cell {
  background: var(--surface-card);
  transition: background 0.1s ease, box-shadow 0.1s ease;
}

.grid-cell:hover {
  background: var(--surface-card-strong);
}

.grid-cell--selected {
  background: color-mix(
    in srgb,
    var(--accent) 35%,
    var(--surface)
  );
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.25);
}

.grid-cell--cursor {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.9);
}
</style>
