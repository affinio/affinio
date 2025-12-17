import { useState } from "react"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-react"

const primaryActions = [
  { label: "Edit headline", description: "Tweak copy and CTA pairs", shortcut: "E" },
  { label: "Duplicate", description: "Clone layout and preserve bindings", shortcut: "D" },
  { label: "Share preview", description: "Generate signed review links", shortcut: "S" },
]

const secondaryActions = [
  { label: "Archive", description: "Freeze analytics without deleting", shortcut: "A" },
  { label: "Delete", description: "Remove project forever", shortcut: "Cmd+Del", danger: true },
]

export default function SimpleMenuDemo() {
  const [lastAction, setLastAction] = useState("None yet")

  return (
    <div className="menu-demo-inline">
      <UiMenu>
        <UiMenuTrigger asChild>
          <button className="menu-demo-button">Open React menu</button>
        </UiMenuTrigger>
        <UiMenuContent className="menu-playground-panel">
          <UiMenuLabel>Project</UiMenuLabel>
          <UiMenuSeparator />
          {primaryActions.map((action) => (
            <UiMenuItem key={action.label} onSelect={() => setLastAction(action.label)}>
              <div className="flex flex-1 flex-col text-left">
                <span className="text-sm font-semibold">{action.label}</span>
                <span className="text-xs text-(--ui-menu-muted)">{action.description}</span>
              </div>
              <span className="text-xs text-(--ui-menu-muted)">{action.shortcut}</span>
            </UiMenuItem>
          ))}
          <UiMenuSeparator />
          {secondaryActions.map((action) => (
            <UiMenuItem key={action.label} danger={action.danger} onSelect={() => setLastAction(action.label)}>
              <div className="flex flex-1 flex-col text-left">
                <span className="text-sm font-semibold">{action.label}</span>
                <span className="text-xs text-(--ui-menu-muted)">{action.description}</span>
              </div>
              <span className="text-xs text-(--ui-menu-muted)">{action.shortcut}</span>
            </UiMenuItem>
          ))}
        </UiMenuContent>
      </UiMenu>
      <dl className="demo-last-action">
        <dt className="demo-last-action__label">Last action</dt>
        <dd className="demo-last-action__value">{lastAction}</dd>
      </dl>
    </div>
  )
}
