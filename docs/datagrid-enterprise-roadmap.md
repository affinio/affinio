# DataGrid Enterprise Roadmap

This document tracks enterprise-grade API hardening for DataGrid Core.

## Phase 1 (implemented)

- [x] Lifecycle concurrency helpers on public API (`api.lifecycle.isBusy/whenIdle/runExclusive`)
- [x] Guarded exclusive operations for high-impact API calls
  - `api.compute.switchMode(...)`
  - `api.state.set(...)`
  - transaction mutations (`begin/commit/rollback/apply/undo/redo`)
  - `api.rows.batch(...)`
- [x] Typed error event surface (`api.events.on("error", ...)`)
- [x] Error classification codes (`capability-error`, `invalid-state-import`, `transaction-conflict`, `compute-switch-conflict`, `mutation-conflict`, `lifecycle-conflict`, `data-source-protocol-error`, `unknown-error`)
- [x] Explicit row-model kind introspection (`api.meta.getRowModelKind()`)

## Phase 2 (completed)

- [x] Backpressure control namespace (`api.data.pause/resume/flush`) for data-source/server-backed models
- [x] State migration surface (`api.state.migrate(...)`) with version policy
- [x] Snapshot isolation contract (documented + tested guarantees)
- [x] Stronger bulk mutation boundary semantics (`api.rows.batch(...)` emits one coalesced event-cycle)

## Phase 3 (enterprise operations)

- [ ] Audit/replay surface (`api.audit.*`) with deterministic command log
- [ ] Plugin sandbox contract (explicit allow/deny rules)
- [ ] Memory-bound guarantees (cache/transport bounds + eviction guarantees)
- [ ] Error taxonomy hardening with typed classes and recovery strategy docs

## Acceptance criteria for Phase 2

1. `data-source` workloads can be safely throttled from public API without touching internals.
2. State import across versions has deterministic migration path and explicit errors.
3. `state.get()` and read APIs have clear revision-consistency contract.
4. `rows.batch(...)` behavior is measurable and contract-tested (revision/event coalescing).

## Acceptance criteria for Phase 3

1. Reproducible audit log can replay deterministic mutation sequences in CI.
2. Plugin lifecycle contract prevents direct mutation of protected runtime internals.
3. Operational diagnostics include memory bounds and degradation signals.
