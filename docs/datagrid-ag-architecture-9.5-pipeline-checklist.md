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

- [ ] Ввести канонический `DataGridRowModel` контракт (snapshot/range/sort/filter/refresh/lifecycle).
- [ ] Добавить `ClientRowModel` и server-backed adapter к существующему `serverRowModel`.
- [ ] Ввести канонический `DataGridColumnModel` контракт (order/visibility/pin/width/lifecycle).
- [ ] Экспортировать модельные контракты через `@affino/datagrid-core` public API.
- [ ] Добавить unit tests для model contracts.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 02. Viewport <- RowModel Boundary (`target >= 9.5`)

- [ ] Перевести `tableViewport*` с `rows: VisibleRow[]` + special `serverIntegration` на единый input через `DataGridRowModel`.
- [ ] Удалить прямой special-case `serverIntegration.rowModel.fetchBlock(...)` из virtualization hot path.
- [ ] Зафиксировать deterministic contract `setViewportRange(start,end)`.
- [ ] Добавить regression tests: client/server row model parity.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 03. ColumnModel Integration (`target >= 9.5`)

- [ ] Перевести pin/order/visibility/width ownership в `DataGridColumnModel`.
- [ ] Ограничить adapter-normalization только boundary слоем.
- [ ] Убрать дубли state-логики колонок из composables/controller.
- [ ] Добавить contract tests для column state permutations.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 04. GridCore Service Registry (`target >= 9.5`)

- [ ] Ввести `GridCore` + service registry (`rowModel`, `columnModel`, `selection`, `viewport`, `event`).
- [ ] Ввести lifecycle контракты сервисов (`init/start/stop/dispose`).
- [ ] Обеспечить deterministic startup order.
- [ ] Добавить runtime contract tests на lifecycle.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 05. Unified Grid API (`target >= 9.5`)

- [ ] Ввести `GridApi` facade поверх сервисов.
- [ ] Добавить API для row/column/filter/sort/selection/refresh операций.
- [ ] Зафиксировать semver-safe API surface + запрет deep imports.
- [ ] Добавить API contract tests и docs examples.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 06. Typed Event and Lifecycle Bus (`target >= 9.5`)

- [ ] Перевести runtime/plugin events с stringly-typed на typed map.
- [ ] Разделить host events, plugin events, internal service events.
- [ ] Добавить strict payload typing + compile-time guards.
- [ ] Добавить tests на event routing/ordering.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 07. Config Decomposition (`target >= 9.5`)

- [ ] Разделить `tableConfig` на data/model/view/interaction секции с явной нормализацией.
- [ ] Убрать смешение appearance/data/events в одном normalize path.
- [ ] Добавить migration adapter для legacy config.
- [ ] Добавить unit tests для normalized config invariants.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 08. Viewport Controller Decomposition (`target >= 9.5`)

- [ ] Разбить `tableViewportController` на независимые сервисы (scroll-io/layout-sync/virtual-range/render-sync).
- [ ] Оставить в controller только orchestration + adapters.
- [ ] Зафиксировать ownership boundary (what-to-render vs how-to-render).
- [ ] Добавить performance regression tests на new boundaries.
- [ ] Финальная оценка пункта: `>= 9.5`.
- Комментарий по закрытию: _pending_.

## 09. Compatibility and Migration Window (`target >= 9.5`)

- [ ] Добавить compatibility layer для legacy APIs (`serverIntegration`, legacy column paths).
- [ ] Подготовить migration guide с phased rollout.
- [ ] Добавить runtime warnings для deprecated paths.
- [ ] Зафиксировать removal timeline.
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
