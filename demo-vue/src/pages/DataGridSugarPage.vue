<script setup lang="ts">
import { ref } from "vue"
import type { DataGridColumnDef } from "@affino/datagrid-core"
import { AffinoDataGridSimple } from "@affino/datagrid-vue/components"
import type { AffinoDataGridFeatures, AffinoDataGridActionId } from "@affino/datagrid-vue"

interface SugarGridRow {
  rowId: string
  service: string
  owner: string
  region: string
  severity: "critical" | "high" | "medium" | "low"
  latencyMs: number
}

const columns = ref<readonly DataGridColumnDef[]>([
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
  { key: "region", label: "Region", width: 140 },
  { key: "severity", label: "Severity", width: 130 },
  { key: "latencyMs", label: "Latency (ms)", width: 130 },
])

const rows = ref<SugarGridRow[]>([
  { rowId: "r1", service: "edge-gateway", owner: "NOC", region: "us-east", severity: "medium", latencyMs: 72 },
  { rowId: "r2", service: "billing-api", owner: "Payments", region: "eu-central", severity: "high", latencyMs: 116 },
  { rowId: "r3", service: "search-core", owner: "Core", region: "us-west", severity: "low", latencyMs: 48 },
  { rowId: "r4", service: "session-store", owner: "Platform", region: "ap-south", severity: "critical", latencyMs: 189 },
  { rowId: "r5", service: "alerts-hub", owner: "SRE", region: "us-east", severity: "medium", latencyMs: 81 },
])

const status = ref("Ready")

const features: AffinoDataGridFeatures<SugarGridRow> = {
  selection: true,
  clipboard: {
    enabled: true,
    useSystemClipboard: false,
    serializeRows(nextRows) {
      return JSON.stringify(nextRows, null, 2)
    },
    parseRows(text) {
      try {
        const parsed = JSON.parse(text)
        return Array.isArray(parsed) ? (parsed as readonly SugarGridRow[]) : []
      } catch {
        return []
      }
    },
  },
  editing: {
    enabled: true,
    mode: "cell",
  },
}

const onAction = (payload: {
  actionId: AffinoDataGridActionId
  message: string
  affected: number
  ok: boolean
}) => {
  if (!payload.ok) {
    return
  }
  status.value = `${payload.message} (${payload.affected})`
}
</script>

<template>
  <section class="datagrid-sugar-page">
    <header class="datagrid-sugar-page__header">
      <p class="datagrid-sugar-page__eyebrow">DataGrid Vue Sugar</p>
      <h1>AffinoDataGridSimple</h1>
      <p>
        Junior-friendly wrapper: sorting, selection, clipboard, inline edit, and context menu are pre-wired.
      </p>
    </header>

    <AffinoDataGridSimple
      v-model:rows="rows"
      v-model:status="status"
      :columns="columns"
      :features="features"
      @action="onAction"
    />
  </section>
</template>

<style scoped>
.datagrid-sugar-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datagrid-sugar-page__header h1 {
  margin: 0.25rem 0;
}

.datagrid-sugar-page__header p {
  margin: 0;
}

.datagrid-sugar-page__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--datagrid-text-soft, #94a3b8);
}

:deep(.affino-datagrid-simple) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.affino-datagrid-simple__toolbar) {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.affino-datagrid-simple__toolbar-action) {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.25));
  background: var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45));
  color: var(--datagrid-text-primary, #e2e8f0);
  border-radius: 0.6rem;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
}

:deep(.affino-datagrid-simple__status) {
  color: var(--datagrid-text-soft, #94a3b8);
}

:deep(.affino-datagrid-simple__metrics) {
  display: flex;
  gap: 1rem;
  color: var(--datagrid-text-soft, #94a3b8);
  font-size: 0.9rem;
}

:deep(.affino-datagrid-simple__viewport) {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.25));
  border-radius: 0.85rem;
  overflow: auto;
}

:deep(.affino-datagrid-simple__table) {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

:deep(.affino-datagrid-simple__table th),
:deep(.affino-datagrid-simple__table td) {
  border-bottom: 1px solid var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25));
  padding: 0.5rem 0.6rem;
  text-align: left;
}

:deep(.affino-datagrid-simple__table th) {
  background: var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.9));
}

:deep(.affino-datagrid-simple__table th small) {
  margin-left: 0.4rem;
  color: var(--datagrid-text-muted, #94a3b8);
  font-size: 0.7rem;
}

:deep(.affino-datagrid-simple__row.is-selected) {
  background: var(--datagrid-selection-range-bg, rgba(56, 189, 248, 0.18));
}

:deep(.affino-datagrid-simple__editor) {
  width: 100%;
  border: 1px solid var(--datagrid-editor-border, rgba(148, 163, 184, 0.4));
  border-radius: 0.45rem;
  padding: 0.35rem 0.45rem;
  font: inherit;
  background: var(--datagrid-editor-bg, rgba(8, 10, 18, 0.92));
  color: var(--datagrid-text-primary, #e2e8f0);
}

:deep(.affino-datagrid-simple__menu) {
  position: fixed;
  z-index: 80;
  display: grid;
  gap: 0.2rem;
  min-width: 200px;
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.3));
  border-radius: 0.7rem;
  background: var(--datagrid-controls-bg, rgba(15, 23, 42, 0.95));
  box-shadow: 0 20px 48px rgba(2, 6, 23, 0.45);
  padding: 0.35rem;
}

:deep(.affino-datagrid-simple__menu-item) {
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--datagrid-text-primary, #e2e8f0);
  text-align: left;
  padding: 0.45rem 0.6rem;
  cursor: pointer;
}

:deep(.affino-datagrid-simple__menu-item:hover),
:deep(.affino-datagrid-simple__menu-item:focus-visible) {
  background: var(--datagrid-row-hover-bg, rgba(56, 189, 248, 0.18));
  outline: none;
}
</style>
