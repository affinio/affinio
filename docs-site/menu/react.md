---
title: Menu React
description: Headless React 18 menu primitives that mirror the Vue adapter.
---

# Menu React

`@affino/menu-react` brings the exact same controller surface and pointer heuristics to React 18. It reuses `@affino/menu-core`, so behavior matches the Vue adapter—only the component syntax changes.

## Install

```bash
pnpm add @affino/menu-react
# npm install @affino/menu-react
# yarn add @affino/menu-react
```

Import the base styles once (or replace them with your own tokens):

```ts
import "@affino/menu-react/styles.css"
```

## Minimal dropdown

```tsx
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuSeparator,
} from "@affino/menu-react"

const actions = [
  { label: "Rename", shortcut: "F2" },
  { label: "Duplicate", shortcut: "Cmd+D" },
]

export function ActionsMenu() {
  return (
    <UiMenu>
      <UiMenuTrigger asChild>
        <button className="MenuButton">File</button>
      </UiMenuTrigger>
      <UiMenuContent className="MenuPanel">
        {actions.map((action) => (
          <UiMenuItem key={action.label} onSelect={() => console.log(action.label)}>
            <div className="MenuItem">
              <span>{action.label}</span>
              <kbd>{action.shortcut}</kbd>
            </div>
          </UiMenuItem>
        ))}
        <UiMenuSeparator className="MenuSeparator" />
        <UiMenuItem danger onSelect={() => console.log("Delete") }>
          Delete
        </UiMenuItem>
      </UiMenuContent>
    </UiMenu>
  )
}
```

## Feature parity

- **Controller API** – `useMenuController`, `useMenu`, and `useMenuShortcuts` ship with the React adapter just like the Vue package.
- **`asChild` pattern** – Wrap any DOM structure (Radix-style) while keeping refs and events intact.
- **Pointer heuristics** – Diagonal intent prediction, grace zones, and viewport collision all live in `@affino/menu-core`, so there is no behavioral drift.
- **SSR ready** – Works inside Next.js / Remix. DOM-only logic is guarded behind layout effects.

## Sharing demos

The live playground now includes a framework toggle so you can compare Vue and React implementations without reloading the page. All docs on this site show both code paths via code groups—pick whichever fits your stack.

Need details on controllers, styling hooks, or advanced topics? Reuse the other sections of the docs—every concept applies 1:1 to React.
