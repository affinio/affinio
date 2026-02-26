# Affino

**Affino** is the interaction layer for product teams who obsess over control, intent, and polish.

We build **headless UI primitives** that keep accessibility, performance, and behavior predictable — even inside the most demanding enterprise interfaces.

> Think **“precision cockpit”**, not “themeable widget”.

🌐 **Live demos:** https://affino.dev  
📚 **Docs:** https://docs.affino.dev

---

## Why Teams Pick Affino

- DataGrid and Treeview are first-class headless primitives for data-dense enterprise UIs.
- Predictable, accessible behavior for complex interaction-heavy interfaces.
- Framework-agnostic core with thin adapters (Vue, Laravel, React).

---

## Core Packages (Core Primitives)

| Package | Purpose |
|------|------|
| `@affino/datagrid-core` | Headless DataGrid runtime and deterministic model contracts |
| `@affino/treeview-core` | Headless hierarchical treeview controller |
| `@affino/surface-core` | Shared lifecycle + positioning primitives for floating surfaces |
| `@affino/overlay-kernel` | Shared overlay stack manager for focus, pointer, and scroll policies |
| `@affino/overlay-host` | Portal host + scroll lock helpers for overlays |
| `@affino/focus-utils` | Cross-framework focus helpers for overlays and menus |
| `@affino/aria-utils` | ARIA helpers for dialog and overlay primitives |
| `@affino/menu-core` | Framework-agnostic menu engine (state, intent, positioning) |
| `@affino/tooltip-core` | Deterministic tooltip controller built on the shared surface core |
| `@affino/popover-core` | Toggleable popover controller with trigger/content helpers and arrow positioning |
| `@affino/selection-core` | Headless selection primitives for linear lists |
| `@affino/listbox-core` | Listbox state machine built on selection-core |
| `@affino/combobox-core` | Combobox state helpers composed from listbox-core |
| `@affino/tabs-core` | Headless tabs controller |
| `@affino/disclosure-core` | Headless disclosure/accordion controller |

---

## Framework Adapters (Datagrid First)

Primary adapter surface (DataGrid):

Vue 3:

```ts
import { useAffinoDataGrid } from "@affino/datagrid-vue"

// DataGrid runtime + UI orchestration for Vue apps
const grid = useAffinoDataGrid(/* config */)
```

Laravel / Livewire:

```ts
import { createDataGridRuntime } from "@affino/datagrid-laravel"

// DataGrid runtime primitives for Livewire/Laravel integration
const runtime = createDataGridRuntime(/* config */)
```

Cross-framework bootstrap adapters:

Laravel / Livewire:

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters({
  registerScrollGuards: true,
  diagnostics: import.meta.env?.DEV ?? false,
})
```

Vue 3:

```ts
import { bootstrapAffinoVueAdapters } from "@affino/vue-adapter"

bootstrapAffinoVueAdapters({
  diagnostics: import.meta.env?.DEV ?? false,
})
```

Adapters are published for:
- DataGrid: `@affino/datagrid-vue`, `@affino/datagrid-laravel`
- Treeview: `@affino/treeview-vue`, `@affino/treeview-laravel`
- Laravel (Livewire): `@affino/laravel-adapter` + `*-laravel` packages
- Vue 3: `@affino/vue-adapter` + `*-vue` packages
- React: `@affino/menu-react` (menu system)

---

## Documentation & Demos

- Live demos: https://affino.dev
- Docs: https://docs.affino.dev
- Package-specific READMEs for deep API details
- Repository process docs: `docs/process/README.md`
- Ops runbooks: `docs/ops/slo-sla.md`

---

## Project Status

Affino is currently in **alpha**.

We actively partner with early teams to harden primitives, validate edge cases, and evolve the API responsibly.  
Feedback, issues, and real-world usage stories are always welcome.

---

## License

MIT
