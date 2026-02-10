# Laravel Livewire DataGrid Demo Parity Pipeline

Target: Laravel demo should feel the same as Vue internal demo, with intentional visual delta only in background theme/palette.

Scoring model:
- `10.0` = full parity for target scope.
- Each step is considered closed only after proof is attached.
- Minimum acceptance per step: `9.5`.

## Parity Contract
- Same interaction model: selection, fill, move, edit, clipboard, menus, history.
- Same layered architecture in demo shell: `HeaderLayer + BodyLayer + OverlayLayer`.
- Same keyboard behavior and context menu routing semantics.
- Same data/viewport determinism under long sessions.
- Allowed difference: theme tokens/colors only.

## Pipeline (Simple -> Complex)

- [ ] `L0` Baseline lock and snapshot diff harness.
Proof:
- Capture side-by-side baseline video/screenshots (Vue vs Laravel) for identical dataset/scenario.
- Freeze target route list and scenario script.
- Add checklist note with dated baseline references.
Exit:
- Visual diff accepted, delta limited to colors/background.

- [ ] `L1` Layout shell parity.
Scope:
- Controls top, grid stage below.
- Grid fills available page area.
- No container overflow leaks.
Proof:
- Manual visual pass on desktop and laptop viewport.
- E2E smoke for stage dimensions and scroll container bounds.
Exit:
- No content jump in controls/stage, no horizontal overflow outside viewport.

- [ ] `L2` Layered grid architecture parity.
Scope:
- Header/Body/Overlay split.
- Pinned left/center/right as separate layers (not sticky-only behavior).
- Header horizontal sync with body.
Proof:
- E2E pinned + long horizontal scroll scenario.
- Screenshot/trace showing pinned layers stable while center scrolls.
Exit:
- Pinned columns and header remain deterministic under aggressive scroll.

- [ ] `L3` Selection and navigation parity.
Scope:
- Cell anchor/focus/range model.
- Mouse drag selection, Shift+arrows, Shift+click.
- Active/anchor metrics parity.
Proof:
- `tests/e2e/laravel-datagrid-interactions.spec.ts` selection suite green.
- Visual check for overlay alignment and no jitter.
Exit:
- Deterministic metrics and overlay behavior in both demos.

- [ ] `L4` Inline edit parity.
Scope:
- Double-click edit, Enter commit, Escape cancel, Tab navigation.
- Editor focus rules and no row-height/layout regression.
Proof:
- E2E inline edit contract and regression checks green.
- Manual pass for focus capture and commit/cancel semantics.
Exit:
- Edit behavior matches Vue demo intent semantics.

- [ ] `L5` Clipboard + fill + move parity.
Scope:
- Copy/paste/cut/clear as range-engine operations.
- Fill-handle preview/apply.
- Range move drag with source clear policy and history intent.
Proof:
- E2E clipboard/fill/move scenarios green.
- Manual pass for edge auto-scroll during fill/move.
Exit:
- Same result matrix and status feedback as Vue internal demo.

- [ ] `L6` Context menu and header actions parity.
Scope:
- Cell/header context menus via Affino primitives.
- Sort/filter/auto-size/clear routes.
- Keyboard menu open/focus model.
Proof:
- E2E context-menu system scenarios green.
- Manual keyboard pass (`Shift+F10`, arrows, Enter, Escape).
Exit:
- Menu focus trap and action routing equivalent to Vue demo.

- [ ] `L7` Filters/grouping/tree parity.
Scope:
- Quick filter, column filter, advanced filter presets.
- Group by and expand/collapse behavior.
- Tree projection semantics parity for grouped rows.
Proof:
- E2E quick filter + group-by + column-filter suites green.
- Manual pass for expand/collapse determinism (no auto-reopen bug).
Exit:
- Filter/group state transitions and visible projection deterministic.

- [ ] `L8` Column state/pagination/row-height/reorder parity.
Scope:
- Column order/visibility/width/pin roundtrip.
- Pagination controls + snapshot sync.
- Auto/fixed row-height behaviors and row/column reorder UX.
Proof:
- E2E must-have scenarios for column-state and pagination.
- Manual pass for row-height edge cases and reorder visuals.
Exit:
- No drift vs Vue behavior in state restore and interaction outcomes.

- [ ] `L9` History/transactions parity.
Scope:
- Undo/redo for edit/paste/cut/fill/move.
- Intent-level transaction messages and deterministic rollback.
Proof:
- E2E history regression suites green.
- Manual pass for multi-step transaction chain.
Exit:
- History restores exact cell/range states without side effects.

- [ ] `L10` Accessibility and keyboard parity.
Scope:
- Grid semantics, `aria-*`, active-descendant flow.
- Keyboard-first navigation and menu interaction.
Proof:
- Existing datagrid accessibility e2e suites extended for Laravel route.
- Manual screen-reader sanity check (critical flows).
Exit:
- No accessibility regressions versus Vue internal demo contract.

- [ ] `L11` Perf and stability gates.
Scope:
- Long-session stability (vertical/horizontal).
- Bench budget compliance and no memory runaway in demo flows.
Proof:
- `bench:datagrid:harness:ci` green.
- `quality:perf:datagrid` score >= `9.5`.
Exit:
- Stable CI pass with no flaky parity regressions.

- [ ] `L12` Docs and handoff parity.
Scope:
- Laravel demo usage/runbook aligned with Vue internal demo docs.
- Clear list of intentional deltas (only theme/background).
Proof:
- Update parity docs + runbook links.
- Final checklist note with last successful test/bench timestamps.
Exit:
- Integrator can reproduce parity from docs without tribal knowledge.

## Execution Rule
- Close strictly one step at a time (`L0 -> L12`).
- Do not mark step closed without explicit proof attached.
- If regression appears in earlier closed step, reopen it immediately.
