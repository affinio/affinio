---
title: Справочник advanced entrypoint Core
---

# Справочник advanced entrypoint Core

Эта страница — канонический reference по `@affino/datagrid-core/advanced`.

Используйте этот entrypoint, когда осознанно нужен низкоуровневый контроль runtime, viewport, transaction, adapter или a11y orchestration.

## Карта конструкторов

| Фабрика | Возвращает | Типовой сценарий |
| --- | --- | --- |
| `createDataGridRuntime(options)` | `DataGridRuntime` | Runtime host-событий + plugin bus с типизированными internal/host событиями. |
| `createDataGridAdapterRuntime(options)` | `DataGridAdapterRuntime` | Bridge для адаптеров фреймворка (vue/react/laravel/web-component event naming). |
| `createDataGridTransactionService(options)` | `DataGridTransactionService` | Standalone transaction engine с undo/redo и rollback safety. |
| `createDataGridA11yStateMachine(options)` | `DataGridA11yStateMachine` | Headless a11y-state-machine для фокуса и клавиатурной навигации grid. |
| `createDataGridViewportController(options)` | `DataGridViewportController` | Полная viewport virtualization orchestration + integration snapshots. |
| `createDataSourceBackedRowModel(options)` | `DataSourceBackedRowModel<T>` | Protocol-driven row model (pull/push/invalidation/backpressure). |

## `createDataGridRuntime(options)`

Основной контракт:

- Принимает host handlers, plugin context, optional plugins, internal hooks.
- Эмитит:
  - host events (`emitHost`/`emit`)
  - plugin events (`emitPlugin`, `onPlugin`)
- Lifecycle:
  - plugin event `runtime:initialized`
  - plugin event `runtime:disposing`

Используйте, когда нужен явный host-to-plugin orchestration с типизированными runtime internal events.

## `createDataGridAdapterRuntime(options)`

Основной контракт:

- `kind`: `vue | react | laravel | web-component`
- Маппинг host event names в adapter event names:
  - React сохраняет camelCase host names.
  - Vue/Laravel/Web Component по умолчанию используют kebab-case.
- Расширяет `DataGridRuntime` полями:
  - `kind`
  - `mapHostEventName(hostEvent)`

Используйте, когда naming/transport policy адаптера должен быть централизован и детерминирован.

## `createDataGridTransactionService(options)`

Основной контракт:

- Требует `execute(command, context)` handler.
- Поддерживает batching + history:
  - `beginBatch`
  - `commitBatch`
  - `rollbackBatch`
  - `applyTransaction`
  - `undo` / `redo`
- Snapshot:
  - `revision`
  - `pendingBatch`
  - `undoDepth`
  - `redoDepth`
  - `lastCommittedId`

Гарантия:

- каждая команда обязана содержать `rollbackPayload` (контракт rollback safety).

Используйте, когда мутации должны быть auditable/rollbackable и независимы от UI-фреймворка.

## `createDataGridA11yStateMachine(options)`

Основной контракт:

- Headless-состояние фокуса в grid:
  - `snapshot()`
  - `setDimensions`
  - `setFocusCell`
  - `focusGrid`
  - `dispatchKeyboard`
- ARIA snapshots:
  - `getGridAria()`
  - `getCellAria(cell)`
- Поддержка клавиатуры: arrows, home/end, page up/down, tab, enter, escape.

Используйте, когда нужна детерминированная a11y-логика для custom renderer без привязки к конкретному UI-слою.

## `createDataGridViewportController(options)`

Основной контракт:

- Lifecycle и подключение:
  - `attach` / `detach` / `dispose`
- Wiring моделей:
  - `setRowModel`
  - `setColumnModel`
- Virtualization и поведение:
  - `setVirtualizationEnabled`
  - `setRowHeightMode`
  - `setBaseRowHeight`
  - `scrollToRow` / `scrollToColumn`
- Integration snapshots:
  - `getVirtualWindow()`
  - `getIntegrationSnapshot()`
  - `getViewportSyncState()`

Используйте, когда нужен полный контроль viewport orchestration, pinned-зон, sync transforms и integration snapshots.

## `createDataSourceBackedRowModel(options)`

Также экспортируется из stable root; здесь отмечен, потому что advanced-интеграции часто комбинируют его с custom runtime/transport стратегиями.

Дополнительные возможности:

- `invalidateRange`
- `invalidateAll`
- `getBackpressureDiagnostics`

Используйте, когда lifecycle формирования строк задаётся backend pull/push invalidation протоколом.

## Группы advanced-утилит

`@affino/datagrid-core/advanced` также экспортирует low-level helpers:

- Selection geometry/policy:
  - `applyGroupSelectionPolicy`
  - `clampGridSelectionPoint`
  - `clampSelectionArea`
  - `createGridSelectionContextFromFlattenedRows`
  - `createGridSelectionRange`
  - `createGridSelectionRangeFromInput`
  - `normalizeGridSelectionRange`
- Event protocol envelope/tier helpers:
  - `DATAGRID_EVENT_TIERS`
  - `DATAGRID_EVENT_TIER_ENTRYPOINTS`
  - `createDataGridEventEnvelope`
  - `isDataGridEventTier`
- Public protocol codemod helper:
  - `transformDataGridPublicProtocolSource`

## Когда лучше использовать stable root

Предпочитайте `@affino/datagrid-core`, если интеграции нужны только:

- row/column models
- `DataGridApi`
- стандартная фильтрация/сортировка/группировка/pivot/агрегации
- типовые client/server/data-source сценарии без low-level runtime кастомизации

Используйте `advanced` только там, где действительно нужен контроль runtime internals и integration transport.
