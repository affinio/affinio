````markdown
---
title: Dialog System
description: Deterministic dialogs and sheets backed by Affino surfaces with adapters for Vue and Laravel.
---

# Dialog System

Affino dialogs share a single state machine that handles overlay stacking, scroll locking, and focus orchestration across frameworks. `@affino/dialog-core` is the headless controller, while the Vue and Laravel adapters take care of DOM wiring and hydration so you can focus on markup.

## Packages

| Package | Description |
| --- | --- |
| **@affino/dialog-core** | Pure TypeScript controller with overlay registrar, pending close guards, and focus orchestrators. |
| **@affino/dialog-vue** | Vue 3 bindings that expose `useDialogController`, focus orchestrators, and stacking registrars. |
| **@affino/dialog-laravel** | Blade + Livewire helper that emits stable data attributes and hydrates dialogs after every morph. |

## Laravel quick start

```bash
composer require affino/dialog-laravel
php artisan vendor:publish --tag=affino-dialog-laravel-assets
```

```ts
import "./bootstrap"
import { bootstrapAffinoDialogs } from "@affino/dialog-laravel"

bootstrapAffinoDialogs()
```

```blade
<x-affino-dialog dialog-id="ops-dialog" labelled-by="ops-dialog-title">
    <x-slot:trigger>
        <button class="DemoTrigger">Launch command palette</button>
    </x-slot:trigger>

    <div class="DemoModal">
        <header>
            <h3 id="ops-dialog-title">Command palette</h3>
            <button data-affino-dialog-dismiss="programmatic">Close</button>
        </header>
    </div>
</x-affino-dialog>
```

- `dialog-id` feeds ARIA relationships (`aria-controls`, `aria-labelledby`) and anchors manual controllers.
- The helper inserts focus sentinels and a backdrop automatically and locks scroll while the dialog is open.
- Teleportation is enabled by default (`#affino-dialog-host`), so dialogs render outside nested stacking contexts.

## Manual controllers

Dispatch `affino-dialog:manual` when Livewire (or any JS) should open/close the dialog without clicking the trigger:

```php
$this->dispatch('affino-dialog:manual', id: 'ops-dialog', action: 'open', reason: 'programmatic');
$this->dispatch('affino-dialog:manual', id: 'ops-dialog', action: 'close', options: ['metadata' => ['confirmDiscard' => true]]);
```

The JS bridge retries for ~20 animation frames so the controller is available even if you dispatch immediately after a morph.

## Overlay behaviors

- Scroll locking and Escape guards are global—open overlays increase a ref count so nested dialogs do not fight each other.
- Passing `pinned` (or `data-affino-dialog-pinned="true"`) keeps the open state across Livewire rerenders.
- Sheets (`overlay-kind="sheet"`) reuse the same controller while letting you build tray-like layouts that do not trap focus.
- `close-strategy="optimistic"` exposes pending close callbacks so you can run async guards before the overlay disappears.

## Vue adapter snapshot

```vue
<script setup lang="ts">
import { useDialogController, createDialogFocusOrchestrator } from "@affino/dialog-vue"

const binding = useDialogController({
  focusOrchestrator: createDialogFocusOrchestrator({
    dialog: () => surfaceRef.value,
    initialFocus: () => surfaceRef.value?.querySelector("button"),
    returnFocus: () => triggerRef.value,
  }),
})
</script>
```

Use the same overlay registrar between Vue and Laravel when you mix adapters—the core contract is shared across frameworks.
````
