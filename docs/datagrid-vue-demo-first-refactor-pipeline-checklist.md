# DataGrid Vue Demo-First Refactor Pipeline Checklist

Baseline date: `2026-02-08`  
Scope: `/Users/anton/Projects/affinio/demo-vue` + `/Users/anton/Projects/affinio/demo-laravel` + `/Users/anton/Projects/affinio/packages/datagrid-vue` + `/Users/anton/Projects/affinio/packages/datagrid-core`  
Goal: довести demo до эталонного UX, затем перенести лучшее в `@affino/datagrid-vue` и получить API уровня `>= 9.5` по удобству интеграции.

## Current Baseline

- Demo currently built directly on `@affino/datagrid-core` (not on `@affino/datagrid-vue`).
- `@affino/datagrid-vue` contains historical adapter artifacts and needs cleanup after demo behavior freeze.

## Execution Rules

- Закрываем строго one-by-one, по порядку.
- Каждый пункт закрывается только при наличии: code + tests + docs + final score.
- После закрытия пункта: ставим `[x]`, добавляем комментарий в этом файле, останавливаемся.
- Минимальная планка на пункт: `>= 9.5`.

## UX/DX Success Criteria (for final sign-off)

- Integrator can bootstrap grid in <= `15` lines for default scenario.
- No manual wiring of overlays/selection/fill-handle for standard usage.
- Excel-like interactions are deterministic under scroll/virtualization/pinning.
- Public API split is clear: `stable` vs `advanced` vs `internal`.

## Pipeline

## 01. Demo UX Completion (`target >= 9.5`)

- [x] Finish Excel-style selection parity (mouse, keyboard, drag to edge auto-scroll).
- [x] Finish fill-handle parity (preview, apply, edge auto-scroll, pinned behavior).
- [x] Stabilize inline edit flows (commit/cancel/blur/keyboard) without desync.
- [x] Eliminate visual artifacts (overlay jitter, pinned overlap, z-index conflicts).
- [x] Final score for step: `9.5`.
- Comment: `2026-02-08` - закрыт подпункт Excel-style selection parity в demo-vue: добавлены keyboard-cell navigation (arrows/tab/home/end/page), drag-range selection, edge auto-scroll по X/Y через RAF, selection extension по pointer outside viewport до границ таблицы. `2026-02-08` - закрыт подпункт fill-handle parity: добавлены fill preview/apply flow, edge auto-scroll во время fill-drag, и pinned-friendly handle/preview behavior через cell-level handle + preview highlighting. `2026-02-08` - закрыт подпункт inline edit stabilization: унифицирован commit/cancel flow, добавлен keyboard contract (`Enter/Escape/Tab`), tab-navigation между editable ячейками, commit на blur/scroll и защита от конфликтов с selection-drag. `2026-02-08` - закрыт подпункт visual artifacts: введен pixel-snap для overlay geometry и нормализован z-index/layering contract (`header > sticky cells > selection overlays > regular cells`) с отдельным приоритетом для editing/enum-trigger/fill-handle.

## 02. Demo Runtime Stability and Determinism (`target >= 9.5`)

- [x] Remove recursive/reactive feedback loops in demo runtime paths.
- [x] Lock deterministic behavior for scroll/resize/selection/fill interactions.
- [ ] Add regression scenarios for long vertical/horizontal sessions.
- [ ] Final score for step: `TBD`.
- Comment: `2026-02-08` - закрыт подпункт reactive feedback loops: в `demo-vue/src/pages/DataGridPage.vue` стабилизирован `virtualRange` (stable identity cache), `syncVisibleRows` переведен на dedupe + `requestAnimationFrame` scheduler (`scheduleVisibleRowsSync`), добавлены sync-cache guards и cleanup/cancel frame on unmount, что убирает избыточные реактивные циклы и повторные sync-pass без реального изменения rows/range. `2026-02-08` - закрыт подпункт deterministic interactions: добавлены guard-ы на повторные cell/range updates (`cellCoordsEqual`/`rangesEqual`), dedupe pointer-driven selection/fill updates, и `requestAnimationFrame`-scheduler для viewport resize measurement (`scheduleViewportMeasure`) с явным cleanup on unmount.

## 03. Demo Behavior Freeze (Contract) (`target >= 9.5`)

- [ ] Document canonical behavior contract from demo (selection/fill/edit/pinning/virtualization).
- [ ] Define must-pass acceptance matrix for Vue adapter parity.
- [ ] Freeze contract version `v1` before refactor starts.
- [ ] Final score for step: `TBD`.
- Comment: `TBD`.

## 04. datagrid-vue API Redesign for Integrator DX (`target >= 9.5`)

- [ ] Define minimal stable entrypoint for common usage.
- [ ] Move advanced hooks into explicit advanced namespace/entrypoint.
- [ ] Remove implicit legacy aliases from stable surface.
- [ ] Final score for step: `TBD`.
- Comment: `TBD`.

## 05. Port Demo-Proven Behavior into datagrid-vue (`target >= 9.5`)

- [ ] Port selection and fill-handle orchestration from demo to package runtime.
- [ ] Port keyboard navigation behavior with same contract semantics.
- [ ] Port overlay/pinned layering guarantees with same visual invariants.
- [ ] Final score for step: `TBD`.
- Comment: `TBD`.

## 06. Remove Legacy Artifacts and Dead Paths (`target >= 9.5`)

- [ ] Remove outdated adapter code paths that duplicate new runtime behavior.
- [ ] Remove deprecated/publicly confusing exports from root entrypoint.
- [ ] Keep only compatibility shims with explicit deprecation window.
- [ ] Final score for step: `TBD`.
- Comment: `TBD`.

## 07. Test and Quality Gates for datagrid-vue (`target >= 9.5`)

- [ ] Add contract tests against frozen demo behavior matrix.
- [ ] Add interaction tests for key UX paths (selection/fill/edit/pin/scroll).
- [ ] Add perf regression checks for selection/fill under virtualization.
- [ ] Final score for step: `TBD`.
- Comment: `TBD`.

## 08. Migrate Demos to datagrid-vue (Parity Proof) (`target >= 9.5`)

- [ ] Switch Vue demo to `@affino/datagrid-vue` stable API.
- [ ] Switch Laravel demo integration path to the same parity contract.
- [ ] Verify no UX/functionality regressions vs frozen demo contract.
- [ ] Final score for step: `TBD`.
- Comment: `TBD`.

## 09. Final DX Polish and Release Readiness (`target >= 9.5`)

- [ ] Publish concise getting-started docs with copy-paste examples.
- [ ] Publish migration notes from direct core wiring to datagrid-vue.
- [ ] Lock stable API list and deprecation policy for next releases.
- [ ] Final score for step: `TBD`.
- Comment: `TBD`.

## Close Log

- `2026-02-08`: checklist created and baseline strategy fixed (`demo-first -> refactor datagrid-vue`).
- `2026-02-08`: step `01` subtask `Excel-style selection parity` marked done.
- `2026-02-08`: step `01` subtask `fill-handle parity` marked done.
- `2026-02-08`: step `01` subtask `inline edit stabilization` marked done.
- `2026-02-08`: step `01` subtask `visual artifacts elimination` marked done.
- `2026-02-08`: step `01` fully closed with score `9.5`.
- `2026-02-08`: step `02` subtask `reactive feedback loops removal` marked done.
- `2026-02-08`: step `02` subtask `deterministic scroll/resize/selection/fill interactions` marked done.
