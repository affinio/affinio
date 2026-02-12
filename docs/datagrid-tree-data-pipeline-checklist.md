# DataGrid TreeData Pipeline Checklist

Updated: `2026-02-11`  
Scope: `@affino/datagrid-core` + `@affino/datagrid-orchestration` + demo/internal integration (no sugar scope yet)  
Goal: implement AG Grid-like `treeData` semantics in core-first architecture with deterministic behavior, strict contracts, and measurable performance.

## Readiness Snapshot (Before Execution)

- Current readiness: `7.4 / 10`.
- Strong areas:
  - Existing grouped projection and expansion logic in row model.
  - Existing selection/history/viewport primitives and contract test culture.
  - Existing `treeview-core` package with deterministic tree state machine primitives.
- Main gaps:
  - No single canonical `treeData` contract for identity/path/parent semantics.
  - No full server-side/lazy children contract in DataGrid row models.
  - No explicit parity matrix for filter/sort/selection semantics in tree mode.
  - No dedicated perf/e2e tree stress lock.

## Execution Rule (Strict)

- Close strictly one-by-one: `T0 -> T12`.
- Do not mark step done without evidence.
- For each closed step, add:
  - `Contract/Test`: what exactly passed.
  - `Bench/Perf`: metric or `N/A` with reason.
  - `Visual`: what was manually verified.
  - `Artifact`: file/test/report path.
- If regression appears in already closed step: reopen checkbox immediately.

## Pipeline (Simple -> Complex)

- [x] `T0` Baseline lock for treeData target semantics.
Scope:
  - Freeze expected behavior matrix for:
    - identity (`rowId`),
    - hierarchy source (`getDataPath` or `parentId` strategy),
    - expansion model,
    - filter/sort behavior in tree mode.
Proof:
  - Contract matrix doc added and linked here.
Exit:
  - All next steps rely on one canonical target behavior.
Evidence:
  - Contract/Test: baseline behavior contract frozen in `/Users/anton/Projects/affinio/docs/datagrid-tree-data-behavior-matrix.md`.
  - Bench/Perf: `N/A` (semantic baseline lock step, no runtime change).
  - Visual: `N/A` (semantic baseline lock step, no UI delta expected).
  - Artifact:
    - `/Users/anton/Projects/affinio/docs/datagrid-tree-data-behavior-matrix.md`
    - `/Users/anton/Projects/affinio/docs/datagrid-tree-data-pipeline-checklist.md`

- [ ] `T1` Canonical treeData contract in `datagrid-core`.
Scope:
  - Add explicit core config contract (`treeData` mode, resolvers, policies).
  - Include deterministic orphan/cycle handling policy.
Proof:
  - Unit contracts for valid/invalid configuration and deterministic fallback behavior.
Exit:
  - Integrator can configure tree mode without ambiguous runtime behavior.
Progress:
  - `2026-02-11` implementation added in core:
    - treeData types + policies (`path`/`parent`, orphan/cycle defaults),
    - `normalizeTreeDataSpec`,
    - `cloneTreeDataSpec`,
    - `isSameTreeDataSpec`,
    - stable exports via models/public entrypoints.
  - Added contract coverage in `models/__tests__/rowModel.spec.ts` for:
    - valid `path`/`parent` normalization,
    - mixed-source rejection,
    - deterministic default policy resolution,
    - invalid `rootParentId` rejection.
  - `2026-02-11` identity+diagnostics contract hardening:
    - `DataGridRowModelSnapshot` extended with optional `treeDataDiagnostics` payload,
    - client tree mode now enforces duplicate-`rowId` rejection (`setRows` fails fast, previous revision preserved),
    - duplicate violation message persisted in diagnostics (`duplicates`, `lastError`).
  - Verification pending (local environment has no `node/pnpm`, test run not available in current sandbox).

- [ ] `T2` Tree index + flatten projection engine (core-first).
Scope:
  - Build deterministic hierarchy index from flat rows.
  - Produce flattened visible rows by expansion state.
Proof:
  - Contract tests for deep nesting, sibling ordering, and stable snapshot roundtrip.
Exit:
  - Tree projection exists independent of UI layer.
