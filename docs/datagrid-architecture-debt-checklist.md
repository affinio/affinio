# DataGrid Architecture Debt Checklist (v2)

Baseline date: `2026-02-07`
Scope: `/Users/anton/Projects/affinio/packages/datagrid-core` + `/Users/anton/Projects/affinio/packages/datagrid-vue`
Goal: close remaining architectural debt after 9.5 execution pipeline.

## Rules

- Закрываем по одному пункту за шаг.
- После закрытия пункта: ставим `[x]`, фиксируем оценку и комментарий, останавливаемся.
- Целевая оценка каждого пункта: `>= 9.0`.

## Backlog

## 01. Import Boundary Detox (`target >= 9.0`)

- [x] Убрать `@/...` alias-утечки из `datagrid-vue/src` (кроме README примеров).
- [x] Убрать legacy `@/ui-table/*` импорты в runtime исходниках.
- [x] Перевести cross-package core зависимости на `@affino/datagrid-core/*`.
- [x] Добавить локальные отсутствующие зависимости пакета (`useSelectableRows`, `useAutoResizeColumn`, `useFindReplaceStore`, UI primitives), чтобы исходники не зависели от demo alias.
- [x] Финальная оценка пункта: `9.1`.
- Комментарий по закрытию: `2026-02-07` - из `packages/datagrid-vue/src` устранены runtime alias-импорты `@/...` и `@/ui-table/*`; cross-package зависимости переведены на `@affino/datagrid-core/*` (включая imperative/selection/runtime modules). Добавлены недостающие локальные модули `src/composables/useSelectableRows.ts`, `src/composables/useAutoResizeColumn.ts`, `src/stores/useFindReplaceStore.ts`, а также UI-блоки `src/components/ui/*` (`VirtualList`, `VirtualList.types`, `LoadingSpinner`, `UiSelect`, `DraggableList`). Добавлены path alias для theme imports в `/Users/anton/Projects/affinio/tsconfig.base.json`. Метрика: `@/...` imports в `src` (без README) `29 -> 0`; `../../core|../../../core` imports `169 -> 0`.

## 02. DataGrid Component Decomposition (`target >= 9.0`)

- [ ] Разбить `DataGrid.vue` на feature blocks (header orchestration, row-selection, find/replace bridge, viewport bridge).
- [ ] Убрать неявные cross-feature side-effects из watcher-комбинаторики.
- [ ] Ввести тонкие facade hooks вместо прямой сборки всего runtime в одном SFC.
- [ ] Финальная оценка пункта: `>= 9.0`.
- Комментарий по закрытию: _pending_.

## 03. Selection Engine Facade (`target >= 9.0`)

- [ ] Сжать публичный контракт `useTableSelection` до узкого facade.
- [ ] Убрать прямое знание о DOM/render-подробностях из high-level API.
- [ ] Добавить contract docs для selection facade (input/output guarantees).
- [ ] Финальная оценка пункта: `>= 9.0`.
- Комментарий по закрытию: _pending_.

## 04. Theme Ownership Cleanup (`target >= 9.0`)

- [ ] Закрыть `TODO(theme)` и завершить вынос theme preset ownership из core-runtime слоя.
- [ ] Уточнить границу: tokens/theme utilities vs runtime logic.
- [ ] Зафиксировать docs по theme ownership.
- [ ] Финальная оценка пункта: `>= 9.0`.
- Комментарий по закрытию: _pending_.

## 05. Public Surface Hardening (`target >= 9.0`)

- [ ] Определить staged plan открытия component-level API в `@affino/datagrid-vue/public`.
- [ ] Добавить compatibility contract для deep imports (или запретить их формально).
- [ ] Добавить release guard на forbidden deep/runtime imports в package consumer path.
- [ ] Финальная оценка пункта: `>= 9.0`.
- Комментарий по закрытию: _pending_.

## Close Log

- `2026-02-07`: создан v2 debt checklist.
- `2026-02-07`: закрыт пункт `01` (import boundary detox + local missing module recovery).
