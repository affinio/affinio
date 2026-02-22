---
title: Laravel integration (datagrid-laravel)
---

# Laravel integration

Package: `@affino/datagrid-laravel`

Use this package as the Laravel/Livewire-facing datagrid entrypoint. It provides a curated facade over `@affino/datagrid-core` and `@affino/datagrid-orchestration` so app code does not need to import those packages directly.

## 1) Install

```bash
pnpm add @affino/datagrid-laravel
```

`@affino/datagrid-core` and `@affino/datagrid-orchestration` are pulled internally.

## 2) What it is for

`@affino/datagrid-laravel` is intended for:

- Livewire page shells with client-side datagrid runtime
- vanilla JS datagrid demos inside Laravel apps
- Laravel-oriented integration code that still needs deterministic datagrid runtime/orchestration primitives

It is **not** a Blade component package by itself. It is a JS facade package for Laravel apps.

## 3) Quick import example (demo-style)

```ts
import {
  evaluateDataGridAdvancedFilterExpression,
  createDataGridRuntime,
  buildDataGridColumnLayers,
  resolveDataGridLayerTrackTemplate,
  useDataGridColumnLayoutOrchestration,
  useDataGridManagedWheelScroll,
  resolveDataGridHeaderLayerViewportGeometry,
  resolveDataGridHeaderScrollSyncLeft,
} from "@affino/datagrid-laravel"
```

This matches the Laravel datagrid demo integration path and avoids direct imports from `@affino/datagrid-core` / `@affino/datagrid-orchestration`.

## 4) Import policy (recommended)

Laravel app / demo code:

- import from `@affino/datagrid-laravel`

Core package development, benchmarks, or low-level framework-agnostic experiments:

- import from `@affino/datagrid-core` / `@affino/datagrid-orchestration`

## 5) Typical integration split

- Laravel (Blade/Livewire): DOM shell, controls, hydration lifecycle
- `@affino/datagrid-laravel`: datagrid runtime/orchestration facade
- DataGrid engine internals: hidden behind the facade

