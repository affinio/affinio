import { createDataGridRuntime } from "@affino/datagrid-laravel"

const teardownByRoot = new WeakMap()

const TEAMS = ["core", "payments", "platform", "growth"]
const OWNERS = ["NOC", "SRE", "Payments", "Platform"]
const REGIONS = ["AMER", "EMEA", "APAC"]
const YEARS = ["2024", "2025", "2026"]
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

const SOURCE_COLUMNS = [
  { key: "region", label: "Region", width: 130, pin: "left" },
  { key: "team", label: "Team", width: 130, pin: "left" },
  { key: "owner", label: "Owner", width: 130 },
  { key: "year", label: "Year", width: 110 },
  { key: "quarter", label: "Quarter", width: 110 },
  { key: "orders", label: "Orders", width: 130 },
  { key: "revenue", label: "Revenue", width: 150 },
  { key: "latencyMs", label: "Latency ms", width: 130 },
]

const VALUE_PRESETS = {
  "revenue:sum": { field: "revenue", agg: "sum", label: "revenue:sum" },
  "orders:sum": { field: "orders", agg: "sum", label: "orders:sum" },
  "latencyMs:avg": { field: "latencyMs", agg: "avg", label: "latencyMs:avg" },
}

function resolveValuePreset(value) {
  if (!value || typeof value !== "object") {
    return "revenue:sum"
  }
  if (value.field === "orders" && value.agg === "sum") {
    return "orders:sum"
  }
  if (value.field === "latencyMs" && value.agg === "avg") {
    return "latencyMs:avg"
  }
  return "revenue:sum"
}

