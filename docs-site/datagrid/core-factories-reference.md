---
title: Core factories and contracts reference
---

# Core factories and contracts reference

This page is the technical reference for constructor-level API in `@affino/datagrid-core`.

Use it when you build headless integrations directly on Core.

## Stable entrypoint: constructor map

| Factory | Returns | Typical use |
| --- | --- | --- |
| `createDataGridCore(options?)` | `DataGridCore` | Compose service registry and lifecycle orchestration. |
| `createDataGridApi(options)` | `DataGridApi` | Namespace facade over rows/columns/pivot/selection/transaction/view. |
| `createClientRowModel(options?)` | `ClientRowModel<T>` | In-memory projection pipeline with sort/filter/group/pivot/aggregate/paginate. |
| `createDataGridColumnModel(options?)` | `DataGridColumnModel` | Column definitions, order, visibility, width, pin. |
| `createDataGridEditModel(options?)` | `DataGridEditModel` | Headless edit patch state and revision tracking. |
| `createServerBackedRowModel(options)` | `ServerBackedRowModel<T>` | Wrap pull/block server model into `DataGridRowModel`. |
| `createDataSourceBackedRowModel(options)` | `DataSourceBackedRowModel<T>` | Data source protocol driven row model (pull/push/invalidation/backpressure). |
| `createServerRowModel(options, config?)` | `ServerRowModel<T>` | Block cache + lazy-loading source model. |
| `createDataGridSelectionSummary(options)` | `DataGridSelectionSummarySnapshot` | Aggregation snapshot over selected cells. |

## `createDataGridCore(options?)`

### Input contract

`CreateDataGridCoreOptions`:

| Field | Type | Description |
| --- | --- | --- |
| `services` | `Partial<DataGridCoreServiceRegistry>` | Inject service instances by canonical key (`rowModel`, `columnModel`, etc.). |
| `startupOrder` | `readonly DataGridCoreServiceName[]` | Optional custom lifecycle order. Unknown/duplicate names are ignored. |

Canonical service names:

- `event`
- `rowModel`
- `columnModel`
- `edit`
- `transaction`
- `selection`
- `viewport`

### Output contract

`DataGridCore` exposes:

- `lifecycle.state`
- `lifecycle.startupOrder`
- `services`
- `init()`
- `start()`
- `stop()`
- `dispose()`
- `getService(name)`

### Example

```ts
import {
  createClientRowModel,
  createDataGridApi,
  createDataGridColumnModel,
  createDataGridCore,
} from "@affino/datagrid-core"

const rowModel = createClientRowModel({ rows: [] })
const columnModel = createDataGridColumnModel({ columns: [] })

const core = createDataGridCore({
  services: {
    rowModel: { name: "rowModel", model: rowModel },
    columnModel: { name: "columnModel", model: columnModel },
  },
})

await core.start()

const api = createDataGridApi({ core })
```

## `createDataGridApi(options)`

`createDataGridApi` supports two option shapes.

### A) From `core`

```ts
createDataGridApi({ core })
```

### B) From explicit dependencies

```ts
createDataGridApi({
  lifecycle,
  init,
  start,
  stop,
  dispose,
  rowModel,
  columnModel,
  viewportService,
  transactionService,
  selectionService,
})
```

Use this path when you do not use `createDataGridCore`, but still want unified API facade.

For full method-level `DataGridApi` reference, see:

- [/datagrid/grid-api](/datagrid/grid-api)

## `createClientRowModel(options?)`

### Input contract (`CreateClientRowModelOptions<T>`)

| Field | Description |
| --- | --- |
| `rows` | Initial rows (`DataGridRowNodeInput<T>[]`). |
| `resolveRowId` | Custom stable row id resolver. |
| `initialTreeData` | Tree mode (`path` or `parent`) with policies. |
| `initialSortModel` | Initial sort state. |
| `initialFilterModel` | Initial filter snapshot. |
| `initialGroupBy` | Initial group by spec. |
| `initialPivotModel` | Initial pivot model. |
| `initialAggregationModel` | Initial aggregation model. |
| `initialPagination` | Initial pagination input. |
| `performanceMode` | Projection performance mode hint. |
| `projectionPolicy` | Explicit projection policy override. |
| `fieldDependencies` | Field dependency graph edges for stage invalidation. |
| `computeMode` | Client compute mode (`main-thread` / worker-assisted path). |
| `computeTransport` | Compute transport bridge for non-main-thread mode. |

### Output contract highlights (`ClientRowModel<T>`)

- Inherits `DataGridRowModel<T>`
- Adds:
  - `setRows(rows)`
  - `setSortAndFilterModel(input)`
  - `getColumnHistogram(columnId, options?)`
  - `patchRows(updates, options?)`
  - `reorderRows(input)`
  - `getDerivedCacheDiagnostics()`
  - `getComputeDiagnostics()`

### Patch semantics

`DataGridClientRowPatchOptions` defaults are Excel-like:

