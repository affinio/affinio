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

### Menu System

| Package | Description | Version |
| --- | --- | --- |
| **@affino/menu-core** | Headless menu engine with diagonal pointer prediction, keyboard nav, nested submenus | ![npm](https://img.shields.io/npm/v/@affino/menu-core) |
| **@affino/menu-vue** | Vue 3 adapter with renderless components and controller hooks | ![npm](https://img.shields.io/npm/v/@affino/menu-vue) |
| **@affino/menu-react** | React 18 adapter mirroring the Vue API surface | ![npm](https://img.shields.io/npm/v/@affino/menu-react) |

[→ Menu documentation](/menu/)

### Virtualization (Coming Soon)

| Package | Description |
| --- | --- |
| **@affino/virtualization-core** | High-performance virtual scrolling engine |

### Selection (Coming Soon)

| Package | Description |
| --- | --- |
| **@affino/selection-core** | Spreadsheet-grade cell selection with keyboard/mouse navigation |

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