function toNumber(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function formatValue(value) {
  if (value == null) {
    return "—"
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "—"
    }
    if (Math.abs(value) >= 1000) {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }
  return String(value)
}

function buildRows(count, generation = 1) {
  const normalized = Math.max(60, Math.round(count))
  const rows = []
  for (let index = 0; index < normalized; index += 1) {
    const seed = index + generation * 17
    const region = REGIONS[index % REGIONS.length] ?? "AMER"
    const year = YEARS[Math.floor(index / REGIONS.length) % YEARS.length] ?? "2024"
    const quarter = QUARTERS[Math.floor(index / (REGIONS.length * YEARS.length)) % QUARTERS.length] ?? "Q1"
    const team = TEAMS[(Math.floor(index / (REGIONS.length * YEARS.length * QUARTERS.length)) + generation) % TEAMS.length] ?? "core"
    const owner = OWNERS[(seed + Math.floor(index / REGIONS.length)) % OWNERS.length] ?? "NOC"
    rows.push({
      rowId: `pivot-row-${generation}-${index + 1}`,
      region,
      team,
      owner,
      year,
      quarter,
      orders: 12 + ((seed * 11) % 260),
      revenue: 1800 + ((seed * 37) % 19000),
      latencyMs: 22 + ((seed * 17) % 340),
    })
  }
  return rows
}

function resolvePivotModel(root) {
  const enabledSelect = root.querySelector("[data-pivot-enabled]")
  const rowFieldPrimarySelect = root.querySelector("[data-pivot-row-field]")
  const rowFieldSecondarySelect = root.querySelector("[data-pivot-row-field-secondary]")
  const columnFieldSelect = root.querySelector("[data-pivot-column-field]")
  const columnFieldSecondarySelect = root.querySelector("[data-pivot-column-field-secondary]")
  const valuePresetSelect = root.querySelector("[data-pivot-value-preset]")
  const columnSubtotalsSelect = root.querySelector("[data-pivot-column-subtotals]")
  const columnGrandTotalSelect = root.querySelector("[data-pivot-column-grand-total]")
  const columnSubtotalPositionSelect = root.querySelector("[data-pivot-column-subtotal-position]")
  const columnGrandTotalPositionSelect = root.querySelector("[data-pivot-column-grand-total-position]")

  const enabled = String(enabledSelect?.value ?? "on") === "on"
  if (!enabled) {
    return null
  }
  const rowFieldPrimary = String(rowFieldPrimarySelect?.value ?? "region").trim()
  const rowFieldSecondary = String(rowFieldSecondarySelect?.value ?? "none").trim()
  const columnField = String(columnFieldSelect?.value ?? "year").trim()
  const columnFieldSecondary = String(columnFieldSecondarySelect?.value ?? "none").trim()
  const valuePresetKey = String(valuePresetSelect?.value ?? "revenue:sum").trim()
  const columnSubtotals = String(columnSubtotalsSelect?.value ?? "on") === "on"
  const columnGrandTotal = String(columnGrandTotalSelect?.value ?? "on") === "on"
  const columnSubtotalPosition = String(columnSubtotalPositionSelect?.value ?? "after").trim() === "before"
    ? "before"
    : "after"
  const columnGrandTotalPosition = String(columnGrandTotalPositionSelect?.value ?? "last").trim() === "first"
    ? "first"
    : "last"
  const valuePreset = VALUE_PRESETS[valuePresetKey] ?? VALUE_PRESETS["revenue:sum"]

  if (rowFieldPrimary === "none" || columnField === "none") {
    return null
  }

  const rowAxes = [rowFieldPrimary]
  if (rowFieldSecondary !== "none" && rowFieldSecondary !== rowFieldPrimary) {
    rowAxes.push(rowFieldSecondary)
  }
  const columnAxes = [columnField]
  if (columnFieldSecondary !== "none" && columnFieldSecondary !== columnField && !rowAxes.includes(columnFieldSecondary)) {
    columnAxes.push(columnFieldSecondary)
  }

  return {
    rows: rowAxes,
    columns: columnAxes,
    values: [{ field: valuePreset.field, agg: valuePreset.agg }],
    rowSubtotals: true,
    columnSubtotals,
    columnGrandTotal,
    columnSubtotalPosition,
    columnGrandTotalPosition,
    grandTotal: true,
  }
}

function mountPivotDemo(root) {
  if (!(root instanceof HTMLElement)) {
    return null
  }

  const sizeSelect = root.querySelector("[data-pivot-size]")
  const enabledSelect = root.querySelector("[data-pivot-enabled]")
  const rowFieldPrimarySelect = root.querySelector("[data-pivot-row-field]")
  const rowFieldSecondarySelect = root.querySelector("[data-pivot-row-field-secondary]")
  const columnFieldSelect = root.querySelector("[data-pivot-column-field]")
  const columnFieldSecondarySelect = root.querySelector("[data-pivot-column-field-secondary]")
  const valuePresetSelect = root.querySelector("[data-pivot-value-preset]")
  const columnSubtotalsSelect = root.querySelector("[data-pivot-column-subtotals]")
  const columnGrandTotalSelect = root.querySelector("[data-pivot-column-grand-total]")
  const columnSubtotalPositionSelect = root.querySelector("[data-pivot-column-subtotal-position]")
  const columnGrandTotalPositionSelect = root.querySelector("[data-pivot-column-grand-total-position]")
  const randomizeButton = root.querySelector("[data-pivot-randomize]")
  const expandButton = root.querySelector("[data-pivot-expand]")
  const collapseButton = root.querySelector("[data-pivot-collapse]")
  const saveLayoutButton = root.querySelector("[data-pivot-save-layout]")
  const reapplyLayoutButton = root.querySelector("[data-pivot-reapply-layout]")
  const resetButton = root.querySelector("[data-pivot-reset]")
  const headerHost = root.querySelector("[data-pivot-header]")
  const bodyHost = root.querySelector("[data-pivot-body]")
  const totalNode = root.querySelector("[data-pivot-total]")
  const pivotColumnsNode = root.querySelector("[data-pivot-pivot-columns]")
  const modelNode = root.querySelector("[data-pivot-model]")
  const statusNode = root.querySelector("[data-pivot-status]")
  const previewNode = root.querySelector("[data-pivot-column-preview]")
  const drilldownMetaNode = root.querySelector("[data-pivot-drilldown-meta]")
  const drilldownRowsNode = root.querySelector("[data-pivot-drilldown-rows]")

  if (
    !(sizeSelect instanceof HTMLSelectElement) ||
    !(enabledSelect instanceof HTMLSelectElement) ||
    !(rowFieldPrimarySelect instanceof HTMLSelectElement) ||
    !(rowFieldSecondarySelect instanceof HTMLSelectElement) ||
    !(columnFieldSelect instanceof HTMLSelectElement) ||
    !(columnFieldSecondarySelect instanceof HTMLSelectElement) ||
    !(valuePresetSelect instanceof HTMLSelectElement) ||
    !(columnSubtotalsSelect instanceof HTMLSelectElement) ||
    !(columnGrandTotalSelect instanceof HTMLSelectElement) ||
    !(columnSubtotalPositionSelect instanceof HTMLSelectElement) ||
    !(columnGrandTotalPositionSelect instanceof HTMLSelectElement) ||
    !(randomizeButton instanceof HTMLButtonElement) ||
    !(expandButton instanceof HTMLButtonElement) ||
    !(collapseButton instanceof HTMLButtonElement) ||
    !(saveLayoutButton instanceof HTMLButtonElement) ||
    !(reapplyLayoutButton instanceof HTMLButtonElement) ||
    !(resetButton instanceof HTMLButtonElement) ||
    !(headerHost instanceof HTMLElement) ||
    !(bodyHost instanceof HTMLElement)
  ) {
    return null
  }

  let generation = 1
  let rows = buildRows(toNumber(root.dataset.pivotInitialRows, 480), generation)
  let activeDrilldown = null
  let savedLayout = null
  const runtime = createDataGridRuntime({
    rows,
    columns: SOURCE_COLUMNS,
  })
  const { api } = runtime
  void api.start()

  const syncStatus = (message) => {
    if (statusNode instanceof HTMLElement) {
      statusNode.textContent = message
    }
  }

  const renderDrilldown = (drilldown) => {
    if (drilldownMetaNode instanceof HTMLElement) {
      if (!drilldown) {
        drilldownMetaNode.textContent = "Click a generated pivot cell in the table."
      } else {
        drilldownMetaNode.textContent = `${drilldown.columnLabel} · ${drilldown.agg}(${drilldown.valueField})=${formatValue(drilldown.cellValue)} · matches ${drilldown.matchCount}${drilldown.truncated ? " (truncated)" : ""}`
      }
    }
    if (drilldownRowsNode instanceof HTMLElement) {
      drilldownRowsNode.innerHTML = ""
      if (!drilldown || !Array.isArray(drilldown.rows) || drilldown.rows.length === 0) {
        const empty = document.createElement("li")
        empty.textContent = "No drilldown selected"
        drilldownRowsNode.appendChild(empty)
        return
      }
      for (const rowNode of drilldown.rows.slice(0, 12)) {
        const row = rowNode?.data ?? {}
        const li = document.createElement("li")
        li.textContent = `${String(row.rowId ?? rowNode.rowId ?? "row")} · ${String(row.region ?? "—")} / ${String(row.team ?? "—")} / ${String(row.owner ?? "—")} / ${String(row.year ?? "—")}-${String(row.quarter ?? "—")} · ${drilldown.valueField}=${formatValue(row[drilldown.valueField])}`
        drilldownRowsNode.appendChild(li)
      }
    }
  }

  const render = () => {
    const snapshot = api.rows.getSnapshot()
    const pivotModel = snapshot.pivotModel ?? null
    const pivotColumns = snapshot.pivotColumns ?? []
    const pivotColumnsById = new Map(pivotColumns.map(column => [column.id, column]))
    const expansionSnapshot = snapshot.groupExpansion
    const toggledGroupKeys = new Set(expansionSnapshot.toggledGroupKeys ?? [])
    const isGroupExpanded = (groupKey) => {
      if (typeof groupKey !== "string" || groupKey.length === 0) {
        return false
      }
      return expansionSnapshot.expandedByDefault
        ? !toggledGroupKeys.has(groupKey)
        : toggledGroupKeys.has(groupKey)
    }
    const rowCount = api.rows.getCount()
    const rowsInRange = rowCount > 0 ? api.rows.getRange({ start: 0, end: rowCount - 1 }) : []

    const displayColumns = []
    if (pivotModel && pivotModel.rows.length > 0) {
      for (const rowField of pivotModel.rows) {
        displayColumns.push({
          key: rowField,
          label: rowField,
        })
      }
      for (const pivotColumn of pivotColumns) {
        displayColumns.push({
          key: pivotColumn.id,
          label: pivotColumn.label,
        })
      }
    } else {
      for (const column of SOURCE_COLUMNS) {
        displayColumns.push({
          key: column.key,
          label: column.label ?? column.key,
        })
      }
    }

    headerHost.innerHTML = ""
    const headerRow = document.createElement("tr")
    for (const column of displayColumns) {
      const th = document.createElement("th")
      th.textContent = column.label
      headerRow.appendChild(th)
    }
    headerHost.appendChild(headerRow)

    bodyHost.innerHTML = ""
    const firstColumnKey = displayColumns[0]?.key ?? null
    for (const rowNode of rowsInRange) {
      const tr = document.createElement("tr")
      tr.dataset.kind = rowNode.kind
      for (let index = 0; index < displayColumns.length; index += 1) {
        const column = displayColumns[index]
        if (!column) {
          continue
        }
        const td = document.createElement("td")
        const value = rowNode.data?.[column.key]
        if (
          rowNode.kind === "group" &&
          firstColumnKey &&
          column.key === firstColumnKey &&
          typeof rowNode.groupMeta?.groupKey === "string"
        ) {
          const toggle = document.createElement("button")
          toggle.type = "button"
          toggle.className = "affino-datagrid-pivot__group-toggle"
          const expanded = isGroupExpanded(rowNode.groupMeta.groupKey)
          toggle.textContent = `${expanded ? "▾" : "▸"} ${formatValue(value)} (${rowNode.groupMeta.childrenCount ?? 0})`
          toggle.addEventListener("click", () => {
            api.rows.toggleGroup(rowNode.groupMeta.groupKey)
          })
          td.appendChild(toggle)
        } else {
          td.textContent = formatValue(value)
          if (pivotModel && rowNode.kind === "leaf" && pivotColumnsById.has(column.key)) {
            td.classList.add("is-clickable")
            td.title = "Open pivot drilldown"
            td.addEventListener("click", () => {
              const drilldown = api.pivot.getCellDrilldown({
                rowId: rowNode.rowId,
                columnId: column.key,
                limit: 50,
              })
              if (!drilldown) {
                activeDrilldown = null
                renderDrilldown(activeDrilldown)
                return
              }
              activeDrilldown = {
                ...drilldown,
                columnLabel: pivotColumnsById.get(column.key)?.label ?? column.key,
              }
              syncStatus(`Drilldown ${activeDrilldown.columnLabel}: ${drilldown.matchCount} rows`)
              renderDrilldown(activeDrilldown)
            })
          }
        }
        tr.appendChild(td)
      }
      bodyHost.appendChild(tr)
    }

    if (totalNode instanceof HTMLElement) {
      totalNode.textContent = String(rowCount)
    }
    if (pivotColumnsNode instanceof HTMLElement) {
      pivotColumnsNode.textContent = String(pivotColumns.length)
    }
    if (modelNode instanceof HTMLElement) {
      if (!pivotModel) {
        modelNode.textContent = "disabled"
      } else {
        const value = pivotModel.values[0]
        modelNode.textContent = `rows=${pivotModel.rows.join(",")} columns=${pivotModel.columns.join(",")} value=${value?.field}:${value?.agg} columnSubtotals=${pivotModel.columnSubtotals ? "on" : "off"} columnGrandTotal=${pivotModel.columnGrandTotal ? "on" : "off"} subtotalPos=${pivotModel.columnSubtotalPosition ?? "after"} grandTotalColPos=${pivotModel.columnGrandTotalPosition ?? "last"}`
      }
    }
    if (previewNode instanceof HTMLElement) {
      previewNode.innerHTML = ""
      if (pivotColumns.length === 0) {
        const empty = document.createElement("li")
        empty.textContent = "No pivot columns"
        previewNode.appendChild(empty)
      } else {
        for (const column of pivotColumns.slice(0, 8)) {
          const li = document.createElement("li")
          li.textContent = column.label
          previewNode.appendChild(li)
        }
      }
    }
    if (!pivotModel) {
      activeDrilldown = null
    } else if (activeDrilldown && !pivotColumnsById.has(activeDrilldown.columnId)) {
      activeDrilldown = null
    }
    renderDrilldown(activeDrilldown)
  }

  const applyControlValuesFromPivotModel = (pivotModel) => {
    if (!pivotModel) {
      enabledSelect.value = "off"
      return
    }
    enabledSelect.value = "on"
    rowFieldPrimarySelect.value = String(pivotModel.rows?.[0] ?? "region")
    rowFieldSecondarySelect.value = String(pivotModel.rows?.[1] ?? "none")
    columnFieldSelect.value = String(pivotModel.columns?.[0] ?? "year")
    columnFieldSecondarySelect.value = String(pivotModel.columns?.[1] ?? "none")
    valuePresetSelect.value = resolveValuePreset(pivotModel.values?.[0])
    columnSubtotalsSelect.value = pivotModel.columnSubtotals === true ? "on" : "off"
    columnGrandTotalSelect.value = pivotModel.columnGrandTotal === true ? "on" : "off"
    columnSubtotalPositionSelect.value = pivotModel.columnSubtotalPosition === "before" ? "before" : "after"
    columnGrandTotalPositionSelect.value = pivotModel.columnGrandTotalPosition === "first" ? "first" : "last"
  }

  const applyPivotModel = () => {
    if (enabledSelect.value === "on") {
      if (rowFieldSecondarySelect.value !== "none" && rowFieldSecondarySelect.value === rowFieldPrimarySelect.value) {
        rowFieldSecondarySelect.value = "none"
      }
      if (columnFieldSelect.value === rowFieldPrimarySelect.value || columnFieldSelect.value === rowFieldSecondarySelect.value) {
        const fallback = ["year", "quarter", "region", "team", "owner"].find(field => {
          return field !== rowFieldPrimarySelect.value && field !== rowFieldSecondarySelect.value
        })
        columnFieldSelect.value = fallback ?? "year"
      }
      if (columnFieldSecondarySelect.value !== "none") {
        const blocked = new Set([rowFieldPrimarySelect.value, rowFieldSecondarySelect.value, columnFieldSelect.value].filter(Boolean))
        if (blocked.has(columnFieldSecondarySelect.value)) {
          const fallback = ["quarter", "year", "region", "team", "owner"].find(field => !blocked.has(field))
          columnFieldSecondarySelect.value = fallback ?? "none"
        }
      }
    }
    const model = resolvePivotModel(root)
    api.pivot.setModel(model)
    if (!model) {
      syncStatus("Pivot disabled")
    } else {
      syncStatus(`Pivot applied: ${model.rows.join(",")} × ${model.columns.join(",")}`)
    }
    render()
  }

  const rebuildRows = (nextCount) => {
    generation += 1
    rows = buildRows(nextCount, generation)
    activeDrilldown = null
    api.rows.setData(rows)
    applyPivotModel()
  }

  const randomizeRows = () => {
    generation += 1
    rows = rows.map((row, index) => ({
      ...row,
      revenue: 1700 + (((index + generation) * 53) % 21000),
      orders: 10 + (((index + generation) * 9) % 280),
      latencyMs: 20 + (((index + generation) * 15) % 360),
    }))
    activeDrilldown = null
    api.rows.setData(rows)
    syncStatus("Values randomized")
    render()
  }

  const onControlsChange = () => applyPivotModel()
  const onSizeChange = () => rebuildRows(toNumber(sizeSelect.value, 480))
  const onRandomize = () => randomizeRows()
  const onExpand = () => {
    api.view.expandAllGroups()
    syncStatus("Pivot row groups expanded")
  }
  const onCollapse = () => {
    api.view.collapseAllGroups()
    syncStatus("Pivot row groups collapsed")
  }
  const onSaveLayout = () => {
    savedLayout = api.pivot.exportLayout()
    syncStatus(`Pivot layout saved (v${savedLayout.version})`)
  }
  const onReapplyLayout = () => {
    if (!savedLayout) {
      syncStatus("No saved pivot layout")
      return
    }
    api.pivot.importLayout(savedLayout)
    applyControlValuesFromPivotModel(savedLayout.pivotModel ?? null)
    activeDrilldown = null
    syncStatus("Saved pivot layout reapplied")
    render()
  }
  const onReset = () => {
    enabledSelect.value = "on"
    rowFieldPrimarySelect.value = "region"
    rowFieldSecondarySelect.value = "team"
    columnFieldSelect.value = "year"
    columnFieldSecondarySelect.value = "quarter"
    valuePresetSelect.value = "revenue:sum"
    columnSubtotalsSelect.value = "on"
    columnGrandTotalSelect.value = "on"
    columnSubtotalPositionSelect.value = "after"
    columnGrandTotalPositionSelect.value = "last"
    activeDrilldown = null
    applyPivotModel()
  }

  sizeSelect.addEventListener("change", onSizeChange)
  enabledSelect.addEventListener("change", onControlsChange)
  rowFieldPrimarySelect.addEventListener("change", onControlsChange)
  rowFieldSecondarySelect.addEventListener("change", onControlsChange)
  columnFieldSelect.addEventListener("change", onControlsChange)
  columnFieldSecondarySelect.addEventListener("change", onControlsChange)
  valuePresetSelect.addEventListener("change", onControlsChange)
  columnSubtotalsSelect.addEventListener("change", onControlsChange)
  columnGrandTotalSelect.addEventListener("change", onControlsChange)
  columnSubtotalPositionSelect.addEventListener("change", onControlsChange)
  columnGrandTotalPositionSelect.addEventListener("change", onControlsChange)
  randomizeButton.addEventListener("click", onRandomize)
  expandButton.addEventListener("click", onExpand)
  collapseButton.addEventListener("click", onCollapse)
  saveLayoutButton.addEventListener("click", onSaveLayout)
  reapplyLayoutButton.addEventListener("click", onReapplyLayout)
  resetButton.addEventListener("click", onReset)

  const unsubscribeEvents = [
    api.events.on("rows:changed", () => {
      render()
    }),
    api.events.on("projection:recomputed", () => {
      render()
    }),
  ]

  applyPivotModel()

  return () => {
    for (const unsubscribe of unsubscribeEvents) {
      unsubscribe()
    }
    sizeSelect.removeEventListener("change", onSizeChange)
    enabledSelect.removeEventListener("change", onControlsChange)
    rowFieldPrimarySelect.removeEventListener("change", onControlsChange)
    rowFieldSecondarySelect.removeEventListener("change", onControlsChange)
    columnFieldSelect.removeEventListener("change", onControlsChange)
    columnFieldSecondarySelect.removeEventListener("change", onControlsChange)
    valuePresetSelect.removeEventListener("change", onControlsChange)
    columnSubtotalsSelect.removeEventListener("change", onControlsChange)
    columnGrandTotalSelect.removeEventListener("change", onControlsChange)
    columnSubtotalPositionSelect.removeEventListener("change", onControlsChange)
    columnGrandTotalPositionSelect.removeEventListener("change", onControlsChange)
    randomizeButton.removeEventListener("click", onRandomize)
    expandButton.removeEventListener("click", onExpand)
    collapseButton.removeEventListener("click", onCollapse)
    saveLayoutButton.removeEventListener("click", onSaveLayout)
    reapplyLayoutButton.removeEventListener("click", onReapplyLayout)
    resetButton.removeEventListener("click", onReset)
    try {
      api.stop()
      api.dispose()
    } catch {
      // no-op
    }
  }
}

export function bootstrapAffinoDatagridPivotDemos(root = document) {
  if (!(root instanceof Document || root instanceof DocumentFragment || root instanceof HTMLElement)) {
    return
  }

  const roots = []
  if (root instanceof HTMLElement && root.matches("[data-affino-datagrid-pivot-demo]")) {
    roots.push(root)
  }
  root.querySelectorAll?.("[data-affino-datagrid-pivot-demo]").forEach(element => roots.push(element))

  roots.forEach(element => {
    if (!(element instanceof HTMLElement)) {
      return
    }
    const previous = teardownByRoot.get(element)
    if (typeof previous === "function") {
      previous()
      teardownByRoot.delete(element)
    }
    const teardown = mountPivotDemo(element)
    if (typeof teardown === "function") {
      teardownByRoot.set(element, teardown)
    }
  })
}
