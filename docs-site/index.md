---
title: Affino UI Lab
description: Framework-agnostic UI cores with Vue & React adapters for advanced interfaces.
---

# Welcome to Affino

Affino provides framework-agnostic UI cores paired with lightweight adapters for Vue 3 and React 18. Build intent-aware menus, high-performance virtualization, and spreadsheet-grade selection without compromising on accessibility or control.

- **Live demos:** <https://affino.dev>
- **GitHub:** <https://github.com/affinio/affinio>

## Architecture

Every Affino primitive follows a **core + adapter** pattern:

- **Core packages** — Pure TypeScript logic, zero framework deps, full test coverage
- **Framework adapters** — Thin reactive wrappers for Vue and React

This keeps the state machines portable while letting you stay in your framework's idioms.

## Packages

### Floating Surfaces

| Package | Description | Version |
| --- | --- | --- |
| **@affino/surface-core** | Shared surface state machine and positioning helpers | ![npm](https://img.shields.io/npm/v/@affino/surface-core) |
| **@affino/menu-core** | Headless menu engine with intent-aware pointer prediction | ![npm](https://img.shields.io/npm/v/@affino/menu-core) |
| **@affino/tooltip-core** | Deterministic tooltip controller with arrow + live-region helpers | ![npm](https://img.shields.io/npm/v/@affino/tooltip-core) |
| **@affino/popover-core** | Headless popover controller with trigger/content helpers | ![npm](https://img.shields.io/npm/v/@affino/popover-core) |
| **@affino/dialog-core** | Dialog engine with async guards and overlay stacking | ![npm](https://img.shields.io/npm/v/@affino/dialog-core) |
| **@affino/overlay-kernel** | Global overlay stack manager (dialog, popover, tooltip, etc.) | ![npm](https://img.shields.io/npm/v/@affino/overlay-kernel) |
| **@affino/overlay-host** | Portal host + scroll lock + global keydown helpers | ![npm](https://img.shields.io/npm/v/@affino/overlay-host) |

[-> Core surface docs](/core/surface-core)
[-> Menu documentation](/menu/)
[-> Tooltip documentation](/tooltip/)
[-> Popover documentation](/popover/)
[-> Dialog documentation](/dialog/)

### Selection + Input

| Package | Description | Version |
| --- | --- | --- |
| **@affino/selection-core** | Linear (1D) selection ranges with anchor/focus semantics | ![npm](https://img.shields.io/npm/v/@affino/selection-core) |
| **@affino/listbox-core** | Listbox state machine layered on top of linear selection | ![npm](https://img.shields.io/npm/v/@affino/listbox-core) |
| **@affino/combobox-core** | Combobox reducer that wraps listbox selection + filtering | ![npm](https://img.shields.io/npm/v/@affino/combobox-core) |
| **@affino/grid-selection-core** | Spreadsheet-grade grid selection engine | ![npm](https://img.shields.io/npm/v/@affino/grid-selection-core) |
| **@affino/selection-vue** | Vue 3 bindings for linear + listbox selection | ![npm](https://img.shields.io/npm/v/@affino/selection-vue) |

### Virtualization

| Package | Description | Version |
| --- | --- | --- |
| **@affino/virtualization-core** | Headless virtualization math and overscan controllers | ![npm](https://img.shields.io/npm/v/@affino/virtualization-core) |

### Utilities

| Package | Description | Version |
| --- | --- | --- |
| **@affino/aria-utils** | ARIA helpers for dialog surfaces | ![npm](https://img.shields.io/npm/v/@affino/aria-utils) |
| **@affino/focus-utils** | Focus and tab trap helpers | ![npm](https://img.shields.io/npm/v/@affino/focus-utils) |

## Getting Started

```bash
# Menu (Vue)
npm install @affino/menu-vue

# Menu (React)
npm install @affino/menu-react
```

See [Menu Getting Started](/menu/getting-started) for full setup.

## Snapshot preview

_The block below is a static rendering of the default glassmorphic menu skin used in the demos. It is decorative only._

<div class="menu-preview" aria-hidden="true">
  <div class="menu-preview__trigger">File</div>
  <div class="menu-preview__layout">
    <div class="menu-preview__panel">
      <div class="menu-preview__item">
        <span>New Project</span>
        <kbd>⌘N</kbd>
      </div>
      <div class="menu-preview__item">
        <span>Duplicate</span>
        <kbd>⌘D</kbd>
      </div>
      <div class="menu-preview__item menu-preview__item--active">
        <span>Share</span>
        <span class="menu-preview__submenu">›</span>
      </div>
      <div class="menu-preview__item">
        <span>Export</span>
        <kbd>⇧⌘E</kbd>
      </div>
      <div class="menu-preview__separator"></div>
      <div class="menu-preview__item menu-preview__item--danger">
        <span>Delete</span>
        <kbd>⌘⌫</kbd>
      </div>
    </div>
  </div>
</div>

<style scoped>
.menu-preview {
  max-width: 520px;
  margin: 2rem 0;
  border-radius: 24px;
  background: var(--preview-shell-bg);
  border: 1px solid var(--preview-border);
  box-shadow: var(--preview-shadow);
  padding: 1rem;
  color: var(--preview-text);
  font-family: 'Space Grotesk', 'DM Sans', system-ui;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
.menu-preview__layout {
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
}
.menu-preview__trigger {
  display: inline-flex;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--preview-border);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  color: var(--preview-muted);
}
.menu-preview__panel {
  flex: 1 1 240px;
  border-radius: 20px;
  background: var(--preview-panel-bg);
  border: 1px solid var(--preview-border);
  padding: 0.5rem 0;
}
.menu-preview__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.1rem;
  font-size: 0.95rem;
  color: var(--preview-text);
}
.menu-preview__item + .menu-preview__item {
  border-top: 1px solid var(--preview-separator);
}
.menu-preview__item kbd {
  font-size: 0.8rem;
  color: var(--preview-muted);
}
.menu-preview__separator {
  height: 1px;
  margin: 0.4rem 1rem;
  background: var(--preview-separator);
}

.menu-preview__item--danger {
  color: var(--preview-danger);
}
.menu-preview__item--active {
  background: rgba(139, 92, 246, 0.08);
  margin: 0.15rem 0;
}

.menu-preview__item--muted {
  color: var(--preview-muted);
}

@media (max-width: 540px) {
  .menu-preview__layout {
    flex-direction: column;
  }

  .menu-preview__panel {
    flex: 1 1 auto;
  }
}
</style>
