---
title: Grid API
---

# Grid API

`DataGridApi` is the stable facade created by `createDataGridApi(...)`.
Contract is namespace-based (no flat legacy methods).

## Entry point

```ts
import { createDataGridApi, createDataGridCore } from "@affino/datagrid-core"

const core = createDataGridCore({
  services: {
    rowModel: { name: "rowModel", model: rowModel },
    columnModel: { name: "columnModel", model: columnModel },
  },
})

const api = createDataGridApi({ core })
await api.start()
```

## Top-level API shape

- `api.lifecycle`
- `api.capabilities`
- `api.rows.*`
- `api.columns.*`
- `api.view.*`
- `api.pivot.*`
- `api.selection.*`
- `api.transaction.*`
- `api.compute.*`
- `api.diagnostics.*`
- `api.meta.*`
- `api.policy.*`
- `api.plugins.*`
- `api.state.*`
- `api.events.*`
- lifecycle methods: `init()`, `start()`, `stop()`, `dispose()`

## Capabilities

`api.capabilities` is runtime-resolved:

- `patch`
- `dataMutation`
- `compute`
- `selection`
- `transaction`
- `histogram`
- `sortFilterBatch`

Use it to guard optional flows before capability-dependent calls.

## `api.rows` namespace

### Read + projection

| Method | Purpose |
| --- | --- |
| `getSnapshot()` | Full row-model snapshot (projection/pagination/diagnostics). |
| `getCount()` | Visible/projected row count. |
| `get(index)` | Row node by projected index. |
| `getRange(range)` | Row nodes for viewport range. |
| `getPagination()` | Pagination snapshot. |

### Data mutation

| Method | Purpose |
| --- | --- |
| `hasDataMutationSupport()` | Whether row model supports full data replacement/appends. |
| `setData(rows)` | Replace with new dataset. |
| `replaceData(rows)` | Alias-style full replacement. |
| `appendData(rows)` | Append rows. |
| `prependData(rows)` | Prepend rows. |

### Projection model controls

| Method | Purpose |
| --- | --- |
| `setPagination(input)` | Set/clear pagination model. |
| `setPageSize(pageSize)` | Update page size. |
| `setCurrentPage(page)` | Update current page index. |
| `setSortModel(sortModel)` | Set sort model. |
| `setFilterModel(filterModel)` | Set filter model. |
| `setSortAndFilterModel(input)` | Apply sort+filter together. |
| `setGroupBy(groupBy)` | Set grouping model. |
| `setAggregationModel(model)` | Set aggregation model. |
| `getAggregationModel()` | Read aggregation model. |
| `setGroupExpansion(snapshot)` | Set full expansion snapshot. |
| `toggleGroup(groupKey)` | Toggle one group. |
| `expandGroup(groupKey)` | Expand one group. |
| `collapseGroup(groupKey)` | Collapse one group. |
| `expandAllGroups()` | Expand all groups. |
| `collapseAllGroups()` | Collapse all groups. |

### Patch/edit flow

| Method | Purpose |
| --- | --- |
| `hasPatchSupport()` | Whether current row model supports patch capability. |
| `patch(updates, options?)` | Partial row updates (`rowId`-based). |
| `applyEdits(updates, options?)` | High-level edit flow with reapply policy. |
| `setAutoReapply(value)` | Set edit policy (`false` = freeze view by default). |
| `getAutoReapply()` | Read auto-reapply policy. |

## `api.columns` namespace

| Method | Purpose |
| --- | --- |
| `getSnapshot()` | Full column model snapshot. |
| `get(key)` | One column snapshot by key. |
| `setAll(columns)` | Replace full column definitions. |
| `setOrder(keys)` | Set column order. |
| `setVisibility(key, visible)` | Toggle visibility. |
| `setWidth(key, width)` | Set width (`null` resets). |
| `setPin(key, pin)` | Set pin (`left`/`right`/`none`). |
| `getHistogram(columnId, options?)` | Value histogram when supported. |

## `api.view` namespace

| Method | Purpose |
| --- | --- |
| `setViewportRange(range)` | Set logical viewport range. |
| `refresh(options?)` | Trigger row model refresh. |
| `reapply()` | Recompute projection (no data mutation). |
| `expandAllGroups()` | Convenience alias to rows namespace. |
| `collapseAllGroups()` | Convenience alias to rows namespace. |
| `refreshCellsByRowKeys(rowKeys, columnKeys, options?)` | Queue cell refresh by row/column keys. |
| `refreshCellsByRanges(ranges, options?)` | Queue cell refresh by explicit ranges. |
| `onCellsRefresh(listener)` | Subscribe to refresh batches for renderer layer. |

