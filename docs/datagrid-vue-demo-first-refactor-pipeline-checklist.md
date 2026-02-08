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
- [x] Add regression scenarios for long vertical/horizontal sessions.
- [x] Final score for step: `9.5`.
- Comment: `2026-02-08` - закрыт подпункт reactive feedback loops: в `demo-vue/src/pages/DataGridPage.vue` стабилизирован `virtualRange` (stable identity cache), `syncVisibleRows` переведен на dedupe + `requestAnimationFrame` scheduler (`scheduleVisibleRowsSync`), добавлены sync-cache guards и cleanup/cancel frame on unmount, что убирает избыточные реактивные циклы и повторные sync-pass без реального изменения rows/range. `2026-02-08` - закрыт подпункт deterministic interactions: добавлены guard-ы на повторные cell/range updates (`cellCoordsEqual`/`rangesEqual`), dedupe pointer-driven selection/fill updates, и `requestAnimationFrame`-scheduler для viewport resize measurement (`scheduleViewportMeasure`) с явным cleanup on unmount. `2026-02-08` - закрыт подпункт long-session regressions: добавлен e2e набор `tests/e2e/datagrid.regression.spec.ts` (длинные vertical/horizontal scroll-сессии, проверка интерактивности и отсутствия page errors), сценарий включен в critical gate через `package.json` (`test:e2e:critical`). `2026-02-08` - шаг 02 закрыт с оценкой `9.5` по критериям детерминизма и регрессионного покрытия длительных сессий.

## 03. Demo Behavior Freeze (Contract) (`target >= 9.5`)

- [x] Document canonical behavior contract from demo (selection/fill/edit/pinning/virtualization).
- [x] Define must-pass acceptance matrix for Vue adapter parity.
- [x] Freeze contract version `v1` before refactor starts.
- [x] Final score for step: `9.5`.
- Comment: `2026-02-08` - закрыт подпункт canonical behavior contract: добавлен документ `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-canonical-behavior-contract.md`, где зафиксированы канонические правила demo для selection/fill/edit/pinning/layering/virtualization/determinism и наблюдаемые UI selectors для parity-проверок. `2026-02-08` - закрыт подпункт acceptance matrix: добавлен документ `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-acceptance-matrix.md` с обязательными parity-критериями (MUST PASS), test-id матрицей (`DG-VUE-PARITY-*`), coverage map и blocking rule для миграции в `@affino/datagrid-vue`. `2026-02-08` - закрыт подпункт freeze v1: добавлен freeze-manifest `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-contract-freeze-v1.md`, а canonical/matrix документы переведены в статус `frozen-v1` с явной ссылкой на freeze-артефакт и change policy. `2026-02-08` - шаг 03 закрыт с оценкой `9.5` (контракт, матрица и freeze-версия зафиксированы).

## 04. datagrid-vue API Redesign for Integrator DX (`target >= 9.5`)

- [x] Define minimal stable entrypoint for common usage.
- [x] Move advanced hooks into explicit advanced namespace/entrypoint.
- [x] Remove implicit legacy aliases from stable surface.
- [x] Final score for step: `9.5`.
- Comment: `2026-02-08` - закрыт подпункт minimal stable entrypoint: введен явный stable-alias `@affino/datagrid-vue/stable` (через `packages/datagrid-vue/src/stable.ts` и `package.json` exports), root entrypoint привязан к stable surface (`src/index.ts -> ./stable`), зафиксирован контракт эквивалентности root/stable в `packages/datagrid-vue/src/__tests__/publicApi.contract.spec.ts`, и обновлена документация (`packages/datagrid-vue/README.md`, `/Users/anton/Projects/affinio/docs/datagrid-vue-stable-entrypoint.md`). `2026-02-08` - закрыт подпункт advanced namespace: добавлен explicit entrypoint `@affino/datagrid-vue/advanced` (`packages/datagrid-vue/src/advanced.ts` + exports в `package.json`), куда вынесены power-user hooks (`useDataGridViewportBridge`, `useDataGridHeaderOrchestration`, `createDataGridHeaderBindings`, `useDataGridRowSelectionFacade`, `useDataGridFindReplaceFacade`). Добавлены contract tests на boundary (`packages/datagrid-vue/src/__tests__/advancedApi.contract.spec.ts`, усилен `publicApi.contract.spec.ts`) и документация (`/Users/anton/Projects/affinio/docs/datagrid-vue-advanced-entrypoint.md`). `2026-02-08` - закрыт подпункт remove legacy aliases: stable/root surface больше не экспортирует legacy-названия (`useTableSettingsStore`, `createPiniaTableSettingsAdapter`); введены canonical stable имена (`useDataGridSettingsStore`, `createDataGridSettingsAdapter`) в `packages/datagrid-vue/src/public.ts`, обновлен type-export (`DataGridOverlayTransformInput` без `UiTable*` alias экспорта), усилены public contract checks и обновлены migration-доки (`packages/datagrid-vue/README.md`, `/Users/anton/Projects/affinio/docs/datagrid-vue-stable-entrypoint.md`, `/Users/anton/Projects/affinio/docs/datagrid-vue-adapter-integration.md`). `2026-02-08` - шаг 04 закрыт с оценкой `9.5` (stable/advanced boundary и naming cleanup завершены).

## 05. Port Demo-Proven Behavior into datagrid-vue (`target >= 9.5`)

