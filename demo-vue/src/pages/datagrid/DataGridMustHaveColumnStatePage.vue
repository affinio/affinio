<script setup lang="ts">
import { computed, ref } from "vue"
import { RouterLink } from "vue-router"
import {
  createInMemoryDataGridSettingsAdapter,
  type DataGridColumnDef,
  type DataGridColumnModelSnapshot,
  type DataGridColumnStateSnapshot,
} from "@affino/datagrid-core"
import { AffinoDataGridSimple } from "@affino/datagrid-vue/components"

interface IncidentRow {
  rowId: string
  service: string
  owner: string
  region: string
  severity: "critical" | "high" | "medium" | "low"
  latencyMs: number
}

interface ColumnStateApi {
  getColumnModelSnapshot: () => DataGridColumnModelSnapshot
  setColumnOrder: (keys: readonly string[]) => void
  setColumnVisibility: (key: string, visible: boolean) => void
  setColumnWidth: (key: string, width: number | null) => void
  setColumnPin: (key: string, pin: "left" | "right" | "none") => void
}

interface GridRefShape {
  api?: ColumnStateApi
}

const tableId = "must-have-column-state-demo"
const settingsAdapter = createInMemoryDataGridSettingsAdapter()

const columns = ref<readonly DataGridColumnDef[]>([
  { key: "service", label: "Service", width: 210 },
  { key: "owner", label: "Owner", width: 170 },
  { key: "region", label: "Region", width: 130 },
  { key: "severity", label: "Severity", width: 120 },
  { key: "latencyMs", label: "Latency", width: 120 },
])

const rows = ref<IncidentRow[]>(
  Array.from({ length: 60 }, (_, index) => {
    const id = index + 1
    const severity: IncidentRow["severity"][] = ["critical", "high", "medium", "low"]
    const regions = ["us-east", "us-west", "eu-central", "ap-south"]
    return {
      rowId: `row-${id}`,
      service: `svc-${(id % 17) + 1}`,
      owner: ["NOC", "SRE", "Core", "Platform"][id % 4] ?? "NOC",
      region: regions[id % regions.length] ?? "us-east",
      severity: severity[id % severity.length] ?? "medium",
      latencyMs: 50 + ((id * 11) % 200),
    }
  }),
)

const gridRef = ref<GridRefShape | null>(null)
const status = ref("Column state roundtrip ready")
const savedState = ref<DataGridColumnStateSnapshot | null>(null)

const savedStateJson = computed(() => JSON.stringify(savedState.value, null, 2))

const captureColumnState = (snapshot: DataGridColumnModelSnapshot): DataGridColumnStateSnapshot => {
  const visibility: Record<string, boolean> = {}
  const widths: Record<string, number> = {}
  const pinning: Record<string, "left" | "right" | "none"> = {}
  snapshot.columns.forEach(column => {
    visibility[column.key] = column.visible
    if (typeof column.width === "number") {
      widths[column.key] = column.width
    }
    pinning[column.key] = column.pin
  })
  return {
    order: [...snapshot.order],
    visibility,
    widths,
    pinning,
  }
}

const applyColumnState = (state: DataGridColumnStateSnapshot) => {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  api.setColumnOrder(state.order)
  Object.entries(state.visibility).forEach(([key, visible]) => {
    api.setColumnVisibility(key, visible)
  })
  Object.entries(state.widths).forEach(([key, width]) => {
    api.setColumnWidth(key, width)
  })
  Object.entries(state.pinning).forEach(([key, pin]) => {
    api.setColumnPin(key, pin)
  })
}

const mutateColumnState = () => {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  api.setColumnOrder(["owner", "service", "severity", "latencyMs", "region"])
  api.setColumnVisibility("region", false)
  api.setColumnWidth("service", 280)
  api.setColumnPin("owner", "left")
  status.value = "Mutated: order/visibility/width/pin changed"
}

