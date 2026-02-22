---
title: Vue API Reference (datagrid-vue)
---

# Vue API Reference

Пакет: `@affino/datagrid-vue`

Это карта API для Vue-команд, которые хотят собирать и поддерживать DataGrid без прямых импортов `@affino/datagrid-core` и `@affino/datagrid-orchestration`.

## Установка (Vue-only путь)

```bash
pnpm add @affino/datagrid-vue
```

`@affino/datagrid-core` и `@affino/datagrid-orchestration` подтягиваются как внутренние зависимости адаптера.

## Entrypoints

### `@affino/datagrid-vue` (stable)

Используйте для продуктовых Vue-интеграций.

- `AffinoDataGridSimple` - готовый компонент для быстрого старта
- `DataGrid` - более низкоуровневый компонент
- `useAffinoDataGrid` - sugar API (фиче-ориентированная сборка грида)
- `useAffinoDataGridMinimal` - облегчённый sugar-путь
- `useAffinoDataGridUi` - биндинги для кастомного рендера
- `useDataGridRuntime` - runtime composable (rows/columns/api lifecycle)
- `createDataGridVueRuntime` - явная фабрика runtime
- `useDataGridContextMenu` - state/controller контекстного меню
- `useDataGridSettingsStore`, `createDataGridSettingsAdapter` - сохранение настроек

Stable-фасад также реэкспортит общие типы и pure helpers:

- `DataGridColumnDef`
- `DataGridFilterSnapshot`
- `DataGridSortState`
- `DataGridAggregationModel`
- `DataGridClientRowPatch`
- `createClientRowModel`
- `createDataGridColumnModel`
- `createDataGridSelectionSummary`
- `evaluateDataGridAdvancedFilterExpression`

### `@affino/datagrid-vue/components`

Компонентный entrypoint (шаблонный путь).

- `DataGrid`
- `AffinoDataGridSimple`

### `@affino/datagrid-vue/advanced`

Advanced Vue composables для кастомной wiring-логики interaction/layout.

Типичные случаи:

- `useDataGridManagedWheelScroll`
- `useDataGridColumnLayoutOrchestration`
- `useDataGridHeaderSortOrchestration`
- `useDataGridSelectionOverlayOrchestration`
- `useDataGridViewportScrollLifecycle`
- `useDataGridLinkedPaneScrollSync`
- `createDataGridViewportController` (re-export)

Используйте этот entrypoint, когда `useAffinoDataGrid` уже недостаточно и вы собираете кастомный рендер/runtime integration.

## Основные сценарии (Vue-only)

## 1) Быстрый продуктовый грид (`AffinoDataGridSimple`)

```ts
import { ref } from "vue"
import type { DataGridColumnDef } from "@affino/datagrid-vue"
import { AffinoDataGridSimple } from "@affino/datagrid-vue/components"

const rows = ref([
  { rowId: "1", service: "edge", owner: "NOC" },
])

const columns: DataGridColumnDef[] = [
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
]
```

## 2) Sugar API (`useAffinoDataGrid`)

Используйте, если нужны features + custom UI bindings, но без прямой сборки через Core.

```ts
import { ref } from "vue"
import { useAffinoDataGrid } from "@affino/datagrid-vue"

const grid = useAffinoDataGrid({
  rows: ref([]),
  columns: ref([]),
  features: {
    selection: true,
    clipboard: true,
    editing: true,
    filtering: true,
    summary: true,
    visibility: true,
    tree: true,
    keyboardNavigation: true,
  },
})
```

Ключевые outputs:

- `grid.componentProps` - прямой bind в `DataGrid`
- `grid.bindings.*` - helpers для кастомного рендера
- `grid.features.*` - команды/состояние features
- `grid.pagination`, `grid.columnState`, `grid.history` - wrappers
- `grid.api` - unified Grid API facade

## 3) Runtime API (`useDataGridRuntime`)

Используйте, если нужен явный контроль runtime/rows/columns без полного sugar feature-layer.

```ts
import { ref } from "vue"
import { useDataGridRuntime, type DataGridColumnDef } from "@affino/datagrid-vue"

const rows = ref([{ rowId: "r-1", service: "edge" }])
const columns = ref<DataGridColumnDef[]>([{ key: "service", label: "Service", width: 220 }])

const runtime = useDataGridRuntime({ rows, columns })
```

Самые важные runtime методы/refs:

- `runtime.api` - Grid API facade
- `runtime.rowModel`, `runtime.columnModel`, `runtime.core`
- `runtime.columnSnapshot`, `runtime.virtualWindow`
- `runtime.setRows(rows)`
- `runtime.patchRows(updates, options?)`
- `runtime.applyEdits(updates, options?)`
- `runtime.reapplyView()`
- `runtime.autoReapply` (`Ref<boolean>`)
- `runtime.setAggregationModel(model)`, `runtime.getAggregationModel()`

## Политика редактирования и reapply (Excel-style)

Рекомендуемый продуктовый паттерн:

- `applyEdits()` для интерактивного редактирования ячеек
- `autoReapply=false` (по умолчанию), чтобы избежать “прыжков” sort/filter/group
- `reapplyView()` по явному действию пользователя или после commit edit-сессии

```ts
runtime.applyEdits([{ rowId: "r-1", data: { tested_at: "2026-02-22T10:05:00Z" } }])
runtime.reapplyView()
```

Включайте live reapply только если UX этого требует:

```ts
runtime.autoReapply.value = true
```

## Feature-to-API map (с чего начинать)

- Быстрая таблица: `AffinoDataGridSimple`
- Product grid с фичами: `useAffinoDataGrid`
- Кастомный рендер: `useAffinoDataGridUi`
- Runtime patching / streaming rows: `useDataGridRuntime`
- Advanced wheel/layout/selection orchestration: `@affino/datagrid-vue/advanced`

## Когда выходить за пределы Vue-фасада

Большинству Vue-приложений это не нужно.

Прямые импорты `@affino/datagrid-core` / `@affino/datagrid-orchestration` оправданы только если вы осознанно строите:

- framework-agnostic интеграции
- не-Vue адаптеры
- low-level deterministic runtime эксперименты
- документацию/тесты для самих core/orchestration пакетов

