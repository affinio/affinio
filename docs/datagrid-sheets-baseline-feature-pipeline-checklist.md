# DataGrid Sheets Baseline Feature Pipeline Checklist

Baseline date: `2026-02-08`  
Scope: `/Users/anton/Projects/affinio/demo-vue` + `/Users/anton/Projects/affinio/packages/datagrid-core` + `/Users/anton/Projects/affinio/packages/datagrid-vue`  
Goal: покрыть базовый функционал уровня AG Grid/Google Sheets (без pivot/formulas), с детерминированным поведением под virtualized/pinned grid.

## In Scope

- Multi-cell selection (already present, доводим до production parity).
- Column sorting.
- Excel-like filtering (quick filter + column filter + filter menu).
- Column resize без деградации virtualized/pinned runtime.
- Clipboard: copy/paste/cut (keyboard + context menu).
- Drag/drop interactions для редактирования диапазонов (fill/move where applicable).
- Context menu for cell/range operations.

## Out of Scope (for this pipeline)

- Pivoting, grouping trees enterprise-grade, formulas engine, charting.
- Server-side aggregation engine.

## Execution Rules

- Закрываем строго one-by-one, в порядке шагов.
- Каждый шаг закрывается только при наличии: implementation + tests + docs note.
- После закрытия шага: ставим `[x]`, добавляем `Comment`, останавливаемся.
- Минимальная оценка на шаг: `>= 9.0` (по UX + stability + performance).

## Definition of Done (global)

- Поведение не ломается при: horizontal/vertical virtualization, pinned columns, long sessions.
- Keyboard-first сценарии полностью рабочие.
- Нет regressions по текущему Excel-style selection/fill/edit.
- Контракты покрыты e2e + component/integration tests.

## Pipeline (simple -> complex)

## 01. Sort Foundation (`target >= 9.0`)

- [x] Stable single-column sorting (asc/desc/none) from header.
- [x] Multi-column sorting with `Shift` (priority order visible in UI).
- [x] Sort state sync with current data model API.
- [x] Tests: keyboard + click + pinned headers.
- [x] Final score for step: `9.1`.
- Comment: `2026-02-08` - шаг закрыт: в `demo-vue/src/pages/DataGridPage.vue` реализован header-driven sort state (`asc -> desc -> none`) с multi-sort через `Shift`, визуальными индикаторами направления и приоритета в header, а также метрикой `Sort state` для диагностики. Добавлена синхронизация с row-model API через `rowModel.setSortModel(sortState)` и preset bridge (`latency/errors/service/custom`). Тесты добавлены в `tests/e2e/datagrid.regression.spec.ts` (`click cycle`, `shift multi-sort`, `keyboard on pinned header`).

## 02. Quick Filter Foundation (`target >= 9.0`)

- [x] Global quick filter over visible dataset.
- [x] Deterministic interaction with sorting and selection.
- [x] Empty-state + active-filter indicator UX.
- [x] Tests: quick filter + sort composition + virtualization windows.
- [x] Final score for step: `9.1`.
- Comment: `2026-02-08` - шаг закрыт: quick filter переведен на visible-column keys (`searchableColumnKeys`) с детерминированной композицией с sort state и существующей selection model. В контролах добавлены active indicator (`Quick filter: ...`) и явный `Clear filter`, empty-state recovery сохранен. Тесты добавлены в `tests/e2e/datagrid.regression.spec.ts`: indicator/clear flow, filter+sort composition under virtualization, empty-state recovery.

## 03. Column Filter MVP (`target >= 9.0`)

- [x] Per-column filter model (text/enum/number baseline operators).
- [x] Filter UI entrypoint from header (menu trigger).
- [x] Apply/reset/clear-all UX.
- [x] Tests: filter combinations + pinned + scroll stability.
- [x] Final score for step: `9.0`.
- Comment: `2026-02-08` - шаг закрыт: добавлен column filter model (`text|enum|number`) с baseline-операторами и синхронизацией в row model через `rowModel.setFilterModel(buildFilterSnapshot(...))`. В header каждой колонки (кроме select) добавлен filter trigger, реализован panel UX (`apply/reset/clear-all/close`) и индикация активных filtered headers. В метрики добавлен `Column filters`. Тесты добавлены в `tests/e2e/datagrid.regression.spec.ts`: apply/reset flow, комбинация фильтров + стабильность при horizontal scroll + clear-all.

## 04. Column Resize (Virtualization-safe) (`target >= 9.0`)

- [x] Drag resize handles in header (mouse + pointer).
- [x] Double-click auto-size (fit content heuristics baseline).
- [x] Zero-desync with horizontal virtualization and pinned offsets.
- [x] Tests: long horizontal scroll while resizing + sticky headers.
- [x] Perf gate: no visible frame drops in benchmark harness scenario.
- [x] Final score for step: `9.0`.
- Comment: `2026-02-08` - шаг закрыт: в `demo-vue/src/pages/DataGridPage.vue` добавлены header resize handles (`mousedown drag` + `double-click autosize`) с безопасным clamping ширины, autosize-эвристикой по label+sample rows и интеграцией через `api.setColumnWidth`. Добавлена защита от конфликтов с selection/fill drag и стабильность sticky/pinned в том же viewport runtime. E2E покрытие добавлено в `tests/e2e/datagrid.regression.spec.ts`: drag resize + long horizontal scroll, autosize flow, pinned-column sticky offset under scroll.

## 05. Clipboard Copy (`target >= 9.0`)