## `api.pivot` namespace

| Method | Purpose |
| --- | --- |
| `setModel(pivotModel)` | Enable/update/disable pivot (`null` disables). |
| `getModel()` | Read current pivot model. |
| `getCellDrilldown(input)` | Resolve source rows behind a pivot cell. |
| `exportLayout()` | Export pivot + query + column state snapshot. |
| `exportInterop()` | Export interop snapshot (layout + pivot columns + rows). |
| `importLayout(layout, options?)` | Restore exported layout state. |

## `api.selection` namespace

| Method | Purpose |
| --- | --- |
| `hasSupport()` | Whether selection service is available. |
| `getSnapshot()` | Read selection snapshot (`null` if unsupported). |
| `setSnapshot(snapshot)` | Replace selection snapshot. |
| `clear()` | Clear selection. |
| `summarize(options?)` | Aggregate selection (`count/sum/avg/...`) or `null`. |

## `api.transaction` namespace

| Method | Purpose |
| --- | --- |
| `hasSupport()` | Whether transaction service is available. |
| `getSnapshot()` | Read transaction snapshot or `null`. |
| `beginBatch(label?)` | Open transaction batch. |
| `commitBatch(batchId?)` | Commit one/all pending batches. |
| `rollbackBatch(batchId?)` | Roll back one/all pending batches. |
| `apply(transaction)` | Apply transaction entry. |
| `canUndo()` / `canRedo()` | Undo/redo capability checks. |
| `undo()` / `redo()` | Execute undo/redo. |

## `api.compute` namespace

| Method | Purpose |
| --- | --- |
| `hasSupport()` | Whether compute mode switching is supported. |
| `getMode()` | Current compute mode (`sync` / `worker`) or `null`. |
| `switchMode(mode)` | Attempt runtime compute mode switch. |
| `getDiagnostics()` | Compute transport diagnostics (`dispatch/fallback/...`). |

## `api.diagnostics` namespace

| Method | Purpose |
| --- | --- |
| `getAll()` | Aggregated diagnostics snapshot (`rowModel`, `compute`, `derivedCache`, `backpressure`). |

## `api.meta` namespace

| Method | Purpose |
| --- | --- |
| `getSchema()` | Runtime schema snapshot (row model kind + columns). |
| `getCapabilities()` | Same capability snapshot as `api.capabilities`. |
| `getRuntimeInfo()` | Lifecycle/runtime summary (revision/loading/viewport/projection mode/compute mode). |

## `api.policy` namespace

| Method | Purpose |
| --- | --- |
| `getProjectionMode()` | Current projection policy (`mutable` / `immutable` / `excel-like`). |
| `setProjectionMode(mode)` | Update projection policy. |

## `api.plugins` namespace

| Method | Purpose |
| --- | --- |
| `register(plugin)` | Register plugin on stable facade surface. |
| `unregister(id)` | Unregister by id. |
| `has(id)` | Probe registration. |
| `list()` | List registered plugin ids. |
| `clear()` | Remove all runtime-registered plugins. |

## `api.state` namespace

| Method | Purpose |
| --- | --- |
| `get()` | Unified state snapshot export. |
| `set(state, options?)` | Unified state restore (`applyColumns/applySelection/applyViewport/strict`). |

## `api.events` namespace

| Method | Purpose |
| --- | --- |
| `on(event, listener)` | Subscribe to typed public events. Returns unsubscribe function. |

Stable events:

- `rows:changed`
- `columns:changed`
- `projection:recomputed`
- `selection:changed`
- `pivot:changed`
- `transaction:changed`
- `viewport:changed`
- `state:imported`

## Semantics notes

- `rows.applyEdits(...)` mutates data (optionally with reapply policy).
- `view.reapply()` recomputes projection only.
- `pivot` is intentionally a separate analytical subsystem, not nested under `rows`.

## Advanced viewport integration

For geometry/overlay integrations use advanced API:

```ts
import { createDataGridViewportController } from "@affino/datagrid-core/advanced"

const viewport = createDataGridViewportController({ resolvePinMode })
const snapshot = viewport.getIntegrationSnapshot()
```