- [x] Port selection and fill-handle orchestration from demo to package runtime.
- [x] Port keyboard navigation behavior with same contract semantics.
- [x] Port overlay/pinned layering guarantees with same visual invariants.
- [x] Final score for step: `9.5`.
- Comment: `2026-02-08` - закрыт подпункт selection/fill-handle orchestration в `packages/datagrid-vue/src/composables/useTableSelection.ts`: добавлены dedupe guards для drag/fill target updates (`selectionFillOrchestration`), убраны лишние overlay refresh при autoscroll без фактического изменения selection state, и commit fill теперь выполняется только при meaningful preview (preview area != origin area). Добавлены контрактные тесты helper-слоя в `packages/datagrid-vue/src/composables/selection/__tests__/selectionFillOrchestration.spec.ts`. `2026-02-08` - закрыт подпункт keyboard navigation parity: `Tab/Home/End` переведены на navigable-column contract в `packages/datagrid-vue/src/composables/useTableSelection.ts` (`selectionKeyboardNavigation` helper), `Escape` теперь очищает selection state, `Enter/Shift+Enter` возвращены к Excel-style vertical move, `F2` добавлен как explicit edit trigger в `packages/datagrid-core/src/events/useTableEvents.ts`. Добавлены контрактные тесты: `packages/datagrid-vue/src/composables/selection/__tests__/selectionKeyboardNavigation.spec.ts` и `packages/datagrid-core/src/events/__tests__/useTableEvents.keyboard.contract.spec.ts`. `2026-02-08` - закрыт подпункт layering parity: в `packages/datagrid-core/src/styles/layout.css` введен явный layer-contract (`hover < overlay < pinned < header`) через CSS variables, overlay слой опущен ниже pinned surfaces, pinned surfaces получили явный background mask для стабильного скрытия overlay под pinned колонками. Добавлен контрактный тест `packages/datagrid-core/src/styles/__tests__/layoutLayering.contract.spec.ts` + `effects.css` привязан к layer variable для hover overlay. Шаг `05` закрыт с оценкой `9.5`.

## 06. Remove Legacy Artifacts and Dead Paths (`target >= 9.5`)

- [x] Remove outdated adapter code paths that duplicate new runtime behavior.
- [x] Remove deprecated/publicly confusing exports from root entrypoint.
- [x] Keep only compatibility shims with explicit deprecation window.
- [x] Final score for step: `9.5`.
- Comment: `2026-02-08` - закрыт подпункт remove duplicated runtime paths: legacy файлы `packages/datagrid-vue/src/components/UiTableViewport.vue` и `packages/datagrid-vue/src/components/UiTableRow.vue` переведены в thin shim wrappers на canonical runtime (`DataGridViewport.vue` и `UiTableRowSurface.vue`), чтобы убрать дублирующую реализацию без breaking deep-import compatibility. Добавлен контрактный тест shim-путей: `packages/datagrid-vue/src/components/__tests__/legacyShimPaths.contract.spec.ts`. `2026-02-08` - закрыт подпункт root export cleanup: из stable/root surface убраны публично-путающие helper-имена `buildSelectionOverlayTransform*`, добавлены canonical `buildDataGridOverlayTransform*` в `packages/datagrid-vue/src/public.ts`; обновлены контрактные проверки (`packages/datagrid-vue/src/__tests__/publicApi.contract.spec.ts`) и интеграционная документация (`packages/datagrid-vue/README.md`, `docs/datagrid-vue-stable-entrypoint.md`, `docs/datagrid-vue-adapter-integration.md`, `docs/datagrid-deterministic-integration-setup.md`, `docs/datagrid-migration-guide.md`). `2026-02-08` - закрыт подпункт explicit deprecation window: legacy shim exports в `packages/datagrid-vue/src/components/index.ts` получили явный policy-блок (`supported-until: 2026-08-31`, `removal-date: 2026-09-01`), добавлена контрактная проверка в `packages/datagrid-vue/src/components/__tests__/legacyShimPaths.contract.spec.ts`, синхронизирована документация в `packages/datagrid-vue/README.md` и `docs/datagrid-migration-guide.md`. Шаг `06` закрыт с оценкой `9.5`.

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
- `2026-02-08`: step `02` subtask `long vertical/horizontal regression scenarios` marked done.
- `2026-02-08`: step `02` fully closed with score `9.5`.
- `2026-02-08`: step `03` subtask `canonical behavior contract` marked done.
- `2026-02-08`: step `03` subtask `must-pass acceptance matrix` marked done.
- `2026-02-08`: step `03` subtask `freeze contract v1` marked done.
- `2026-02-08`: step `03` fully closed with score `9.5`.
- `2026-02-08`: step `04` subtask `minimal stable entrypoint for common usage` marked done.
- `2026-02-08`: step `04` subtask `advanced hooks explicit namespace/entrypoint` marked done.
- `2026-02-08`: step `04` subtask `remove implicit legacy aliases from stable surface` marked done.
- `2026-02-08`: step `04` fully closed with score `9.5`.
- `2026-02-08`: step `05` subtask `selection/fill-handle orchestration port` marked done.
- `2026-02-08`: step `05` subtask `keyboard navigation parity` marked done.
- `2026-02-08`: step `05` subtask `overlay/pinned layering parity` marked done.
- `2026-02-08`: step `05` fully closed with score `9.5`.
- `2026-02-08`: step `06` subtask `remove duplicated runtime adapter paths` marked done.
- `2026-02-08`: step `06` subtask `root export cleanup` marked done.
- `2026-02-08`: step `06` subtask `compatibility shims with explicit deprecation window` marked done.
- `2026-02-08`: step `06` fully closed with score `9.5`.
