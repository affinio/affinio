---
title: Коммерческие уровни
---

# Коммерческие уровни

У Affino DataGrid два runtime-уровня:

- `Community`: `@affino/datagrid`
- `Pro`: `@affino/datagrid` + `@affino/datagrid-pro`

`@affino/datagrid-core`, `@affino/datagrid-vue`, `@affino/datagrid-laravel` остаются доступными для advanced-интеграций, но продуктовый onboarding рекомендуется начинать с `@affino/datagrid`.

## Community

Для базовых сценариев:

- client row model
- sort/filter/pagination
- базовый state/events контур

Установка:

```bash
pnpm add @affino/datagrid
```

## Pro

Для тяжёлых/enterprise-сценариев:

- pivot/group/tree/aggregation
- worker-owned compute mode
- server/data-source row models
- advanced diagnostics/backpressure controls

Установка:

```bash
pnpm add @affino/datagrid @affino/datagrid-pro
```

Глобальная активация:

```ts
import { createDataGridRuntime } from "@affino/datagrid"
import { enableProFeatures } from "@affino/datagrid-pro"

enableProFeatures({
  licenseKey: process.env.DATAGRID_LICENSE!,
})

const runtime = createDataGridRuntime({ columns, rows })
```

Inline-активация:

```ts
import { createDataGridRuntime } from "@affino/datagrid"

const runtime = createDataGridRuntime({
  columns,
  rows,
  licenseKey: process.env.DATAGRID_LICENSE,
})
```

## Pro entrypoints для адаптеров

- Vue: `@affino/datagrid-vue/pro`
- Laravel: `@affino/datagrid-laravel/pro`
- Core: `@affino/datagrid-core/pro`

Это lower-level surface для команд, которые осознанно интегрируются ниже коммерческого фасада.
