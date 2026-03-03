---
title: Справочник фабрик и контрактов Core
---

# Справочник фабрик и контрактов Core

Эта страница — технический reference по constructor-level API в `@affino/datagrid-core`.

Используйте её, когда строите headless-интеграцию напрямую на Core.

## Stable entrypoint: карта фабрик

| Фабрика | Что возвращает | Типовой сценарий |
| --- | --- | --- |
| `createDataGridCore(options?)` | `DataGridCore` | Сборка service registry и orchestration жизненного цикла. |
| `createDataGridApi(options)` | `DataGridApi` | Namespace-фасад над lifecycle/rows/data/columns/view/pivot/selection/transaction/state/events/meta/policy/compute/diagnostics/plugins. |
| `createClientRowModel(options?)` | `ClientRowModel<T>` | In-memory pipeline: sort/filter/group/pivot/aggregate/paginate. |
| `createDataGridColumnModel(options?)` | `DataGridColumnModel` | Дефиниции колонок, order, visibility, width, pin. |
| `createDataGridEditModel(options?)` | `DataGridEditModel` | Headless-состояние edit patches и tracking ревизий. |
| `createServerBackedRowModel(options)` | `ServerBackedRowModel<T>` | Обёртка server model (pull/block) в `DataGridRowModel`. |
| `createDataSourceBackedRowModel(options)` | `DataSourceBackedRowModel<T>` | Data source protocol row model (pull/push/invalidation/backpressure). |
| `createServerRowModel(options, config?)` | `ServerRowModel<T>` | Block cache + lazy loading source model. |
| `createDataGridSelectionSummary(options)` | `DataGridSelectionSummarySnapshot` | Aggregation snapshot по выделенным ячейкам. |

## `createDataGridCore(options?)`

### Входной контракт

`CreateDataGridCoreOptions`:

| Поле | Тип | Описание |
| --- | --- | --- |
| `services` | `Partial<DataGridCoreServiceRegistry>` | Инъекция сервисов по canonical key (`rowModel`, `columnModel` и т.д.). |
| `startupOrder` | `readonly DataGridCoreServiceName[]` | Кастомный lifecycle order. Неизвестные и дубликаты игнорируются. |

Канонические имена сервисов:

- `event`
- `rowModel`
- `columnModel`
- `edit`
- `transaction`
- `selection`
- `viewport`

### Выходной контракт

`DataGridCore` предоставляет:

- `lifecycle.state`
- `lifecycle.startupOrder`
- `services`
- `init()`
- `start()`
- `stop()`
- `dispose()`
- `getService(name)`

### Пример

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

`createDataGridApi` поддерживает два формата опций.

### A) От `core`

```ts
createDataGridApi({ core })
```

### B) От явных зависимостей

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

Этот путь нужен, когда вы не используете `createDataGridCore`, но хотите единый API facade.

Полный method-level reference по `DataGridApi`:

- [/datagrid-ru/grid-api](/datagrid-ru/grid-api)

## `createClientRowModel(options?)`

### Входной контракт (`CreateClientRowModelOptions<T>`)

| Поле | Описание |
| --- | --- |
| `rows` | Начальные строки (`DataGridRowNodeInput<T>[]`). |
| `resolveRowId` | Кастомный стабильный resolver идентификатора строки. |
| `initialTreeData` | Tree mode (`path` или `parent`) с политиками. |
| `initialSortModel` | Начальное состояние сортировки. |
| `initialFilterModel` | Начальный filter snapshot. |
| `initialGroupBy` | Начальная group by спецификация. |
| `initialPivotModel` | Начальная pivot модель. |
| `initialAggregationModel` | Начальная aggregation модель. |
| `initialPagination` | Начальная pagination-конфигурация. |
| `performanceMode` | Подсказка performance mode для pipeline. |
| `projectionPolicy` | Явный override projection policy. |
| `fieldDependencies` | Dependency graph полей для stage invalidation. |
| `computeMode` | Режим вычислений (`main-thread` / worker-assisted). |
| `computeTransport` | Транспорт вычислений для non-main-thread режима. |

### Важные части выходного контракта (`ClientRowModel<T>`)

