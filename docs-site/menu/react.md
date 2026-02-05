---
title: Menu React
description: React 18 menu adapter with parity to Vue semantics.
---

# Menu React

`@affino/menu-react` uses the same `@affino/menu-core` behavior model as Vue.

## Install

```bash
pnpm add @affino/menu-react
```

Optional baseline styles:

```ts
import "@affino/menu-react/styles.css"
```

## Minimal usage

```tsx
import { UiMenu, UiMenuTrigger, UiMenuContent, UiMenuItem } from "@affino/menu-react"

export function ActionsMenu() {
  return (
    <UiMenu>
      <UiMenuTrigger asChild>
        <button type="button">File</button>
      </UiMenuTrigger>
      <UiMenuContent>
        <UiMenuItem id="rename">Rename</UiMenuItem>
        <UiMenuItem id="duplicate">Duplicate</UiMenuItem>
      </UiMenuContent>
    </UiMenu>
  )
}
```

## Parity guarantees

- Shared pointer intent and submenu behavior (`menu-core`)
- Same controller semantics as Vue adapter
- Same `asChild` composition pattern

## Troubleshooting

- Menu not opening in SSR app: verify client-side hydration for trigger handlers.
- Event duplication: avoid mounting multiple controllers for the same root id.
- Styling drift vs Vue: keep shared design tokens and class naming conventions.

## Related

- Getting started: [/menu/getting-started](/menu/getting-started)
- Core API: [/core/menu-core](/core/menu-core)