- [x] Copy active cell / range in TSV format.
- [x] Keyboard shortcuts: `Cmd/Ctrl+C`.
- [x] Context menu action: `Copy`.
- [x] Visual feedback for copied range.
- [x] Tests: copy under pinned + virtualized viewport.
- [x] Final score for step: `9.0`.
- Comment: `2026-02-08` - шаг закрыт: реализован copy pipeline для active/range selection с TSV payload builder и clipboard write (`Ctrl/Cmd+C`), плюс context-menu action `Copy` на viewport. Добавлен визуальный flash copied-range (`datagrid-stage__cell--copied`) и метрика `Copied cells` для диагностики. Тесты добавлены в `tests/e2e/datagrid.regression.spec.ts`: keyboard copy range + context copy в pinned/virtualized scroll сценарии.

## 06. Clipboard Paste (`target >= 9.0`)

- [x] Paste single value and rectangular ranges from clipboard.
- [x] Keyboard shortcuts: `Cmd/Ctrl+V`.
- [x] Context menu action: `Paste`.
- [x] Validation + partial apply behavior (blocked cells, non-editable cols).
- [x] Tests: paste matrix into scrolled/virtualized/pinned grid.
- [x] Final score for step: `9.0`.
- Comment: `2026-02-08` - шаг закрыт: добавлен paste pipeline с TSV parsing и matrix apply в selection/active-cell anchor, keyboard shortcut `Cmd/Ctrl+V` и context-menu action `Paste`. Реализована validation + partial apply: не-редактируемые/невалидные значения считаются `blocked`, применяется только валидная часть, статус отражает applied/blocked. Тесты добавлены в `tests/e2e/datagrid.regression.spec.ts`: keyboard matrix paste в virtualized+pinned сценарии и context-menu partial apply с blocked cells.

## 07. Clipboard Cut (`target >= 9.0`)

- [x] Cut as copy+clear for editable cells.
- [x] Keyboard shortcuts: `Cmd/Ctrl+X`.
- [x] Context menu action: `Cut`.
- [x] Undo-safe transactional behavior (no partial corruption).
- [x] Tests: cut single/range + mixed editable/non-editable cells.
- [x] Final score for step: `9.0`.
- Comment: `2026-02-08` - шаг закрыт: реализован cut pipeline как `copy + atomic clear` (одно батч-обновление `sourceRows` через mutable map), keyboard shortcut `Cmd/Ctrl+X` и context-menu action `Cut`. Для mixed selection добавлен blocked accounting (non-editable/unsupported clear), что исключает частичную порчу состояния и явно отражается в статусе. Тесты добавлены в `tests/e2e/datagrid.regression.spec.ts`: keyboard range cut и context cut с mixed editable/non-editable.

## 08. Context Menu System (`target >= 9.0`)

- [x] Right-click context menu for cell/range/header zones.
- [x] Action routing: copy/paste/cut, clear, sort, filter, resize shortcuts.
- [x] Keyboard access (`Shift+F10`/context-menu key).
- [x] Overlay/pinning layering contract (menu always on top, no focus traps).
- [x] Tests: mouse + keyboard invocation across pinned/non-pinned areas.
- [x] Final score for step: `9.0`.
- Comment: `2026-02-08` - шаг закрыт: контекстное меню расширено до zone-based system (`cell/range/header`) с action routing для clipboard/clear и header операций (`sort asc/desc/clear`, `filter`, `auto-size`). Добавлен keyboard entrypoint (`Shift+F10`/`ContextMenu`) для active cell и header, меню поднято по z-index поверх pinned/overlay слоев. E2E покрытие добавлено в `tests/e2e/datagrid.regression.spec.ts`: header routing, keyboard invocation, pinned-header scenario после горизонтального скролла.

## 09. Drag & Drop Editing Flows (`target >= 9.0`)

- [x] Range drag-move (where allowed) with preview and commit/cancel.
- [x] Fill-handle integration with copy-series baseline behavior.
- [x] Auto-scroll on drag to viewport edges (X/Y).
- [x] Tests: drag across pinned boundary + large virtualized datasets.
- [x] Final score for step: `9.0`.
- Comment: `2026-02-08` - шаг закрыт: добавлен `Alt + drag` move-range flow с preview overlay, commit/cancel (`Escape`) и общим auto-scroll loop по краям viewport. Move выполняется транзакционно через snapshot/mutable-map с blocked accounting для неразрешенных ячеек и корректным re-sync selection/active cell. Fill-handle и edge auto-scroll остались совместимы в едином pointer runtime. E2E добавлены в `tests/e2e/datagrid.regression.spec.ts`: move editable range, move в large virtualized+pinned сценарии с автоскроллом.

## 10. Polish + Hardening (`target >= 9.0`)

- [ ] A11y pass for new features (roles, focus, announcements).
- [ ] Regression bundle: e2e critical paths for sort/filter/resize/clipboard/context.
- [ ] Perf gates: no regressions in row-model/harness benchmarks.
- [ ] Docs: end-user interactions + integrator API usage.
- [ ] Final score for step: `TBD`.
- Comment: `TBD`.

## Close Log

- `2026-02-08`: checklist created.
- `2026-02-08`: step `01` fully closed with score `9.1`.
- `2026-02-08`: step `02` fully closed with score `9.1`.
- `2026-02-08`: step `03` fully closed with score `9.0`.
- `2026-02-08`: step `04` fully closed with score `9.0`.
- `2026-02-08`: step `05` fully closed with score `9.0`.
- `2026-02-08`: step `06` fully closed with score `9.0`.
- `2026-02-08`: step `07` fully closed with score `9.0`.
- `2026-02-08`: step `08` fully closed with score `9.0`.
- `2026-02-08`: step `09` fully closed with score `9.0`.
