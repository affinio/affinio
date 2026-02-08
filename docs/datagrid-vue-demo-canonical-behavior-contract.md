# DataGrid Vue Demo Canonical Behavior Contract

Baseline date: `2026-02-08`
Status: `frozen-v1` (see `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-contract-freeze-v1.md`)
Primary implementation: `/Users/anton/Projects/affinio/demo-vue/src/pages/DataGridPage.vue`
Demo route: `/datagrid`

This document fixes the canonical interaction behavior that must be preserved when demo logic is moved from direct `@affino/datagrid-core` wiring into `@affino/datagrid-vue`.

## 1. Core Selection Contract

### 1.1 Cell state model

- `anchor`: start cell of range selection.
- `focus`: current range edge.
- `active`: keyboard/navigation focus cell.
- If no range exists, selected-cell count is `0`.

### 1.2 Mouse semantics

- Left click on data cell sets `anchor = focus = active`.
- `Shift + click` extends range from existing `anchor` to clicked cell.
- Drag over cells extends range continuously.
- Drag outside viewport triggers edge auto-scroll (X and Y) and selection keeps extending.

### 1.3 Keyboard semantics

- Arrow keys move active cell by one step.
- `Shift + arrows` extend range from fixed anchor.
- `Home`/`End` move to row edge; `Ctrl/Cmd + Home/End` move to dataset edge.
- `PageUp/PageDown` move by viewport-sized row step.
- `Tab` / `Shift+Tab` move between navigable columns.
- `Escape` clears cell selection state.

## 2. Fill Handle Contract

### 2.1 Visibility and interaction

- Fill handle is shown only on the visual range end cell.
- Handle starts fill-drag on left mouse down.
- Fill preview updates during pointer move and during edge auto-scroll.

### 2.2 Preview/apply semantics

- Preview covers extended area and excludes base selection area from preview highlight.
- On mouse up, preview is applied as repeat pattern by row-period of source block.
- Only editable columns are filled.
- Derived `status` is recomputed when `latencyMs` or `errorRate` are filled.

## 3. Inline Editing Contract

### 3.1 Entering edit mode

- Double click on editable cell opens inline editor.
- Enum-like columns (`severity`, `status`, `environment`, `region`) support trigger-button open into select mode.
- Non-editable columns never enter edit mode.

### 3.2 Commit/cancel semantics

- `Enter`: commit current edit.
- `Escape`: cancel current edit.
- `Tab` / `Shift+Tab`: commit and move to next/previous editable cell.
- `blur` and viewport scroll commit current edit.
- Leaving viewport focus commits edit unless focus stays inside viewport subtree.

## 4. Pinning and Layering Contract

### 4.1 Pinning behavior

- `select` and `service` are pinned left by default.
- `status` can be pinned/unpinned by control toggle.
- Pinned columns must remain visually fixed during horizontal scroll.

### 4.2 Layering invariants

- Header layer is above body and overlays.
- Sticky/pinned cells are above scrollable regular cells.
- Selection/fill overlays are below pinned cells (so pinned cells mask overlays under them).
- Active cell indicators and cell-level controls (enum trigger, fill handle) stay visually stable and aligned with their cells.

## 5. Virtualization and Window Contract

- Virtual row window is computed from `scrollTop`, viewport height, row height and overscan.
- Range label (`Window`) must match current visible row range.
- Empty state appears only when filtered dataset is empty.
- Long vertical and horizontal sessions must not break interactivity or produce page errors.

## 6. Determinism Contract

- Repeated pointer events with identical coordinates must not trigger redundant selection/fill state writes.
- Repeated resize events are coalesced through RAF measurement scheduler.
- Visible-row sync is deduplicated by `(rows reference, range)` and scheduled via RAF.
- Repeated render cycles without state delta must keep the same visible result.

## 7. Observable UI Contract (Selectors)

- Viewport: `.datagrid-stage__viewport`
- Rows: `.datagrid-stage__row`
- Cells: `.datagrid-stage__cell`
- Selection overlay: `.datagrid-stage__selection-overlay`
- Fill handle: `.datagrid-stage__selection-handle--cell`
- Inline editor: `.datagrid-stage__editor`
- Metrics block: `.datagrid-metrics`

These selectors are part of demo parity checks and may only change with explicit migration in acceptance tests.