const saveState = () => {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  const state = captureColumnState(api.getColumnModelSnapshot())
  settingsAdapter.setColumnState(tableId, state)
  savedState.value = settingsAdapter.getColumnState(tableId)
  status.value = "Column state persisted via DataGridSettingsAdapter"
}

const restoreState = () => {
  const state = settingsAdapter.getColumnState(tableId)
  if (!state) {
    status.value = "No persisted state yet"
    return
  }
  applyColumnState(state)
  savedState.value = state
  status.value = "Column state restored from DataGridSettingsAdapter"
}

const clearPersistedState = () => {
  settingsAdapter.setColumnState(tableId, null)
  savedState.value = null
  status.value = "Persisted state cleared"
}
</script>

<template>
  <section class="datagrid-musthave-column-state">
    <header class="datagrid-musthave-column-state__header">
      <p class="datagrid-musthave-column-state__eyebrow">DataGrid Must-Have · Scenario 03</p>
      <h1>Settings Adapter: Full Column State Roundtrip</h1>
      <p>Save/restore `order + visibility + width + pin` as one snapshot через `DataGridSettingsAdapter`.</p>
      <div class="datagrid-musthave-column-state__links">
        <RouterLink to="/datagrid/must-have/pagination">Pagination</RouterLink>
        <RouterLink to="/datagrid/must-have/filtering">Filtering</RouterLink>
        <RouterLink to="/datagrid/must-have/reorder">Reorder</RouterLink>
        <RouterLink to="/datagrid/must-have/row-height">Row-height</RouterLink>
      </div>
    </header>

    <div class="datagrid-musthave-column-state__layout">
      <aside class="datagrid-musthave-column-state__controls">
        <h2>Scenario controls</h2>
        <button type="button" @click="mutateColumnState">Mutate columns</button>
        <button type="button" @click="saveState">Save state</button>
        <button type="button" @click="restoreState">Restore state</button>
        <button type="button" @click="clearPersistedState">Clear saved state</button>

        <div class="datagrid-musthave-column-state__snapshot">
          <p>Saved snapshot</p>
          <pre>{{ savedStateJson }}</pre>
        </div>
      </aside>

      <main class="datagrid-musthave-column-state__grid">
        <AffinoDataGridSimple
          ref="gridRef"
          v-model:rows="rows"
          v-model:status="status"
          :columns="columns"
          :features="{ selection: false, clipboard: false, editing: false }"
          :show-toolbar="false"
        />
      </main>
    </div>
  </section>
</template>

<style scoped>
.datagrid-musthave-column-state {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datagrid-musthave-column-state__header h1 {
  margin: 0.25rem 0;
}

.datagrid-musthave-column-state__header p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-musthave-column-state__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-musthave-column-state__links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.7rem;
}

.datagrid-musthave-column-state__layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 1rem;
  min-height: 560px;
}

.datagrid-musthave-column-state__controls {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.datagrid-musthave-column-state__controls h2 {
  margin: 0;
  font-size: 1rem;
}

.datagrid-musthave-column-state__controls button {
  border: 1px solid var(--glass-border);
  border-radius: 0.55rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  color: var(--text-primary);
  padding: 0.48rem 0.58rem;
  cursor: pointer;
}

.datagrid-musthave-column-state__snapshot p {
  margin: 0.35rem 0 0.4rem;
  font-size: 0.82rem;
  color: var(--text-soft);
}

.datagrid-musthave-column-state__snapshot pre {
  margin: 0;
  border: 1px solid var(--glass-border);
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  padding: 0.55rem;
  font-size: 0.72rem;
  overflow: auto;
  max-height: 220px;
}

.datagrid-musthave-column-state__grid {
  min-width: 0;
}

:deep(.affino-datagrid-simple__viewport) {
  max-height: calc(100vh - 290px);
}

@media (max-width: 1100px) {
  .datagrid-musthave-column-state__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
