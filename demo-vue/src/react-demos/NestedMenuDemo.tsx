import { useState } from "react"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
  UiSubMenu,
  UiSubMenuTrigger,
  UiSubMenuContent,
} from "@affino/menu-react"

const stacks = [
  {
    label: "Analytics",
    code: "AN",
    note: "Funnels, retention, pulse",
    items: ["Sessions", "Funnel analysis", "Cohort compare", "Pulse alerts"],
  },
  {
    label: "Automation",
    code: "AU",
    note: "Playbooks and jobs",
    items: ["Create schedule", "Sync segments", "Trigger webhooks"],
  },
  {
    label: "Access",
    code: "AC",
    note: "Teams, roles, audit",
    items: ["Invite teammate", "Promote to admin", "Transfer ownership"],
  },
]

export default function NestedMenuDemo() {
  const [lastSelection, setLastSelection] = useState("Waiting for highlight")

  return (
    <div className="menu-demo-surface flex flex-col items-center justify-center gap-6 text-center">
      <UiMenu options={{ openDelay: 60, closeDelay: 140 }}>
        <UiMenuTrigger asChild>
          <button className="menu-demo-button">
            <span>Menu</span>
          </button>
        </UiMenuTrigger>
        <UiMenuContent className="menu-playground-panel">
          <UiMenuLabel>Stacks</UiMenuLabel>
          <UiMenuSeparator />
          {stacks.map((stack) => (
            <UiSubMenu key={stack.label}>
              <UiSubMenuTrigger>
                <div className="flex flex-1 items-center gap-3 text-left">
                  <span className="stack-code-pill">{stack.code}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{stack.label}</span>
                    <span className="text-xs text-(--ui-menu-muted)">{stack.note}</span>
                  </div>
                </div>
              </UiSubMenuTrigger>
              <UiSubMenuContent className="menu-playground-panel">
                {stack.items.map((item) => (
                  <UiMenuItem key={item} onSelect={() => setLastSelection(item)}>
                    <span className="text-sm font-semibold">{item}</span>
                    <span className="text-xs text-(--ui-menu-muted)">Enter</span>
                  </UiMenuItem>
                ))}
              </UiSubMenuContent>
            </UiSubMenu>
          ))}
        </UiMenuContent>
      </UiMenu>
      <div className="demo-last-action">
        <span className="demo-last-action__label">Last action</span>
        <span className="demo-last-action__value">{lastSelection}</span>
      </div>
    </div>
  )
}
