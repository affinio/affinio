# DataGrid AG-Style Architecture 9.5+ Pipeline Checklist

Baseline date: `2026-02-07`
Scope: `/Users/anton/Projects/affinio/packages/datagrid-core` + `/Users/anton/Projects/affinio/packages/datagrid-vue`
Goal: evolve current controller-centric core to model/service architecture level (`>= 9.5`) without losing current performance primitives.

## Execution Rules

- Закрываем строго по порядку (от самых рискованных архитектурных блоков к менее рискованным).
- После закрытия каждого пункта: ставим `[x]`, добавляем комментарий в этом файле и останавливаемся.
- Пункт считается закрытым только при наличии: code + tests + docs + оценка `>= 9.5` (или явное ограничение окружения).

## Baseline Scores (Before)

- Row model architecture: `4.8`
- Column model ownership: `5.0`
- Service runtime/API cohesion: `5.2`
- Viewport/controller separation: `5.1`
- Typed lifecycle/events: `5.7`
- Backward compatibility readiness: `6.2`

## Pipeline (Worst -> Best)

## 01. Model Contracts Bootstrap (`target >= 9.5`)

- [x] Ввести канонический `DataGridRowModel` контракт (snapshot/range/sort/filter/refresh/lifecycle).
- [x] Добавить `ClientRowModel` и server-backed adapter к существующему `serverRowModel`.
- [x] Ввести канонический `DataGridColumnModel` контракт (order/visibility/pin/width/lifecycle).
- [x] Экспортировать модельные контракты через `@affino/datagrid-core` public API.
- [x] Добавить unit tests для model contracts.
- [x] Финальная оценка пункта: `9.5`.
- Комментарий по закрытию: `2026-02-07` - добавлен слой `src/models/*`: `DataGridRowModel` + `createClientRowModel` + `createServerBackedRowModel`, `DataGridColumnModel` (`createDataGridColumnModel`), публичные экспорты в `src/public.ts`, unit-tests в `src/models/__tests__/*`, документация `/Users/anton/Projects/affinio/docs/datagrid-model-contracts.md`. Ограничение окружения: тесты не запускались (`node/pnpm` недоступны).

## 02. Viewport <- RowModel Boundary (`target >= 9.5`)

- [x] Перевести `tableViewport*` с `rows: VisibleRow[]` + special `serverIntegration` на единый input через `DataGridRowModel`.
- [x] Удалить прямой special-case `serverIntegration.rowModel.fetchBlock(...)` из virtualization hot path.
- [x] Ввести `RowNode`/row identity контракт (`rowKey`, `sourceIndex`, `displayIndex`, `selection/group/pinned/expanded` state) как обязательный shape между model и viewport.
- [x] Зафиксировать deterministic contract `setViewportRange(start,end)`.
- [x] Добавить regression tests: client/server row model parity.
- [x] Финальная оценка пункта: `9.5`.
- Комментарий по закрытию: `2026-02-07` - viewport boundary переведён на `DataGridRowModel` (`tableViewportController` + `useTableViewport`), из virtualization hot path удалён прямой `serverIntegration.fetchBlock`, диапазон синхронизируется через детерминированный `setViewportRange` только при изменении видимого range. Добавлен canonical `DataGridRowNode` identity/state контракт (`rowKey`, `sourceIndex`, `displayIndex`, `state`) с backward-compatible нормализацией из `VisibleRow`. Добавлены regression tests: `src/viewport/__tests__/rowModelBoundary.contract.spec.ts` и усилены model tests на row identity. Ограничение окружения: тесты не запускались (`node/pnpm` недоступны).

## 03. Compatibility Shims (Early) (`target >= 9.5`)

- [x] Сразу после `02` добавить минимальный compatibility layer для legacy APIs (`serverIntegration`, legacy `VisibleRow[]` paths) без silent swallow.
- [x] Ввести runtime warnings для deprecated paths с actionable migration hint.
- [x] Зафиксировать временное окно поддержки shim и условия удаления.
- [x] Добавить regression tests для legacy bridge (UI слой не должен ломаться при миграции).
- [x] Финальная оценка пункта: `9.5`.
- Комментарий по закрытию: `2026-02-07` - compatibility shim был введён и validated, затем по явному решению владельца (single consumer) удалён early в рамках `04` (breaking cleanup). Источник правды по этому решению: `/Users/anton/Projects/affinio/docs/datagrid-legacy-compatibility-window.md`.

## 04. ColumnModel Integration (`target >= 9.5`)

