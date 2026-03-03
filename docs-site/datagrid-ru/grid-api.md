---
title: Grid API
---

# Grid API

`DataGridApi` — стабильный фасад, создаваемый через `createDataGridApi(...)`.
Контракт namespace-ориентированный (без legacy flat-методов).

## Точка входа

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

## Верхнеуровневая форма API

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
- lifecycle-методы: `init()`, `start()`, `stop()`, `dispose()`

## Capabilities

`api.capabilities` определяется рантаймом:

- `patch`
- `dataMutation`
- `compute`
- `selection`
- `transaction`
- `histogram`
- `sortFilterBatch`

Используйте capabilities как guard перед опциональными вызовами.

## Namespace `api.rows`

### Чтение и состояние проекции

| Метод | Назначение |
| --- | --- |
| `getSnapshot()` | Полный snapshot row-model (projection/pagination/diagnostics). |
| `getCount()` | Количество видимых/спроецированных строк. |
| `get(index)` | Row node по индексу проекции. |
| `getRange(range)` | Диапазон row nodes в проекции. |
| `getPagination()` | Snapshot пагинации. |

### Мутация данных

| Метод | Назначение |
| --- | --- |
| `hasDataMutationSupport()` | Поддержка полного replacement/append/prepend датасета. |
| `setData(rows)` | Полностью заменить датасет. |
| `replaceData(rows)` | Полная замена (alias-стиль). |
| `appendData(rows)` | Добавить строки в конец. |
| `prependData(rows)` | Добавить строки в начало. |

### Управление моделью проекции

| Метод | Назначение |
| --- | --- |
| `setPagination(input)` | Установить/сбросить пагинацию. |
| `setPageSize(pageSize)` | Обновить размер страницы. |
| `setCurrentPage(page)` | Обновить индекс страницы. |
| `setSortModel(sortModel)` | Установить sort model. |
| `setFilterModel(filterModel)` | Установить filter model. |
| `setSortAndFilterModel(input)` | Применить sort+filter вместе. |
| `setGroupBy(groupBy)` | Установить group model. |
| `setAggregationModel(model)` | Установить aggregation model. |
| `getAggregationModel()` | Прочитать aggregation model. |
| `setGroupExpansion(snapshot)` | Установить snapshot раскрытия групп. |
| `toggleGroup(groupKey)` | Переключить группу. |
| `expandGroup(groupKey)` | Раскрыть группу. |
| `collapseGroup(groupKey)` | Свернуть группу. |
| `expandAllGroups()` | Раскрыть все группы. |
| `collapseAllGroups()` | Свернуть все группы. |

### Patch/edit поток

| Метод | Назначение |
| --- | --- |
| `hasPatchSupport()` | Проверка поддержки patch capability. |
| `patch(updates, options?)` | Частичные обновления строк по `rowId`. |
| `applyEdits(updates, options?)` | Высокоуровневый edit flow с reapply-политикой. |
| `setAutoReapply(value)` | Политика edit (`false` = freeze view по умолчанию). |
| `getAutoReapply()` | Текущая auto-reapply политика. |

## Namespace `api.columns`

| Метод | Назначение |
| --- | --- |
| `getSnapshot()` | Полный snapshot column model. |
| `get(key)` | Snapshot одной колонки. |
| `setAll(columns)` | Полностью заменить column definitions. |
| `setOrder(keys)` | Установить порядок колонок. |
| `setVisibility(key, visible)` | Переключить видимость. |
| `setWidth(key, width)` | Установить ширину (`null` = сброс). |
| `setPin(key, pin)` | Установить pin (`left`/`right`/`none`). |
| `getHistogram(columnId, options?)` | Гистограмма значений, если поддерживается. |

## Namespace `api.view`

| Метод | Назначение |
| --- | --- |
| `setViewportRange(range)` | Установить логический viewport range. |
| `refresh(options?)` | Запустить refresh row-model. |
| `reapply()` | Пересобрать проекцию (без мутации данных). |
| `expandAllGroups()` | Alias на rows namespace. |
| `collapseAllGroups()` | Alias на rows namespace. |
| `refreshCellsByRowKeys(rowKeys, columnKeys, options?)` | Refresh ячеек по row/column keys. |
| `refreshCellsByRanges(ranges, options?)` | Refresh ячеек по диапазонам. |
| `onCellsRefresh(listener)` | Подписка на refresh-батчи для renderer слоя. |