- `recomputeSort?: false` by default
- `recomputeFilter?: false` by default
- `recomputeGroup?: false` by default

This keeps current projection stable during edits until explicit reapply.

### Example

```ts
const rowModel = createClientRowModel({
  rows,
  initialSortModel: [{ key: "service", direction: "asc" }],
  initialFilterModel: null,
})

rowModel.patchRows(
  [{ rowId: "r-1", data: { owner: "Platform" } }],
  { recomputeSort: false, recomputeFilter: false, recomputeGroup: false },
)
```

## `createDataGridColumnModel(options?)`

### Input

`CreateDataGridColumnModelOptions`:

- `columns?: readonly DataGridColumnDef[]`

### Output (`DataGridColumnModel`)

- `getSnapshot()`
- `getColumn(key)`
- `setColumns(columns)`
- `setColumnOrder(keys)`
- `setColumnVisibility(key, visible)`
- `setColumnWidth(key, width)`
- `setColumnPin(key, pin)`
- `subscribe(listener)`
- `dispose()`

### Example

```ts
const columnModel = createDataGridColumnModel({
  columns: [
    { key: "service", label: "Service", width: 220, pin: "left" },
    { key: "owner", label: "Owner", width: 180 },
  ],
})

columnModel.setColumnOrder(["owner", "service"])
columnModel.setColumnVisibility("owner", true)
```

## `createDataGridEditModel(options?)`

### Input

`CreateDataGridEditModelOptions`:

- `initialEdits?: readonly DataGridEditPatch[]`

### Output (`DataGridEditModel`)

- `getSnapshot()`
- `getEdit(rowId, columnKey)`
- `setEdit(patch)`
- `setEdits(patches)`
- `clearEdit(rowId, columnKey)`
- `clearAll()`
- `subscribe(listener)`
- `dispose()`

## Server/data-source row model constructors

### `createServerRowModel(options, config?)`

Use for block-based lazy loading and cache-oriented server fetch.

`ServerRowModelOptions<T>` key fields:

- `loadBlock({ start, limit, signal, background })`
- `blockSize`, `maxCacheBlocks`, `preloadThreshold`
- `onBlockLoaded`, `onError`, `onProgress`
- `adaptivePrefetch`, `adaptiveScrollTiming`

### `createServerBackedRowModel(options)`

Wraps a `ServerRowModel<T>` into `DataGridRowModel<T>`.

`CreateServerBackedRowModelOptions<T>` key fields:

- `source`
- `resolveRowId`
- `resolvePivotColumns`
- `initialSortModel`, `initialFilterModel`, `initialGroupBy`, `initialPivotModel`, `initialPagination`
- `rowCacheLimit`, `warmupBlockStep`

### `createDataSourceBackedRowModel(options)`

Protocol-driven row model for pull/push/invalidation pipelines.

`CreateDataSourceBackedRowModelOptions<T>` key fields:

- `dataSource`
- `resolveRowId`
- `initialSortModel`, `initialFilterModel`, `initialGroupBy`, `initialPivotModel`, `initialPagination`
- `initialTotal`
- `rowCacheLimit`

Extra methods on `DataSourceBackedRowModel<T>`:

- `invalidateRange(range)`
- `invalidateAll()`
- `getBackpressureDiagnostics()`

## Important pure helpers from stable entrypoint

Use these when you need deterministic preprocessing/normalization.

- Filtering:
  - `buildDataGridAdvancedFilterExpressionFromLegacyFilters`
  - `cloneDataGridFilterSnapshot`
  - `evaluateColumnPredicateFilter`
  - `evaluateDataGridAdvancedFilterExpression`
  - `normalizeDataGridAdvancedFilterExpression`
  - `serializeColumnValueToToken`
- Pivot:
  - `normalizePivotSpec`
  - `clonePivotSpec`
  - `isSamePivotSpec`
- Tree:
  - `normalizeTreeDataSpec`
  - `cloneTreeDataSpec`
  - `isSameTreeDataSpec`
- Pagination:
  - `normalizePaginationInput`
  - `buildPaginationSnapshot`

## Advanced entrypoint constructors (`@affino/datagrid-core/advanced`)

| Factory | Typical use |
| --- | --- |
| `createDataGridRuntime(options)` | Host/plugin runtime with typed host event emission. |
| `createDataGridAdapterRuntime(options)` | Adapter-kind specific event mapping (vue/react/laravel/web-component). |
| `createDataGridTransactionService(options)` | Standalone transaction engine (batch, undo/redo, rollback hooks). |
| `createDataGridViewportController(options)` | Full viewport orchestration and integration snapshot provider. |
| `createDataGridA11yStateMachine(options)` | Headless accessibility state and keyboard command handling. |
| `createDataSourceBackedRowModel(options)` | Also available in stable; advanced users often wire it with custom protocols. |

Use advanced entrypoint when you need lower-level lifecycle/runtime customization, not just stable app integration.
