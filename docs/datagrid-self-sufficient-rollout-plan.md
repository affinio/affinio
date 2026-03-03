# DataGrid Self-Sufficient Rollout Plan

Status: active
Owner: core/runtime
Date: 2026-03-03

## Goal

Close core platform gaps so framework adapters and demos can rely on `DataGridApi` as the primary integration surface without direct low-level model wiring.

## Scope

1. Unified state contract
2. Public event facade
3. Data loading facade methods
4. Compute mode control
5. Schema/metadata introspection
6. Deterministic execution hooks (phase-gated)
7. Unified diagnostics namespace
8. Stable plugin facade
9. Explicit projection policy facade

## Delivery Batches

### Batch 1: Foundation (`state` + `events`) [done]

- Add `api.state.get()` and `api.state.set(state, options?)`
- Add `api.events.on(event, handler)` facade events:
  - `rows:changed`
  - `columns:changed`
  - `projection:recomputed`
  - `selection:changed`
  - `pivot:changed`
  - `transaction:changed`
  - `viewport:changed`
  - `state:imported`
- Add contract tests for roundtrip, event emission, event payload order guarantees.

### Batch 2: Data + compute + diagnostics [implemented, verify in local CI]

- Added `api.rows.setData/replaceData/appendData/prependData` (capability-guarded)
- Added `api.compute.getMode()/switchMode()` + `api.compute.getDiagnostics()`
- Added `api.diagnostics.getAll()`
- Added contract tests for data mutation, compute control and diagnostics aggregation.

### Batch 3: Metadata + policy + plugins [implemented in core, verify adapters]

- Added `api.meta.getSchema()/getCapabilities()/getRuntimeInfo()`
- Added `api.policy.setProjectionMode()/getProjectionMode()`
- Added stable plugin registration facade on API constructor/options:
  - constructor: `createDataGridApi({ ..., plugins })`
  - runtime: `api.plugins.register/unregister/has/list/clear`
- Added core contract tests for meta/policy/plugins behavior.

### Batch 4: Orchestration and demos

- Refactor orchestration to prefer facade APIs over direct model internals.
- Update Vue/Laravel demos:
  - state save/restore
  - event stream panel
  - diagnostics panel
  - compute mode switch
- Remove duplicated demo-level workarounds covered by new facade methods.

Progress:
- `createDataGridRuntime` now forwards `plugins` into `createDataGridApi`.
- `useDataGridRuntime` exposes facade-level wrappers for `meta/policy/plugins`.
- Added orchestration/Vue contract tests for plugin forwarding and projection policy behavior.
- `demo-vue` worker page now uses facade-first flows for revisions/ranges (`api.rows` + `api.events`), plus runtime `state` save/restore, diagnostics panel, event stream and compute mode control.
- `demo-vue` main DataGrid page now pulls projection diagnostics via `api.diagnostics` + `api.events` and uses `api.rows` for row accessors (`count/get/range`) instead of direct row-model methods.
- `demo-vue` sugar page now exposes runtime `state` save/restore and live runtime diagnostics via `api.state`/`api.diagnostics`/`api.events`.
- `demo-vue` pivot page now uses `api.events`/`api.rows` for live counters instead of direct row-model subscribe/get APIs.
- `demo-vue` must-have tree-data page now uses `api.events`/`api.rows` for revision + visible row counters.
- `demo-vue` must-have reorder page now uses `api.rows` for read/pagination controls; `reorderRows` remains explicit row-model scoped mutation path.
- `demo-laravel` pivot demo now uses `api.rows`/`api.events` for snapshot updates and data resets instead of direct row-model internals.
- Added canonical docs in root repo docs: `docs/datagrid-core-factories-reference.md` and `docs/datagrid-core-advanced-reference.md`.
- Updated docs-site API snippets to canonical API assembly (`createDataGridCore(...)` + `createDataGridApi({ core })`) after flat/deps shorthand removal.
- Aligned docs for state/events/compute/diagnostics and advanced Vue domain entrypoints (`advanced/facades`).

## Test Strategy

- Core contract tests first (`packages/datagrid-core/src/core/__tests__`)
- Then orchestration tests
- Then demo e2e smoke checks
- Perf gate regression checks after each batch

## Exit Criteria

- `DataGridApi` covers 90% common integration flows without direct model usage
- Docs for stable + advanced entrypoints aligned with shipped code
- Demos use facade-driven integration for critical flows

## Contract decisions (2026-03-03)

- Unified state remains V1 model-centric (`rows.snapshot` transport shape) for compatibility; conceptual domain schema can be evaluated as a future V2.
- Event ordering is documented as concrete sequencing, not generic lifecycle prose.
- `compute.switchMode(...)` is explicitly documented as synchronous, non-recompute, caller-coordinated operation.
- `diagnostics.getAll()` is explicitly documented as read-only/non-recompute.
- Reorder remains an official row-model-scoped capability in current stable facade; `api.rows` alias is deferred.
