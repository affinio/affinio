import { useMemo, useState } from "react"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-react"

const segments = [
  { label: "VIP accounts", key: "vip", detail: "MRR > 10K", metric: "+32%" },
  { label: "Churn risk", key: "risk", detail: "Low usage", metric: "12" },
  { label: "Beta testers", key: "beta", detail: "Cohort 4", metric: "64" },
]

const automationActions = [
  { label: "Dispatch nurture flow", detail: "Send drip to selected segments" },
  { label: "Export to warehouse", detail: "Sync snapshot to Snowflake" },
]

export default function CommandMenuDemo() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(["vip", "beta"]))
  const [lastAction, setLastAction] = useState("Awaiting input")

  const activeList = useMemo(() => Array.from(activeKeys), [activeKeys])

  function toggleSegment(key: string) {
    setActiveKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      const segment = segments.find((entry) => entry.key === key)
      setLastAction(segment ? `Toggled ${segment.label} (${next.has(key) ? "On" : "Off"})` : "Selection toggled")
      return next
    })
  }

  function setAutomation(label: string) {
    setLastAction(label)
  }

  return (
    <div className="menu-demo-surface flex flex-col items-center justify-center gap-6 text-center">
      <UiMenu options={{ closeOnSelect: false }}>
        <UiMenuTrigger asChild>
          <button className="menu-demo-button">
            <span>Menu</span>
          </button>
        </UiMenuTrigger>
        <UiMenuContent className="menu-playground-panel">
          <UiMenuLabel>Segments</UiMenuLabel>
          {segments.map((segment) => {
            const isActive = activeKeys.has(segment.key)
            return (
              <UiMenuItem key={segment.key} onSelect={() => toggleSegment(segment.key)}>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold">{segment.label}</span>
                  <span className="text-xs text-(--ui-menu-muted)">{segment.detail}</span>
                </div>
                <span className={`text-xs font-semibold ${isActive ? "text-emerald-400" : "text-(--ui-menu-muted)"}`}>
                  {isActive ? "On" : "Off"} - {segment.metric}
                </span>
              </UiMenuItem>
            )
          })}
          <UiMenuSeparator />
          <UiMenuLabel>Automation</UiMenuLabel>
          {automationActions.map((action) => (
            <UiMenuItem key={action.label} onSelect={() => setAutomation(action.label)}>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold">{action.label}</span>
                <span className="text-xs text-(--ui-menu-muted)">{action.detail}</span>
              </div>
            </UiMenuItem>
          ))}
        </UiMenuContent>
      </UiMenu>
      <div className="w-full space-y-3 text-sm text-(--text-muted)">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-(--text-soft)">Active segments</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {activeList.length ? (
              activeList.map((segment) => (
                <span key={segment} className="demo-chip">
                  {segment}
                </span>
              ))
            ) : (
              <span className="demo-chip demo-chip--muted">None selected yet</span>
            )}
          </div>
        </div>
        <div className="demo-last-action">
          <span className="demo-last-action__label">Last action</span>
          <span className="demo-last-action__value">{lastAction}</span>
        </div>
      </div>
    </div>
  )
}
