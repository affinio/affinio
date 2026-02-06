# Affino

**Affino** is the interaction layer for product teams who obsess over control, intent, and polish.

We build **headless UI primitives** that keep accessibility, performance, and behavior predictable — even inside the most demanding enterprise interfaces.

> Think **“precision cockpit”**, not “themeable widget”.

🌐 **Live demos:** https://affino.dev  
📚 **Docs:** https://docs.affino.dev

---

## Why Teams Pick Affino

- Predictable, accessible, headless behavior for complex UI.
- Framework-agnostic core with thin adapters (Vue, Laravel, React).
- Designed for data-dense, enterprise-grade interaction flows.

---

## Core Packages (Core Primitives)

| Package | Purpose |
|------|------|
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
| `@affino/grid-selection-core` | Grid-based multi-range selection primitives |
| `@affino/tabs-core` | Headless tabs controller |
| `@affino/treeview-core` | Headless hierarchical treeview controller |
| `@affino/disclosure-core` | Headless disclosure/accordion controller |
| `@affino/virtualization-core` | High-performance virtualization building blocks |

---

## Framework Adapters (Quick Start)

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
- Laravel (Livewire): `@affino/laravel-adapter` + `*-laravel` packages
- Vue 3: `@affino/vue-adapter` + `*-vue` packages
- React: `@affino/menu-react` (menu system)

---

## Documentation & Demos

- Live demos: https://affino.dev
- Docs: https://docs.affino.dev
- Package-specific READMEs for deep API details

---

## Project Status

Affino is currently in **alpha**.

We actively partner with early teams to harden primitives, validate edge cases, and evolve the API responsibly.  
Feedback, issues, and real-world usage stories are always welcome.

---

## License

MIT
