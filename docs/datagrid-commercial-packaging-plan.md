# DataGrid Commercial Packaging Plan

Updated: `2026-03-03`

## Goal

Ship Affino DataGrid as a commercial product with minimal adoption friction and clear SKU boundaries:

- Community (`@affino/datagrid`)
- Pro (`@affino/datagrid-pro`)
- Enterprise (support/SLA layer, not separate runtime package yet)

This file is the canonical commercial contract for:

- SKU boundaries (what is Community vs Pro)
- license behavior
- pricing baseline
- implementation roadmap for Core/Vue/Laravel

## SKU model

### Community

- baseline grid usage (single-table CRUD style)
- sort/filter/pagination
- client row model only
- basic state export/import
- Vue quick-start entrypoint
- no pivot/grouping/tree/aggregation
- no worker compute switch
- no server/data-source row model controls
- no advanced diagnostics/audit surface

### Pro

- all community capabilities
- pivot/grouping/tree/aggregation
- worker compute mode
- server/data-source model controls
- advanced diagnostics and deterministic integration surfaces
- advanced state/events/lifecycle policy surface
- benchmark-grade tooling and regression gates

### Enterprise

- SLA/support/integration assistance
- rollout governance and release channels
- optional white-label and solution engineering

## Pro feature boundary (authoritative)

All items below are Pro:

### Core API features

- `api.rows.setGroupBy(...)`
- `api.rows.setAggregationModel(...)`, `api.rows.getAggregationModel()`
- group expansion methods: `toggleGroup`, `expandGroup`, `collapseGroup`, `expandAllGroups`, `collapseAllGroups`
- `api.pivot.*`
- `api.compute.switchMode(...)` for worker mode
- non-client row models (`server-backed`, `data-source-backed`)
- `api.data.pause()/resume()/flush()` backpressure controls

### Vue adapter features

- worker-owned runtime mode in framework-level examples and presets
- pivot and tree/group UX presets in sugar/playbook layer
- advanced diagnostics panels (compute/backpressure/cache/projection-health)

### Laravel adapter features

- server/data-source-backed runtime integration contracts
- tree/group/pivot orchestration in Laravel-facing facade
- deterministic restore + diagnostics contracts for long-running admin panels

## Delivery architecture

### Package structure

- `packages/datagrid` (`@affino/datagrid`): community facade and license-aware API/runtime wrappers.
- `packages/datagrid-pro` (`@affino/datagrid-pro`): pro activation package (`enableProFeatures`).

### Runtime license activation contract

- Pro activation writes a global runtime license state (`enableProFeatures({ licenseKey })`).
- Community package checks either:
  - inline `licenseKey` passed to `createDataGridApi` / `createDataGridRuntime`
  - or active global pro state from `@affino/datagrid-pro`
- If no pro activation, community wrapper applies gated facade behavior.

### License behavior policy

Current (`v1`, implemented):

- runtime key format validation only
- activation can be global (`enableProFeatures`) or inline (`licenseKey` in factory options)
- if not activated, runtime degrades to Community behavior with explicit pro-required errors

Target (`v2`, planned hardening):

- signed license token verification (public-key verification in SDK)
- optional online refresh endpoint + local cache
- offline grace window (recommended: 7 days)
- explicit license error codes (`expired`, `invalid-signature`, `quota-exceeded`, `grace-expired`)
- non-crashing fallback to community capabilities for UI continuity

### Gated facade behavior (community)

Blocked with explicit `DataGridProFeatureRequiredError`:

- grouping/tree API (`rows.setGroupBy`, group expansion methods, `view.expandAllGroups`, `view.collapseAllGroups`)
- aggregation API (`rows.setAggregationModel`, `rows.getAggregationModel`)
- pivot namespace (`api.pivot.*`)
- worker compute switch (`api.compute.switchMode`)
- data-source/server backpressure controls (`api.data.pause/resume/flush`)
- non-client row model usage (`api.meta.getRowModelKind() !== "client"`)