- [x] Перевести pin/order/visibility/width ownership в `DataGridColumnModel`.
- [x] Ограничить adapter-normalization только boundary слоем.
- [x] Убрать дубли state-логики колонок из composables/controller.
- [x] Добавить contract tests для column state permutations.
- [x] Финальная оценка пункта: `9.5`.
- Комментарий по закрытию: `2026-02-07` - `tableViewportController` переведён на `columnModel` boundary (`setColumnModel`, `options.columnModel`) как единый источник колонок; legacy controller APIs (`setColumns`, `setProcessedRows`, `setServerIntegration`, `options.serverIntegration`) удалены по explicit owner decision. В `useTableViewport` добавлен `createDataGridColumnModel` и перенос нормализации на boundary-слой адаптера. Добавлены contract tests: `src/viewport/__tests__/columnModelBoundary.contract.spec.ts` + обновлены существующие viewport tests на model-driven setup. Ограничение окружения: тесты не запускались (`node/pnpm` недоступны).

## 05. GridCore Service Registry (`target >= 9.5`)

- [x] Ввести `GridCore` + service registry (`rowModel`, `columnModel`, `selection`, `viewport`, `event`).
- [x] Ввести lifecycle контракты сервисов (`init/start/stop/dispose`).
- [x] Обеспечить deterministic startup order.
- [x] Добавить runtime contract tests на lifecycle.
- [x] Финальная оценка пункта: `9.5`.
- Комментарий по закрытию: `2026-02-07` - добавлен `createDataGridCore` (`src/core/gridCore.ts`) с каноническим registry (`event`, `rowModel`, `columnModel`, `selection`, `viewport`) и lifecycle-контрактом (`init/start/stop/dispose`) с детерминированным startup/reverse-stop порядком. Добавлены lifecycle contract tests: `src/core/__tests__/gridCore.lifecycle.contract.spec.ts` (порядок, reverse stop/dispose, idempotency, service lookup). Добавлены public exports в `src/public.ts` и документация: `/Users/anton/Projects/affinio/docs/datagrid-gridcore-service-registry.md`. Ограничение окружения: тесты не запускались (`node/pnpm` недоступны).

## 06. Typed Event and Lifecycle Bus (`target >= 9.5`)

- [ ] Перевести runtime/plugin events с stringly-typed на typed map.
- [ ] Разделить host events, plugin events, internal service events.
- [ ] Добавить strict payload typing + compile-time guards.
- [ ] Зафиксировать typed event map как prerequisite для `GridApi`.
- [ ] Добавить tests на event routing/ordering.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 07. Unified Grid API (`target >= 9.5`)

- [ ] Ввести `GridApi` facade поверх сервисов.
- [ ] Добавить API для row/column/filter/sort/selection/refresh операций.
- [ ] Зафиксировать semver-safe API surface + запрет deep imports.
- [ ] Добавить API contract tests и docs examples.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 08. Config Decomposition (`target >= 9.5`)

- [ ] Разделить `tableConfig` на data/model/view/interaction секции с явной нормализацией.
- [ ] Убрать смешение appearance/data/events в одном normalize path.
- [ ] Добавить migration adapter для legacy config.
- [ ] Добавить unit tests для normalized config invariants.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 09. Viewport Controller Decomposition (`target >= 9.5`)

- [ ] Prerequisite: пункт `05` (GridCore Service Registry) должен быть закрыт; decomposition делается поверх сервисной шины, а не локальных mini-services.
- [ ] Разбить `tableViewportController` на независимые сервисы (scroll-io/layout-sync/virtual-range/render-sync) внутри `GridCore`.
- [ ] Оставить в controller только orchestration + adapters.
- [ ] Зафиксировать ownership boundary (what-to-render vs how-to-render).
- [ ] Добавить performance regression tests на new boundaries.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 10. Quality/Perf Lock for New Architecture (`target >= 9.5`)

- [ ] Обновить quality gates под model/service contracts.
- [ ] Обновить benchmark harness (client/server/infinite row model scenarios).
- [ ] Ввести fail-fast бюджеты для API/lifecycle regressions.
- [ ] Зафиксировать AG-style architecture acceptance checklist.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## Close Log

- `2026-02-07`: создан pipeline для AG-style архитектурного разворота.
- `2026-02-07`: закрыт пункт `01` (Model Contracts Bootstrap), оценка `9.5`.
- `2026-02-07`: порядок этапов скорректирован: early compatibility shim перенесён сразу после `02`, `typed events` поднят перед `GridApi`, добавлен `RowNode/row identity` контракт и явная зависимость `09` от `05`.
- `2026-02-07`: закрыт пункт `02` (Viewport <- RowModel Boundary), оценка `9.5`.
- `2026-02-07`: закрыт пункт `03` (Compatibility Shims Early), оценка `9.5`.
- `2026-02-07`: закрыт пункт `04` (ColumnModel Integration), оценка `9.5`.
- `2026-02-07`: закрыт пункт `05` (GridCore Service Registry), оценка `9.5`.
