# DataGrid Vue Demo Contract Freeze (`v1`)

Freeze date: `2026-02-08`  
Version: `v1`  
Status: `frozen`  
Scope: demo behavior baseline before refactor into `@affino/datagrid-vue`

## Frozen Sources

- Canonical behavior contract:
  - `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-canonical-behavior-contract.md`
- Must-pass acceptance matrix:
  - `/Users/anton/Projects/affinio/docs/datagrid-vue-demo-acceptance-matrix.md`
- Runtime reference implementation:
  - `/Users/anton/Projects/affinio/demo-vue/src/pages/DataGridPage.vue`

## Freeze Invariants

- Contract sections for selection/fill/edit/pinning/layering/virtualization/determinism are locked for `v1`.
- Acceptance IDs `DG-VUE-PARITY-*` are normative for parity sign-off.
- Migration from demo to package runtime must preserve observed behavior for all `MUST PASS` matrix rows.
- Any deviation requires explicit contract update and new version tag (`v2+`), not silent drift.

## Change Policy After Freeze

- Allowed without version bump:
  - internal refactor with zero behavior delta and green parity matrix.
  - non-contract docs clarifications.
- Requires contract version bump:
  - keyboard/mouse semantics changes.
  - fill/apply behavior changes.
  - layering/pinning visual invariants changes.
  - selector changes used by parity tests.
- Required process for version bump:
  - update canonical contract doc,
  - update acceptance matrix,
  - add migration note,
  - record new freeze artifact (`v2`).

## Validation Gate

- Primary parity gate: `pnpm run test:e2e:critical`
- Supporting strict contracts: `pnpm run test:datagrid:strict-contracts`
- Lock gate: `pnpm run quality:lock:datagrid`

