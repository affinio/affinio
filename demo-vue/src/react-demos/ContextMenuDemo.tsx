import { useMemo, useState } from "react"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-react"

const canvasActions = [
  { label: "Create sticky", detail: "Drop a note at cursor" },
  { label: "Link block", detail: "Connect nodes with arrows" },
  { label: "Summon command palette", detail: "Open overlay", shortcut: "Ctrl+K" },
]

const destructiveActions = [
  { label: "Clear selection", detail: "Deselect everything" },
  { label: "Delete selection", detail: "Remove highlighted nodes", danger: true },
]

export default function ContextMenuDemo() {
  const [logs, setLogs] = useState<string[]>([])

  const lastLog = useMemo(() => logs[0] ?? "Awaiting your gesture", [logs])

  function pushLog(label: string) {
    const stamp = new Date().toLocaleTimeString()
    setLogs((prev) => [`${label} at ${stamp}`, ...prev].slice(0, 3))
  }

  return (
    <div className="menu-demo-surface flex flex-col items-center justify-center gap-6 text-center">
      <UiMenu>
        <UiMenuTrigger trigger="contextmenu" asChild>
          <button className="menu-demo-button">
            <span>Context Menu (Right-click)</span>
          </button>
        </UiMenuTrigger>
        <UiMenuContent className="menu-playground-panel">
          <UiMenuLabel>Canvas</UiMenuLabel>
          {canvasActions.map((action) => (
            <UiMenuItem key={action.label} onSelect={() => pushLog(action.label)}>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold">{action.label}</span>
                <span className="text-xs text-(--ui-menu-muted)">{action.detail}</span>
              </div>
              {action.shortcut && <span className="text-xs text-(--ui-menu-muted)">{action.shortcut}</span>}
            </UiMenuItem>
          ))}
          <UiMenuSeparator />
          {destructiveActions.map((action) => (
            <UiMenuItem key={action.label} danger={action.danger} onSelect={() => pushLog(action.label)}>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold">{action.label}</span>
                <span className="text-xs text-(--ui-menu-muted)">{action.detail}</span>
              </div>
            </UiMenuItem>
          ))}
        </UiMenuContent>
      </UiMenu>
      <div className="demo-last-action">
        <span className="demo-last-action__label">Last action</span>
        <span className="demo-last-action__value">{lastLog}</span>
      </div>
    </div>
  )
}
