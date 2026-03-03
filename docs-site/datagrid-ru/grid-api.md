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
- `api.data.*`
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
- `backpressureControl`
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
| `batch(fn)` | Явная bulk mutation граница с коалесированным facade event-cycle. |

## Namespace `api.data`

| Метод | Назначение |
| --- | --- |
| `hasBackpressureControlSupport()` | Поддерживает ли текущая модель backpressure controls. |
| `pause()` | Поставить на паузу pull/warmup pressure в поддерживаемых server/data-source моделях. |
| `resume()` | Снять паузу и обработать накопленный pending demand. |
| `flush()` | Детерминированно дренировать in-flight + pending очередь backpressure. |

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
| `apply(transaction, options?)` | Применить transaction entry (`options.signal` поддерживает abort до dispatch). |
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
| `getRowModelKind()` | Текущий тип row model (`client/server/data-source/worker-owned`). |
| `getApiVersion()` | Семантическая версия публичного API. |
| `getProtocolVersion()` | Семантическая версия публичного протокола. |
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
| `migrate(state, options?)` | Валидация/миграция внешнего payload к текущей версии unified state. |
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
- `state:import:begin`
- `state:import:end`
- `state:imported`
- `error`

## Runtime guarantees

### Snapshot isolation

- Публичные read-вызовы revision-consistent в рамках одного синхронного call stack.
- Если между чтениями нет мутаций (`rows.getSnapshot/getCount/getRange`, `state.get`, `meta.getRuntimeInfo`, `diagnostics.getAll`), вы читаете одну логическую revision.

### Mutation execution model

- Guarded high-impact операции сериализуются через lifecycle exclusivity:
  - `state.set(...)`
  - `compute.switchMode(...)`
  - transaction mutators (`begin/commit/rollback/apply/undo/redo`)
  - `rows.batch(...)`
- Негардированные row/query операции выполняются синхронно в стеке вызывающего кода.

### Event reentrancy

- Мутации из event handler разрешены.
- Reentrant event-эмиссии ставятся в FIFO-очередь и дренируются детерминированно.
- Исключения plugin handlers изолируются от core dispatch.
- Исключения прямых `api.events` listener-ов пробрасываются вызывающему коду.

## State import atomicity (`api.state.set`)

- `api.state.set(...)` — это логическая begin/end граница, а не single-event atomic payload.
- Event lifecycle для одного restore вызова:
  1. `state:import:begin`
  2. row/column/selection события во время применения restore
  3. `state:imported` при успешном применении
  4. `state:import:end`
- Подписчики на `rows:changed`/`columns:changed` могут видеть промежуточные стадии restore между begin/end.
- `state:import:end` означает, что синхронный apply-путь именно этого restore-вызова завершён.

## Policy enforcement matrix (`api.policy`)

| Operation | `mutable` | `immutable` | `excel-like` |
| --- | --- | --- | --- |
| `rows.patch(...)` | Разрешено; recompute flags контролирует вызывающий код | Блокируется facade guard | Разрешено |
| `rows.applyEdits(...)` (опции по умолчанию) | Разрешено; auto-reapply по умолчанию | Блокируется facade guard | Разрешено; freeze поведение по умолчанию |
| `rows.applyEdits(..., { reapply: true })` | Разрешено | Блокируется facade guard | Разрешено; явный reapply путь |
| `rows.setData/replaceData/appendData/prependData` | Разрешено | Блокируется facade guard | Разрешено |
| `rows.setSortModel/setFilterModel/setGroupBy` | Разрешено | Разрешено | Разрешено |
| `view.reapply()` | Разрешено | Разрешено | Разрешено |

Notes:

- `mutable` включает auto-reapply.
- `immutable` отключает data-mutation entrypoints на уровне facade.
- `excel-like` оставляет freeze-first editing semantics, но допускает явные reapply-сценарии.

## Concurrency model (`api.lifecycle`)

- `isBusy()` возвращает `true`, когда exclusive операция выполняется или уже стоит в очереди.
- `whenIdle()` резолвится после полного дренажа exclusive lifecycle queue.
- `runExclusive(fn)` ставит `fn` в exclusive queue и возвращает результат.

## Error model (`api.events.on("error")`)

- Recoverable guarded-сбои эмитятся как typed `error` events.
- Payload-контракт ошибки: `code`, `operation`, `recoverable`, `error`.
- Aborted guarded-мутаторы репортятся кодом `aborted` и `AbortError`.
- Фатальные programming errors по-прежнему могут бросаться напрямую (например, неверное использование вне guarded-paths).

## Plugin safety model (`api.plugins`)

- Плагины по умолчанию наблюдательные и получают только public event payloads.
- `onEvent` получает snapshot payload object (top-level immutable view для plugin callbacks).
- Исключения в plugin handlers изолируются и не останавливают core event dispatch.
- Мутировать состояние плагины могут только через public API; внутренний service registry не экспонируется.

## Дополнительная семантика

- `rows.applyEdits(...)` мутирует данные (опционально с reapply-политикой).
- `rows.patch(...)`, `rows.applyEdits(...)`, `transaction.apply(...)` поддерживают abort-before-dispatch через `options.signal`.
- `view.reapply()` пересчитывает только проекцию.
- `pivot` — отдельная аналитическая подсистема, не вложена в `rows`.

## Advanced viewport integration

Для интеграций геометрии/overlay используйте advanced API:

```ts
import { createDataGridViewportController } from "@affino/datagrid-core/advanced"

const viewport = createDataGridViewportController({ resolvePinMode })
const snapshot = viewport.getIntegrationSnapshot()
```