- Наследует `DataGridRowModel<T>`
- Добавляет:
  - `setRows(rows)`
  - `setSortAndFilterModel(input)`
  - `getColumnHistogram(columnId, options?)`
  - `patchRows(updates, options?)`
  - `reorderRows(input)`
  - `getDerivedCacheDiagnostics()`
  - `getComputeDiagnostics()`

### Patch-семантика

`DataGridClientRowPatchOptions` по умолчанию Excel-like:

- `recomputeSort?: false`
- `recomputeFilter?: false`
- `recomputeGroup?: false`

Это сохраняет текущую проекцию стабильной во время edit до явного reapply.

### Пример

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

### Вход

`CreateDataGridColumnModelOptions`:

- `columns?: readonly DataGridColumnDef[]`

### Выход (`DataGridColumnModel`)

- `getSnapshot()`
- `getColumn(key)`
- `setColumns(columns)`
- `setColumnOrder(keys)`
- `setColumnVisibility(key, visible)`
- `setColumnWidth(key, width)`
- `setColumnPin(key, pin)`
- `subscribe(listener)`
- `dispose()`

### Пример

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

### Вход

`CreateDataGridEditModelOptions`:

- `initialEdits?: readonly DataGridEditPatch[]`

### Выход (`DataGridEditModel`)

- `getSnapshot()`
- `getEdit(rowId, columnKey)`
- `setEdit(patch)`
- `setEdits(patches)`
- `clearEdit(rowId, columnKey)`
- `clearAll()`
- `subscribe(listener)`
- `dispose()`

## Server/data-source конструкторы row model

### `createServerRowModel(options, config?)`

Для block-based lazy loading и cache-oriented server fetch.

Ключевые поля `ServerRowModelOptions<T>`:

- `loadBlock({ start, limit, signal, background })`
- `blockSize`, `maxCacheBlocks`, `preloadThreshold`
- `onBlockLoaded`, `onError`, `onProgress`
- `adaptivePrefetch`, `adaptiveScrollTiming`

### `createServerBackedRowModel(options)`

Оборачивает `ServerRowModel<T>` в `DataGridRowModel<T>`.

Ключевые поля `CreateServerBackedRowModelOptions<T>`:

- `source`
- `resolveRowId`
- `resolvePivotColumns`
- `initialSortModel`, `initialFilterModel`, `initialGroupBy`, `initialPivotModel`, `initialPagination`
- `rowCacheLimit`, `warmupBlockStep`

### `createDataSourceBackedRowModel(options)`

Protocol-driven row model для pull/push/invalidation сценариев.

Ключевые поля `CreateDataSourceBackedRowModelOptions<T>`:

- `dataSource`
- `resolveRowId`
- `initialSortModel`, `initialFilterModel`, `initialGroupBy`, `initialPivotModel`, `initialPagination`
- `initialTotal`
- `rowCacheLimit`

Дополнительные методы на `DataSourceBackedRowModel<T>`:

- `invalidateRange(range)`
- `invalidateAll()`
- `getBackpressureDiagnostics()`

## Важные pure helpers из stable entrypoint

Используйте их, когда нужна детерминированная preprocessing/normalization логика.

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

## Конструкторы advanced entrypoint (`@affino/datagrid-core/advanced`)

| Фабрика | Типовой сценарий |
| --- | --- |
| `createDataGridRuntime(options)` | Host/plugin runtime с типизированной host event эмиссией. |
| `createDataGridAdapterRuntime(options)` | Adapter-kind специфичное mapping событий (vue/react/laravel/web-component). |
| `createDataGridTransactionService(options)` | Отдельный transaction engine (batch, undo/redo, rollback hooks). |
| `createDataGridViewportController(options)` | Полная viewport orchestration и integration snapshot provider. |
| `createDataGridA11yStateMachine(options)` | Headless a11y-state и keyboard command handling. |
| `createDataSourceBackedRowModel(options)` | Также есть в stable; в advanced чаще используется с custom protocols. |

Используйте advanced entrypoint, когда нужна низкоуровневая lifecycle/runtime настройка, а не только стабильная app-интеграция.
