# DataGrid Migration Guide

Baseline date: `2026-02-07`
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
| `.tmp/ui-table/vue/*` | `@affino/datagrid-vue` |
| `UiTable*` naming | `DataGrid*` naming (shims kept for migration period) |

## Naming Migration (Vue)

- `UiTable.vue` -> `DataGrid.vue`
- `UiTableViewportSimple.vue` -> `DataGridViewport.vue`
- `UiTableOverlayLayer.vue` -> `DataGridOverlayLayer.vue`

Compatibility shims still exist, but new integration should use `DataGrid*` names.

## Pinning Migration (Required)

Runtime canonical pin contract:
- `pin: "left" | "right" | "none"`

Legacy fields supported only at adapter normalization boundary:
- `pinned`, `sticky`, `stickyLeft`, `stickyRight`, `lock`, `locked`

Migration rule:
- Convert legacy pin fields at data ingestion point.
- Do not carry legacy fields into runtime column models.

## Recommended Migration Steps

1. Move imports from `.tmp/ui-table/*` to package-root imports.
2. Switch component usage to `DataGrid*` names.
3. Normalize pinning input to canonical `pin` before runtime.
4. Remove direct dependency on legacy internal path aliases.
5. Re-run quality/perf gates before release.

## Verification Checklist

- Public imports only (no direct `src/*` internals for production integration).
- No runtime dependency on legacy pin fields.
- Overlay and selection geometry remain aligned during horizontal scroll.
- X-virtualization deterministic under resize/teleport-like scroll jumps.

## Validation Commands

- `pnpm run test:matrix:unit`
- `pnpm run test:matrix:integration`
- `pnpm run quality:gates:datagrid`
- `pnpm run bench:datagrid:harness:ci`

## Rollback Strategy

- Keep compatibility shims (`UiTable*`) during one transition release cycle.
- Gate removal of legacy shims only after integration consumers fully switch to `DataGrid*` imports.