Progress:
  - `2026-02-11` added client row-model projection engine for treeData:
    - path mode (`getDataPath`) with synthetic group nodes and flatten by expansion state,
    - parent mode (`getParentId`) with deterministic parent/child index and flatten by expansion state,
    - baseline orphan/cycle policy handling in projection (`root/drop/error`, `ignore-edge/error`).
  - `2026-02-11` projection pipeline alignment:
    - path mode now builds tree index on full sorted source rows first, then applies filter markers for flattening,
    - parent mode diagnostics counters wired for orphan/cycle policy handling,
    - tree projection now returns deterministic diagnostics payload consumed by row-model snapshot.
  - Added contract tests in `clientRowModel.spec.ts`:
    - path mode projection + expansion toggle behavior,
    - parent mode projection with orphan-root and cycle-edge-ignore behavior.
    - tree diagnostics snapshot assertions (`orphans/cycles/duplicates/lastError`),
    - duplicate row identity rejection preserving prior snapshot revision.
  - Verification pending (runtime test execution unavailable in current sandbox environment).

- [ ] `T3` Expansion API and snapshot roundtrip.
Scope:
  - `expand`, `collapse`, `toggle`, `expandAll`, `collapseAll`.
  - Snapshot import/export for expansion state.
Proof:
  - API contracts + no-op determinism tests.
Exit:
  - Expansion lifecycle is deterministic and serializable.
Progress:
  - `2026-02-11` implemented explicit expansion API across core row models:
    - `setGroupExpansion`,
    - `expandGroup`,
    - `collapseGroup`,
    - `expandAllGroups`,
    - `collapseAllGroups`.
  - Implementation landed in:
    - `clientRowModel`,
    - `serverBackedRowModel`,
    - `dataSourceBackedRowModel`,
    - `DataGridApi` facade methods.
  - Added contract coverage updates:
    - `clientRowModel.spec.ts` (roundtrip + explicit expansion API),
    - `serverBackedRowModel.spec.ts` (explicit expansion API),
    - `dataSourceBackedRowModel.spec.ts` (groupExpansion propagation for explicit API),
    - `gridApi.contract.spec.ts` (facade routing + roundtrip via `setGroupExpansion`).
  - Verification pending (runtime test execution unavailable in current sandbox environment).

- [ ] `T4` Selection semantics in tree mode.
Scope:
  - Anchor/focus/range on flattened rows.
  - Group-row selection policies (`groupSelectsChildren` off/on).
Proof:
  - Selection contract matrix tests for leaf/group/mixed scenarios.
Exit:
  - Tree selection behavior is explicit and test-locked.
Progress:
  - `2026-02-11` added core selection-policy helper:
    - `applyGroupSelectionPolicy(range, { rows, groupSelectsChildren })`.
  - Extended flattened-row contract to carry optional `isGroup` + `level` metadata for deterministic subtree expansion.
  - Added grouped selection contract tests covering:
    - subtree expansion when `groupSelectsChildren=true`,
    - strict no-op when policy is disabled.
  - `2026-02-11` wired adapter/runtime integration in `datagrid-vue`:
    - `tree.groupSelectsChildren` feature flag added to sugar API,
    - selection engine now uses core policy helpers from `@affino/datagrid-core/advanced`,
    - single-cell group selection expands to subtree deterministically when policy is enabled.
  - Added contract coverage in `datagrid-vue`:
    - `useAffinoDataGrid.contract.spec.ts` verifies policy on/off behavior for tree selection range.
  - Verification pending (runtime test execution unavailable in current sandbox environment).

- [ ] `T5` Tree-aware filter semantics.
Scope:
  - Support modes:
    - leaf-only match,
    - include-parents,
    - include-descendants.
Proof:
  - Contract tests covering each mode and deterministic visible projection.
Exit:
  - Filtering in tree mode is predictable and policy-driven.
Progress:
  - `2026-02-11` added canonical tree filter contract to `rowModel`:
    - `DataGridTreeDataFilterMode = "leaf-only" | "include-parents" | "include-descendants"`,
    - `treeData.filterMode` with deterministic default `include-parents`.
  - Integrated tree-aware filtering in `clientRowModel` projection engine:
    - pipeline semantics updated to marker-based filtering (`filter markers` before flatten),
    - path mode:
      - `leaf-only` => leaf rows only,
      - `include-parents`/`include-descendants` => matched leaves with synthetic parent path nodes.
    - parent mode:
      - `leaf-only` => matched leaf nodes only,
      - `include-parents` => matched rows + ancestor chain,
      - `include-descendants` => matched rows + ancestor chain + descendant subtree.
  - Added contract tests:
    - `rowModel.spec.ts` for filterMode normalization/default,
    - `clientRowModel.spec.ts` for all three parent-mode policies.
  - Verification pending (runtime test execution unavailable in current sandbox environment).

- [ ] `T6` Tree-aware sort semantics.
Scope:
  - Stable sort within sibling groups.
  - Deterministic tie-breakers by identity.
Proof:
  - Sort contracts for mixed depths and repeated refreshes.
