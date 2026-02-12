# DataGrid Migration Guide

Baseline date: `2026-02-08`
Migration path: `.tmp/ui-table` -> `@affino/datagrid-core` + `@affino/datagrid-vue`

## Migration Scope

- Runtime and architecture source of truth moves from temporary tree:
  `/Users/anton/Projects/affinio/.tmp/ui-table`
- Product integration target moves to package surfaces:
  - `/Users/anton/Projects/affinio/packages/datagrid-core`
  - `/Users/anton/Projects/affinio/packages/datagrid-vue`

## Import Mapping

| Legacy | New target |
| --- | --- |
| `.tmp/ui-table/core/*` | `@affino/datagrid-core` (root public API for stable usage) |
| `.tmp/ui-table/core/viewport/*` and runtime internals | `@affino/datagrid-core/advanced` |
| `.tmp/ui-table/vue/*` | `@affino/datagrid-vue` |
| `UiTable*` naming | `DataGrid*` naming (legacy aliases removed) |

## Naming Migration (Vue)

- `UiTable.vue` -> `DataGrid.vue`
- `UiTableViewportSimple.vue` -> `DataGridViewport.vue`
- `UiTableOverlayLayer.vue` -> `DataGridOverlayLayer.vue`

Compatibility shims are removed from current package surface.
Use `DataGrid*` names only.

## Pinning Migration (Required)

Runtime canonical pin contract:
- `pin: "left" | "right" | "none"`

Migration rule:
- Use canonical `pin` only.
- Do not rely on legacy pin fields in runtime or adapter input.

## Recommended Migration Steps

1. Move imports from `.tmp/ui-table/*` to package-root imports.
2. Switch component usage to `DataGrid*` names.
3. Normalize pinning input to canonical `pin` before runtime.
4. Replace ad-hoc overlay/scroll math with deterministic public contracts:
   - `createDataGridViewportController(...).getIntegrationSnapshot()` from `@affino/datagrid-core/advanced`
   - `buildDataGridOverlayTransform(...)` or `buildDataGridOverlayTransformFromSnapshot(...)`
5. Remove direct dependency on legacy internal path aliases.
6. Re-run quality/perf gates before release.

## GroupBy-only -> TreeData Migration

Use this path when hierarchy is intrinsic (parent/path), not analytical grouping.

1. Keep `groupBy` only for value-based analytical grouping.
2. Move hierarchical projection into row model via `initialTreeData`:
   - `mode: "path"` with `getDataPath(...)`, or
   - `mode: "parent"` with `getParentId(...)`.
3. Ensure stable `rowId` for every leaf row (inject resolver if needed).
4. Make policies explicit:
   - `orphanPolicy`,
   - `cyclePolicy`,
   - `filterMode`.
5. Replace adapter-level hierarchy workarounds with row-model expansion API:
   - `toggleGroup`, `expandGroup`, `collapseGroup`, `expandAllGroups`, `collapseAllGroups`.
6. Validate tree quality gates:
   - `pnpm run test:datagrid:tree:contracts`
   - `pnpm run test:e2e:datagrid:tree`
   - `pnpm run bench:datagrid:tree:assert`

Reference:

- `/Users/anton/Projects/affinio/docs/datagrid-tree-data.md`
- `/Users/anton/Projects/affinio/docs/datagrid-tree-data-behavior-matrix.md`

## Verification Checklist

- Public imports only (no direct `src/*` internals for production integration).
- No runtime dependency on legacy pin fields.
- Integration reads pinned/overlay state via snapshot contract (`getIntegrationSnapshot`) instead of private refs.
- Overlay and selection geometry remain aligned during horizontal scroll.
- X-virtualization deterministic under resize/teleport-like scroll jumps.

## Validation Commands

- `pnpm run test:matrix:unit`
- `pnpm run test:matrix:integration`
- `pnpm run quality:gates:datagrid`
- `pnpm run bench:datagrid:harness:ci`

## Codemod Assist

For protocol-safe import migration and deprecated viewport API rename:

- dry run: `pnpm run codemod:datagrid:public-protocol -- <path>`
- write mode: `pnpm run codemod:datagrid:public-protocol -- --write <path>`

Codemod script:
- `/Users/anton/Projects/affinio/scripts/codemods/datagrid-public-protocol-codemod.mjs`

## Rollback Strategy

- Roll back only by reverting migration commit(s).
- No compatibility shim window is maintained in package code.
