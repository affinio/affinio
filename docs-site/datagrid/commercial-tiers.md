---
title: Commercial Tiers
---

# Commercial Tiers

Affino DataGrid has two runtime tiers:

- `Community`: `@affino/datagrid`
- `Pro`: `@affino/datagrid` + `@affino/datagrid-pro`

`@affino/datagrid-core`, `@affino/datagrid-vue`, and `@affino/datagrid-laravel` are still available for advanced integrations, but product onboarding should start from `@affino/datagrid`.

## Community

Use for baseline table workloads:

- client row model
- sort/filter/pagination
- base state/events integration

Install:

```bash
pnpm add @affino/datagrid
```

## Pro

Use when you need heavy/enterprise domains:

- pivot/group/tree/aggregation
- worker-owned compute mode
- server/data-source row models
- advanced diagnostics/backpressure controls

Install:

```bash
pnpm add @affino/datagrid @affino/datagrid-pro
```

Global activation:

```ts
import { createDataGridRuntime } from "@affino/datagrid"
import { enableProFeatures } from "@affino/datagrid-pro"

enableProFeatures({
  licenseKey: process.env.DATAGRID_LICENSE!,
})

const runtime = createDataGridRuntime({ columns, rows })
```

Inline activation:

```ts
import { createDataGridRuntime } from "@affino/datagrid"

const runtime = createDataGridRuntime({
  columns,
  rows,
  licenseKey: process.env.DATAGRID_LICENSE,
})
```

## Adapter-level pro entrypoints

- Vue: `@affino/datagrid-vue/pro`
- Laravel: `@affino/datagrid-laravel/pro`
- Core: `@affino/datagrid-core/pro`

These are advanced entrypoints for teams intentionally integrating below commercial facade level.
