# DataGrid Affino UI Migration Checklist

Baseline date: `2026-02-07`
Scope: `/Users/anton/Projects/affinio/packages/datagrid-vue`
Goal: all DataGrid overlays/selectors use Affino primitives/components with integrator UX score `>= 9.0`.

## Rules

- Закрываем по одному пункту за шаг.
- После закрытия пункта: ставим `[x]`, добавляем короткий комментарий и останавливаемся.
- Пункт закрывается только если runtime-поведение и API совместимость сохранены.

## Pipeline

## 01. Column header popover -> `@affino/popover-vue` (`target >= 9.0`)

- [x] Перевести anchor/position/open-close на `usePopoverController` + `useFloatingPopover`.
- [x] Сохранить контракт `menu-open/menu-close` для внешних интеграций.
- [x] Убрать ручные window/document outside handlers и ручную геометрию поповера.
- [x] Финальная оценка пункта: `9.1`.
- Комментарий по закрытию: `2026-02-07` - `useColumnHeaderInteractions` переведен на Affino popover controller/floating bindings, синхронизация с внешним состоянием сохранена через suppress-flags и emit watchers.

## 02. Modal surfaces -> `@affino/dialog-vue` (`target >= 9.0`)

- [x] Перевести `UiModal` на `useDialogController` + focus orchestrator.
- [x] Подключить `FindModal`, `ReplaceModal`, `UiTableZoomControl`, `UiTableColumnVisibility` к новому `UiModal`.
- [x] Сохранить внешний контракт `open/title/close`.
- [x] Финальная оценка пункта: `9.0`.
- Комментарий по закрытию: `2026-02-07` - пользовательские модалки datagrid работают через единый Affino dialog-runtime и больше не поддерживают разрозненные телепорт-ветки.

## 03. Cell select editor -> Affino listbox primitives (`target >= 9.0`)

- [x] Заменить native `<select>` на headless listbox поверх `@affino/listbox-core`.
- [x] Использовать `@affino/popover-vue` для surface/teleport/position.
- [x] Сохранить текущий контракт `v-model` + `focus/open` + `blur` для cell editing.
- [x] Финальная оценка пункта: `9.0`.
- Комментарий по закрытию: `2026-02-07` - `UiSelect` переписан на Affino listbox state + popover surface; `UiTableCell` переключен на `:options` API, событие выбора расширено до `string | number | null` без изменения поведения редактирования ячейки.

## 04. Column action menu semantics -> `@affino/menu-vue` (`target >= 9.0`)

- [x] Заменить кнопку/список действий в `FilterPopover` на menu-вью слой Affino.
- [x] Закрыть nested pin menu через submenu-паттерн (`UiSubMenu`).
- [x] Сохранить существующие callbacks (`sort/group/pin/open-advanced/apply/cancel`).
- [x] Финальная оценка пункта: `9.0`.
- Комментарий по закрытию: `2026-02-07` - action-блок `FilterPopover` переведен на `@affino/menu-vue` (`UiMenuItem`, `UiSubMenu`, `UiSubMenuTrigger`, `UiSubMenuContent`) с сохранением существующих callback-обработчиков (`sort/group/pin`) и внешнего close-flow (`props.close()`), добавлена зависимость `@affino/menu-vue` в пакет `datagrid-vue`.

## 05. Regression and quality lock (`target >= 9.0`)

- [ ] Добавить/обновить тесты на keyboard navigation/select/escape/outside-close для нового `UiSelect`.
- [ ] Добавить e2e smoke сценарий открытия меню/модалок/селекта в datagrid.
- [ ] Зафиксировать docs-инструкцию по overlay host и teleport target.
- [ ] Финальная оценка пункта: `>= 9.0`.
- Комментарий по закрытию: _pending_.

## Close Log

- `2026-02-07`: создан checklist миграции datagrid UI на Affino primitives.
- `2026-02-07`: закрыт пункт `01`.
- `2026-02-07`: закрыт пункт `02`.
- `2026-02-07`: закрыт пункт `03`.
- `2026-02-07`: закрыт пункт `04`.