## Rollout phases

## Phase 1 (implemented)

- [x] Introduce `@affino/datagrid` package.
- [x] Introduce `@affino/datagrid-pro` package.
- [x] Add license activation helpers (`enableProFeatures`, `disableProFeatures`, `assertProFeaturesEnabled`).
- [x] Add community-tier gated API facade with explicit pro-required errors.
- [x] Support frictionless inline activation via `licenseKey` option.

## Phase 2 (next)

- [ ] Add contract tests for community gating behavior and pro activation flows.
- [ ] Add docs-site pages for commercial tiers and activation examples (EN/RU).
- [ ] Add benchmark/docs examples with Community vs Pro pathways.
- [ ] Add CI checks that protect accidental pro-surface leaks in `@affino/datagrid`.
- [ ] Add adapter-level contract tests (Vue/Laravel) that assert pro-only feature guards.

## Phase 3 (commercial hardening)

- [ ] Move license verification from local format checks to signed token verification flow.
- [ ] Add offline grace-period policy and explicit license error taxonomy.
- [ ] Introduce usage telemetry hooks (opt-in) for enterprise support diagnostics.
- [ ] Define release channel policy (`community`, `pro`, `enterprise-hotfix`).

## Pricing baseline (recommended launch)

This is the recommended first commercial pricing baseline (simple and defensible).

### Pro

- `USD 39 / developer / month`
- `USD 390 / developer / year` (annual discount)
- includes: all Pro runtime features, upgrades, standard support channel

### Enterprise

- custom contract, recommended starting point `USD 15,000 / year`
- includes: SLA/support, integration sessions, priority roadmap channel

Pricing review cadence:

- first review after 90 days of paying users
- evaluate conversion, churn, support cost, and average implementation complexity
- adjust only once per quarter to keep pricing predictable

## Package publishing policy

- Publish for external users:
  - `@affino/datagrid`
  - `@affino/datagrid-pro`
- Keep lower-level packages as internal/advanced implementation packages for now:
  - `@affino/datagrid-core`
  - `@affino/datagrid-vue`
  - `@affino/datagrid-worker`
  - `@affino/datagrid-orchestration`
- If those remain published, mark docs as "advanced/internal surface, no commercial SKU guarantee".

## Product roadmap by layer

### Core roadmap

- Phase A:
  - finalize pro gating contract tests
  - add signed-license verification abstraction
  - harden audit/diagnostics boundaries
- Phase B:
  - enforce capability map generation from one source of truth
  - add enterprise error taxonomy + recovery docs
  - add compatibility policy for state migration versions

### Vue roadmap

- Phase A:
  - expose community-first onboarding from `@affino/datagrid`
  - add pro activation examples and guards in demos/docs
  - remove direct pro feature usage from community docs
- Phase B:
  - ship pro UX presets (pivot/tree/worker) as explicit opt-in modules
  - add pro diagnostics UI contracts

### Laravel roadmap

- Phase A:
  - align Laravel facade with same Community/Pro capability map
  - add pro-only server/pivot/tree integration guards
- Phase B:
  - add enterprise deployment guide (queue/backpressure/cache patterns)
  - add long-session state restore + diagnostics reference flows

## Adoption examples

### Community

```ts
import { createDataGridRuntime } from "@affino/datagrid"

const runtime = createDataGridRuntime({
  columns,
  rows,
})
```

### Pro (global activation)

```ts
import { createDataGridRuntime } from "@affino/datagrid"
import { enableProFeatures } from "@affino/datagrid-pro"

enableProFeatures({ licenseKey: process.env.DATAGRID_LICENSE! })

const runtime = createDataGridRuntime({
  columns,
  rows,
})
```

### Pro (inline activation)

```ts
import { createDataGridRuntime } from "@affino/datagrid"

const runtime = createDataGridRuntime({
  columns,
  rows,
  licenseKey: process.env.DATAGRID_LICENSE,
})
```
