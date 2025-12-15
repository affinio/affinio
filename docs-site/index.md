---
title: Affino UI Lab
description: Experiments around intent-aware menus and UI infrastructure.
---

# Welcome to Affino UI Lab

This is the public workspace for Affino’s headless UI experiments. The current focus is **@affino/menu-vue** — an intent-aware menu system for Vue 3 that mirrors native desktop behavior while staying fully headless.

- **Live demos:** <https://ui.unitlab.io>
- **Docs landing:** [/menu/](/menu/)
- **GitHub:** <https://github.com/affinio/affinio>

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
