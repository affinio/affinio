---
title: Audience Tracks (Core / Adapter / Sugar)
---

# Audience Tracks

This page defines the intended documentation contract by user level.

## Track Matrix

| Track | Who it is for | Primary package | Expected depth | Start here |
| --- | --- | --- | --- | --- |
| Core (Pro) | Platform engineers building headless/runtime integrations | `@affino/datagrid-core` | Low-level API, contracts, runtime invariants, protocols | [/datagrid/core-quickstart](/datagrid/core-quickstart), [/datagrid/core-factories-reference](/datagrid/core-factories-reference), [/datagrid/core-advanced-reference](/datagrid/core-advanced-reference), [/datagrid/grid-api](/datagrid/grid-api), [/datagrid/model-contracts](/datagrid/model-contracts), [/datagrid/data-source-protocol](/datagrid/data-source-protocol) |
| Adapter (Mid) | Framework developers building production grids in Vue/Laravel | `@affino/datagrid-vue`, `@affino/datagrid-laravel` | Framework-facing API map, integration flows, runtime mode choices | [/datagrid/vue-api-reference](/datagrid/vue-api-reference), [/datagrid/vue-integration](/datagrid/vue-integration), [/datagrid/laravel-integration](/datagrid/laravel-integration) |
| Sugar (Rapid) | Product developers who need a working table quickly | `@affino/datagrid-vue` sugar layer | Declarative setup, feature toggles, practical recipes | [/datagrid/sugar-overview](/datagrid/sugar-overview), [/datagrid/vue-sugar-playbook](/datagrid/vue-sugar-playbook) |

## Package Access Policy

- Core track: may import `@affino/datagrid-core` directly.
- Adapter track: should import framework adapter packages, not core/orchestration directly.
- Sugar track: should stay on sugar APIs and avoid manual low-level orchestration.

## Capability Inventory

Use the canonical feature matrix to decide if DataGrid fits your requirements:

- [DataGrid Feature Catalog](https://github.com/affinio/affinio/blob/main/docs/datagrid-feature-catalog.md)

## Runtime Mode Rule of Thumb

| Need | Recommended mode |
| --- | --- |
| Small/simple table | `main-thread` |
| Heavy interactive editing/patch pressure | `worker-owned` |
| Backend-owned data shaping and very large remote data | `server-side` |