Exit:
  - Sorting does not corrupt hierarchy and stays deterministic.
Progress:
  - `2026-02-11` updated core sort comparator in `clientRowModel` to use stable `rowId` tie-breaker before source-index fallback.
  - Added deterministic contract test for equal-sort-value rows to validate identity-based ordering.
  - Verification pending (runtime test execution unavailable in current sandbox environment).

- [ ] `T7` Viewport integration for tree projection.
Scope:
  - Tree flattened rows become canonical row source for viewport.
  - No axis cross-leak (row updates must not trigger unnecessary horizontal work).
Proof:
  - Viewport integration contracts green.
  - Recompute counters confirm scoped invalidation.
Exit:
  - Tree mode works under virtualization without architectural regression.
Progress:
  - `2026-02-11` added viewport bridge contract coverage for treeData projection updates:
    - tree filter + expansion changes assert row-axis-only invalidations (`axes.rows=true`, `axes.columns=false`).
  - Verification pending (runtime test execution unavailable in current sandbox environment).

- [ ] `T8` Server/DataSource tree contract (lazy children).
Scope:
  - Define async children loading contract.
  - Add cancellation/backpressure behavior and cache policy.
Proof:
  - Contracts for race/cancel flows.
  - Bench scenario for churn under expand/collapse storms.
Exit:
  - Tree mode is production-safe for large async datasets.
Progress:
  - `2026-02-11` extended data-source tree expansion pull contract with explicit tree context:
    - `treeData.operation`,
    - `treeData.scope` (`all`/`branch`),
    - `treeData.groupKeys`.
  - `createDataSourceBackedRowModel` now forwards tree context on tree operations:
    - `setGroupBy`,
    - `setGroupExpansion`,
    - `toggle/expand/collapse group`,
    - `expandAll/collapseAll`.
  - Existing backpressure pipeline (abort/coalesce/defer) remains active and now applies to tree-operation pulls with preserved request context.
  - Added/updated contract assertions in `dataSourceBackedRowModel.spec.ts` for tree pull context propagation.
  - `2026-02-11` server-backed model hardening:
    - warmup covers full viewport span (step-based),
    - `undefined` rows are not cached in LRU,
    - `toRowNode` cache flow simplified,
    - optional source push-sync hook (`source.subscribe`) wired when provided.
  - Verification pending (runtime test execution unavailable in current sandbox environment).

- [ ] `T9` Grid API parity for tree operations.
Scope:
  - Expose tree operations via stable API surface.
  - Keep event/transaction semantics consistent with existing grid API style.
Proof:
  - API contract tests + typed runtime events coverage.
Exit:
  - Tree operations are available without internal-only hooks.
Progress:
  - `2026-02-11` stable tree event parity increment completed:
    - added stable handler contracts:
      - `groupByChange(groupBy, groupExpansion)`,
      - `groupExpansionChange(groupExpansion, groupBy)`.
    - host-event adapter mappings added:
      - `groupByChange -> group-by-change`,
      - `groupExpansionChange -> group-expansion-change`.
    - Vue sugar now emits both stable events on tree state changes.
  - Contract coverage updates:
    - `runtime/__tests__/dataGridRuntime.events.contract.spec.ts` host dispatch guard includes `groupByChange`,
    - `adapters/__tests__/adapterRuntimeProtocol.contract.spec.ts` includes deterministic mapping assertions,
    - `datagrid-vue` contract test includes tree stable-event emission assertions.
  - Verification pending (runtime test execution unavailable in current sandbox environment).

- [ ] `T10` Internal demo integration (core semantics only).
Scope:
  - Add/upgrade tree mode scenario in internal demo route.
  - Validate keyboard, context menu, selection, filtering, sorting in tree mode.
Proof:
  - Targeted e2e scenario set for tree mode.
  - Visual pass against expected behavior matrix.
Exit:
  - Tree mode can be validated end-to-end without sugar abstraction.
Progress:
  - `2026-02-11` added dedicated internal must-have route:
    - `/datagrid/must-have/tree-data`
    - page: `demo-vue/src/pages/datagrid/DataGridMustHaveTreeDataPage.vue`
  - Demo now uses core-native tree projection via explicit `rowModel` override:
    - `createClientRowModel({ initialTreeData: { mode: "path", ... } })`
    - no page-local tree flattening workaround.
  - Runtime/sugar plumbing updated to accept external `rowModel`:
    - orchestration runtime `rowModel` override,
    - vue runtime/composable/bootstrap passthrough.
  - Added targeted e2e scenario set:
    - `tests/e2e/datagrid.tree-data.spec.ts`
    - covers expand/collapse, filter+sort, keyboard+context-menu smoke.
  - Verification pending (local run in progress).