## Namespace `api.pivot`

| Метод | Назначение |
| --- | --- |
| `setModel(pivotModel)` | Включить/обновить/выключить pivot (`null` выключает). |
| `getModel()` | Получить текущую pivot model. |
| `getCellDrilldown(input)` | Получить source rows за pivot-ячейкой. |
| `exportLayout()` | Экспортировать pivot + query + column state snapshot. |
| `exportInterop()` | Экспортировать interop snapshot (layout + pivot columns + rows). |
| `importLayout(layout, options?)` | Восстановить layout. |

## Namespace `api.selection`

| Метод | Назначение |
| --- | --- |
| `hasSupport()` | Проверка доступности selection service. |
| `getSnapshot()` | Snapshot выделения (`null`, если не поддерживается). |
| `setSnapshot(snapshot)` | Установить snapshot выделения. |
| `clear()` | Очистить выделение. |
| `summarize(options?)` | Агрегировать выделение (`count/sum/avg/...`) или `null`. |

## Namespace `api.transaction`

| Метод | Назначение |
| --- | --- |
| `hasSupport()` | Проверка доступности transaction service. |
| `getSnapshot()` | Получить transaction snapshot или `null`. |
| `beginBatch(label?)` | Открыть transaction batch. |
| `commitBatch(batchId?)` | Закоммитить один/все pending batch. |
| `rollbackBatch(batchId?)` | Откатить один/все pending batch. |
| `apply(transaction)` | Применить transaction entry. |
| `canUndo()` / `canRedo()` | Проверка возможности undo/redo. |
| `undo()` / `redo()` | Выполнить undo/redo. |

## Namespace `api.compute`

| Метод | Назначение |
| --- | --- |
| `hasSupport()` | Поддерживается ли переключение compute mode. |
| `getMode()` | Текущий compute mode (`sync` / `worker`) или `null`. |
| `switchMode(mode)` | Попытка переключить compute mode во время работы. |
| `getDiagnostics()` | Диагностика compute transport (`dispatch/fallback/...`). |

## Namespace `api.diagnostics`

| Метод | Назначение |
| --- | --- |
| `getAll()` | Unified diagnostics snapshot (`rowModel`, `compute`, `derivedCache`, `backpressure`). |

## Namespace `api.meta`

| Метод | Назначение |
| --- | --- |
| `getSchema()` | Runtime schema snapshot (тип row model + колонки). |
| `getCapabilities()` | Тот же capability snapshot, что в `api.capabilities`. |
| `getRuntimeInfo()` | Runtime summary (revision/loading/viewport/projection mode/compute mode). |

## Namespace `api.policy`

| Метод | Назначение |
| --- | --- |
| `getProjectionMode()` | Текущая projection policy (`mutable` / `immutable` / `excel-like`). |
| `setProjectionMode(mode)` | Обновить projection policy. |

## Namespace `api.plugins`

| Метод | Назначение |
| --- | --- |
| `register(plugin)` | Зарегистрировать плагин в stable facade surface. |
| `unregister(id)` | Удалить регистрацию по id. |
| `has(id)` | Проверка регистрации. |
| `list()` | Список зарегистрированных plugin id. |
| `clear()` | Удалить все runtime-зарегистрированные плагины. |

## Namespace `api.state`

| Метод | Назначение |
| --- | --- |
| `get()` | Экспорт unified state snapshot. |
| `set(state, options?)` | Восстановить unified state (`applyColumns/applySelection/applyViewport/strict`). |

## Namespace `api.events`

| Метод | Назначение |
| --- | --- |
| `on(event, listener)` | Подписка на typed public events. Возвращает unsubscribe. |

Stable events:

- `rows:changed`
- `columns:changed`
- `projection:recomputed`
- `selection:changed`
- `pivot:changed`
- `transaction:changed`
- `viewport:changed`
- `state:imported`

## Семантика

- `rows.applyEdits(...)` мутирует данные (опционально с reapply-политикой).
- `view.reapply()` пересчитывает только проекцию.
- `pivot` — отдельная аналитическая подсистема, не вложена в `rows`.

## Advanced viewport integration

Для интеграций геометрии/overlay используйте advanced API:

```ts
import { createDataGridViewportController } from "@affino/datagrid-core/advanced"

const viewport = createDataGridViewportController({ resolvePinMode })
const snapshot = viewport.getIntegrationSnapshot()
```
