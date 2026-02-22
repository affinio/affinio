# DataGrid AG Grid Parity Roadmap (Minimum)

Updated: `2026-02-10`
Scope: `@affino/datagrid-core` + `@affino/datagrid-vue` + demo parity baseline.
Goal: минимальный набор для AG Grid parity (community baseline + узкий enterprise минимум).

## Definition of Parity (Minimum)

- Все core UX сценарии не ломаются при: pinned + virtualization + long sessions.
- Keyboard-first сценарии полностью рабочие.
- Поведение детерминированно (без повторных side effects при идентичных input).
- Каждая фича закрыта: implementation + tests + docs note.
- Локальные adapter-интеграции используют stable API.

## Current Baseline (Already Done)

Covered by `docs/archive/datagrid/checklists/datagrid-sheets-baseline-feature-pipeline-checklist.md`:

- Selection (cell + range) + keyboard navigation.
- Sorting (single + multi) + API wiring.
- Quick filter + column filters (text/enum/number baseline).
- Column resize + auto-size.
- Clipboard: copy/paste/cut.
- Context menu (cell/range/header).
- Fill handle + move range drag.
- A11y pass for current features.
- Perf gates + regression bundles.
- GroupBy projection in row-model (client + server/data source).
- Transaction history (undo/redo) with keyboard bindings.

## Roadmap (Minimum AG Grid Parity)

## Priority Ladder (P0 -> P2)

- `P0` (release blockers): parity infra + hard gates + stable selectors.
- `P1` (community baseline gaps): rows/columns/filtering/edit/export parity.
- `P2` (production hardening + enterprise minimum): a11y/i18n/rtl + enterprise opt-in.

### Phase 0 — Parity Infrastructure (Now)

- [x] Publish a single parity matrix for AG Grid parity (not demo-only).
- [x] Add `quality:lock:datagrid:parity` gate: tests + perf + determinism + e2e.
- [x] Move demo parity selectors into `@affino/datagrid-vue` with stable IDs.

Exit criteria:
- Green parity matrix in CI, pinned+virtualized scenarios included.

Comment:
- `2026-02-10`: published cross-framework parity matrix in `/Users/anton/Projects/affinio/docs/datagrid-parity-matrix.md` (core + vue + laravel coverage rows).
- `2026-02-10`: added root parity lock command `quality:lock:datagrid:parity` in `/Users/anton/Projects/affinio/package.json`.
- `2026-02-10`: extracted canonical demo selector contract into `/Users/anton/Projects/affinio/packages/datagrid-vue/src/contracts/dataGridSelectors.ts`, exported via `@affino/datagrid-vue`, and updated demo/e2e consumers to use contract selectors.

### Phase 1 — Rows & Data (Community Baseline)

- [ ] Pagination (client-side) with page size + current page API.
- [ ] Row selection (single/multiple) with checkbox column + select all.
- [ ] Row numbers column (optional toggled column).
- [ ] Row dragging (basic reorder within client row model).
- [ ] Row height UX: fixed + auto mode with deterministic measurement.

Exit criteria:
- Row selection & pagination tested in pinned + virtualization.

### Phase 2 — Columns (Community Baseline)

- [ ] Column moving (drag reorder) + keyboard reorder fallback.
- [ ] Column visibility UI + API + persistence.
- [ ] Column state persistence (order/visibility/width/pin) via settings adapter.
- [ ] Column menu (per-column) with sort/filter/visibility/auto-size.

Exit criteria:
- Column moving works under pinned + horizontal virtualization.

### Phase 3 — Filtering (Community Baseline+)

- [ ] Add `date` and `set` filter types.
- [ ] Add floating filters (compact inline UI per column).
- [ ] External filter API (global predicate hook).

Exit criteria:
- Filter model fully round-trips through row-model snapshot (client + server).

### Phase 4 — Editing (Community Baseline+)

- [ ] Full row editing mode.
- [ ] Custom cell editor API (component registry + lifecycle hooks).
- [ ] Validation pipeline (sync/async), with UX for invalid cells.
- [ ] Edit navigation rules (Tab/Enter with validation and blocked cells).

Exit criteria:
- Editing flows covered by regression suite + undo/redo integration.

### Phase 5 — Export & Interop (Community Baseline)

- [ ] CSV export with column visibility + selection scoping.
- [ ] Clipboard integration for large ranges (streamed builder or chunked writes).
- [ ] Optional data import hook for paste (transform pipeline).

Exit criteria:
- CSV export deterministic and tested for filters/sorts.

### Phase 6 — Accessibility & I18n (Community Baseline)

- [ ] Screen reader audit & fixes (ARIA grid patterns).
- [ ] Localization hooks for labels + menu text.
- [ ] RTL layout support (pinned + overlays + scroll sync).

Exit criteria:
- A11y acceptance checklist + at least one screen reader pass.

### Phase 7 — Enterprise Minimum (Optional but “AG Grid parity” expectations)

- [ ] Aggregation (sum/min/max/avg/count) with group footers.
- [ ] Group footers + group total rows.
- [ ] Excel export (XLSX, basic styles).
- [ ] Tool panels: Columns + Filters.
- [ ] Master/Detail (basic, no advanced caching).

Exit criteria:
- Each feature implemented behind capability flags, off by default.

## Dependencies and Notes

- `infinite` and `viewport` row model kinds are intentionally not exposed until real implementations exist.
- Server-side row model is already in place; focus on UI and UX parity around it.
- Prefer expanding stable entrypoints, keep advanced/internal boundaries explicit.
- Each phase should add e2e coverage for pinned + virtualization + long-session stability.

## Suggested Ordering (Shortest Path)

1) Phase 1 (rows) + Phase 2 (columns) — core UX parity gap.
2) Phase 3 (filtering) — complete column filter matrix.
3) Phase 4 (editing) — custom editor + validation hooks.
4) Phase 5 (export) — CSV minimal parity.
5) Phase 6 (a11y/i18n) — production-readiness.
6) Phase 7 (enterprise minimum) — only if needed for parity claims.