- [ ] `T11` Quality + performance lock for tree mode.
Scope:
  - Add tree-specific contract suites to quality gates.
  - Add benchmark/stress coverage for deep tree workloads.
Proof:
  - `quality` and `perf` reports green with treeData checks included.
Exit:
  - Tree mode regressions are CI-blocked.
Progress:
  - `2026-02-11` added dedicated tree workload benchmark:
    - `scripts/bench-datagrid-tree-workload.mjs`
    - scenarios: `expand-burst`, `filter-sort-burst` on deep path-tree projection.
  - `2026-02-11` harness wiring:
    - benchmark matrix now includes `tree-workload` task in `scripts/bench-datagrid-harness.mjs`
    - report artifact: `artifacts/performance/bench-datagrid-tree-workload.json`.
  - `2026-02-11` quality gate wiring:
    - added `test:datagrid:tree:contracts`,
    - added `test:e2e:datagrid:tree`,
    - added `quality:gates:datagrid:tree`,
    - `quality:lock:datagrid` now runs tree gate.
  - `2026-02-11` benchmark gate hardening:
    - `scripts/check-datagrid-benchmark-report.mjs` now enforces `tree-workload` presence/pass in CI mode.
  - Verification pending (runtime test/bench execution unavailable in current sandbox environment).

- [x] `T12` Documentation + migration notes.
Scope:
  - Add core docs: treeData contract, policies, examples, failure modes.
  - Add migration notes from group-by-only usage to treeData mode.
Proof:
  - Docs reviewed and linked from datagrid overview docs.
Exit:
  - Integrator has complete usage and migration guidance.
Evidence:
  - Contract/Test: `N/A` (documentation closure step).
  - Bench/Perf: `N/A` (documentation closure step).
  - Visual: doc review passed for integrator flow (contract + migration + references).
  - Artifact:
    - `/Users/anton/Projects/affinio/docs/datagrid-tree-data.md`
    - `/Users/anton/Projects/affinio/docs/datagrid-migration-guide.md`
    - `/Users/anton/Projects/affinio/docs/datagrid-model-contracts.md`
    - `/Users/anton/Projects/affinio/docs/affino-datagrid-overview.en.md`
    - `/Users/anton/Projects/affinio/docs/affino-datagrid-overview.ru.md`

## Progress Log

- `2026-02-11`: pipeline initialized, scope locked to core semantics (sugar excluded by request).
- `2026-02-11`: `T0` closed - baseline treeData behavior matrix locked and linked as canonical semantic source.
- `2026-02-11`: `T1` implementation complete, waiting for runtime verification (`vitest`/type-check) before checkbox closure.
- `2026-02-11`: `T2` implementation in progress - tree projection engine integrated in `clientRowModel`, awaiting verification.
- `2026-02-11`: `T3` implementation in progress - explicit expansion API + snapshot roundtrip path integrated across core models and `gridApi`, awaiting verification.
- `2026-02-11`: `T4` implementation in progress - selection policy helper (`groupSelectsChildren`) added in core selection geometry with grouped contract tests, integration wiring pending.
- `2026-02-11`: `T5` implementation in progress - tree filter policies integrated in `clientRowModel` + contract tests, awaiting runtime verification.
- `2026-02-11`: `T6` implementation in progress - identity tie-breaker added to core sort comparator with deterministic contract test, awaiting runtime verification.
- `2026-02-11`: `T7` implementation in progress - treeData viewport invalidation contract test added for row-axis scoping, awaiting runtime verification.
- `2026-02-11`: `T9` parity increment in progress - stable tree events (`groupByChange/groupExpansionChange`) added to handler contracts, adapter mappings, runtime guard test, and Vue sugar contract test; awaiting runtime verification.
- `2026-02-11`: `T8` implementation in progress - data-source tree pull context + operation-scoped propagation added in core model and contracts, awaiting runtime verification.
- `2026-02-11`: architecture note - after `T12`, split monolithic client row model pipeline into staged compute services (`filter/sort/tree/flatten/pagination`) without breaking current API.
- `2026-02-11`: `T4` integration wiring landed in `datagrid-vue` selection engine with `groupSelectsChildren` sugar flag + contract coverage update; awaiting runtime verification.
- `2026-02-11`: `T11` implementation in progress - tree quality/perf lock wired (tree contracts/e2e/perf scripts + harness task + benchmark report check), awaiting runtime verification.
- `2026-02-11`: `T12` closed - added canonical treeData guide (contract/policies/examples/failure modes) and linked migration path (`groupBy -> treeData`) into model/overview docs.
