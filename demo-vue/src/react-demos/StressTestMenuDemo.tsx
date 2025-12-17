import { useMemo, useState, type CSSProperties } from "react"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuSeparator,
  UiMenuLabel,
  UiSubMenu,
  UiSubMenuTrigger,
  UiSubMenuContent,
} from "@affino/menu-react"

const itemCounts = [50, 200, 500, 1000] as const
const nestedDepthOptions = [3, 5, 10] as const
const widthOptions = [280, 340, 420, 520] as const

type PanelStyle = CSSProperties & { "--ui-menu-max-width"?: string }

type NestedChainProps = {
  level: number
  maxLevel: number
  menuMaxWidth: number
  onSelect: (label: string) => void
  onDanger: () => void
}

function NestedChain({ level, maxLevel, menuMaxWidth, onSelect, onDanger }: NestedChainProps) {
  const hasChild = level < maxLevel
  const nextProps = { level: level + 1, maxLevel, menuMaxWidth, onSelect, onDanger }
  const widthValue = `${menuMaxWidth}px`
  const panelStyle: PanelStyle = {
    "--ui-menu-max-width": widthValue,
    width: widthValue,
    maxWidth: `min(100%, ${widthValue})`,
  }

  return (
    <UiSubMenu>
      <UiSubMenuTrigger>Nested level {level}</UiSubMenuTrigger>
      <UiSubMenuContent className="menu-playground-panel" style={panelStyle}>
        <UiMenuLabel>Level {level}</UiMenuLabel>
        <UiMenuSeparator />
        <UiMenuItem onSelect={() => onSelect(`L${level}-A`)}>Level {level} - A</UiMenuItem>
        <UiMenuItem onSelect={() => onSelect(`L${level}-B`)}>Level {level} - B</UiMenuItem>
        {hasChild ? (
          <NestedChain {...nextProps} />
        ) : (
          <>
            <UiMenuSeparator />
            <UiMenuItem danger onSelect={onDanger}>
              Dangerous leaf
            </UiMenuItem>
          </>
        )}
      </UiSubMenuContent>
    </UiSubMenu>
  )
}

export default function StressTestMenuDemo() {
  const [selectedCount, setSelectedCount] = useState<(typeof itemCounts)[number]>(200)
  const [dynamicItems, setDynamicItems] = useState(() =>
    Array.from({ length: 20 }, (_, index) => ({ id: index + 1, label: `Dynamic ${index + 1}` })),
  )
  const [enableScrollableContainer, setEnableScrollableContainer] = useState(false)
  const [enableTransform, setEnableTransform] = useState(false)
  const [enableRTL, setEnableRTL] = useState(false)
  const [enableNested, setEnableNested] = useState(true)
  const [nestedDepth, setNestedDepth] = useState<(typeof nestedDepthOptions)[number]>(3)
  const [menuMaxWidth, setMenuMaxWidth] = useState<(typeof widthOptions)[number]>(340)
  const [lastEvent, setLastEvent] = useState("Awaiting selection")

  const panelStyle: PanelStyle = {
    height: enableScrollableContainer ? "320px" : undefined,
    overflow: enableScrollableContainer ? "auto" : undefined,
    transform: enableTransform ? "scale(0.94)" : undefined,
    "--ui-menu-max-width": `${menuMaxWidth}px`,
  }

  const menuContentStyle = useMemo<PanelStyle>(() => {
    const widthValue = `${menuMaxWidth}px`
    return {
      "--ui-menu-max-width": widthValue,
      width: widthValue,
      maxWidth: `min(100%, ${widthValue})`,
    }
  }, [menuMaxWidth])

  const dirAttr = enableRTL ? "rtl" : "ltr"

  const stressStats = useMemo(
    () => [
      { label: "Root items", value: selectedCount.toString() },
      { label: "Dynamic set", value: dynamicItems.length.toString() },
      { label: "Submenus", value: enableNested ? "Enabled" : "Disabled" },
    ],
    [selectedCount, dynamicItems.length, enableNested],
  )

  const toggles = [
    {
      key: "scroll",
      label: "Scroll container",
      description: "Wrap in a 320px viewport to test parent scrolling.",
      value: enableScrollableContainer,
      toggle: () => setEnableScrollableContainer((prev) => !prev),
    },
    {
      key: "transform",
      label: "Parent transform",
      description: "Scale the parent to surface GPU edge cases.",
      value: enableTransform,
      toggle: () => setEnableTransform((prev) => !prev),
    },
    {
      key: "rtl",
      label: "RTL",
      description: "Flip layout direction and pointer heuristics.",
      value: enableRTL,
      toggle: () => setEnableRTL((prev) => !prev),
    },
    {
      key: "nested",
      label: "Nested levels",
      description: "Toggle the submenu chain on/off.",
      value: enableNested,
      toggle: () => setEnableNested((prev) => !prev),
    },
  ] as const

  function onSelect(label: string | number) {
    const payload = typeof label === "number" ? `Item ${label}` : label
    setLastEvent(payload)
  }

  function onDanger() {
    setLastEvent("Danger invoked")
  }

  function addDynamic() {
    setDynamicItems((prev) => {
      const nextId = prev.length + 1
      return [...prev, { id: nextId, label: `Dynamic ${nextId}` }]
    })
  }

  function removeDynamic() {
    setDynamicItems((prev) => prev.slice(0, -1))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className={`space-y-6 ${enableRTL ? "order-2 lg:order-2" : "order-1 lg:order-1"}`}>
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Performance lab</p>
          <h3 className="text-2xl font-semibold">Stress menus with 1K items, transforms, and RTL in one place.</h3>
          <p className="text-sm text-(--text-muted)">
            Use this playground to reproduce the gnarly cases product engineers send us. Crank the item count, wrap the
            menu in scrollable parents, flip direction, or disable nested chains — the controller keeps intent and focus logic in sync.
          </p>
          <ul className="space-y-2 text-sm text-(--text-muted)">
            <li>Diagonal prediction and viewport collision continue to run at 60fps.</li>
            <li>State machine stays deterministic even with hundreds of items in the tree.</li>
            <li>Great for QA teams validating transform + scroll containers.</li>
          </ul>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {stressStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-(--glass-border) px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-(--text-muted)">{stat.label}</p>
                <p className="text-lg font-semibold text-(--text-primary)">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-(--glass-border) p-5 text-sm text-(--text-muted)">
          <p className="text-xs uppercase tracking-[0.3em] text-(--text-soft)">Dataset controls</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-left">
              Items count
              <select
                value={selectedCount}
                onChange={(event) => setSelectedCount(Number(event.target.value) as (typeof itemCounts)[number])}
                className="dataset-select mt-2 rounded-2xl px-4 py-2 text-base font-semibold"
              >
                {itemCounts.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-left">
              Nested depth
              <select
                value={nestedDepth}
                onChange={(event) => setNestedDepth(Number(event.target.value) as (typeof nestedDepthOptions)[number])}
                className="dataset-select mt-2 rounded-2xl px-4 py-2 text-base font-semibold"
              >
                {nestedDepthOptions.map((depth) => (
                  <option key={depth} value={depth}>
                    {depth} levels
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-left">
              Menu max width
              <select
                value={menuMaxWidth}
                onChange={(event) => setMenuMaxWidth(Number(event.target.value) as (typeof widthOptions)[number])}
                className="dataset-select mt-2 rounded-2xl px-4 py-2 text-base font-semibold"
              >
                {widthOptions.map((width) => (
                  <option key={width} value={width}>
                    {width} px
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <button type="button" className="dataset-button rounded-full px-4 py-2 text-sm font-semibold" onClick={addDynamic}>
                Add dynamic
              </button>
              <button type="button" className="dataset-button rounded-full px-4 py-2 text-sm font-semibold" onClick={removeDynamic}>
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-(--glass-border) p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-(--text-soft)">Edge-case toggles</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {toggles.map((toggle) => (
              <button
                key={toggle.key}
                type="button"
                className="stress-toggle"
                aria-pressed={toggle.value}
                onClick={toggle.toggle}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{toggle.label}</span>
                  <span className={`toggle-indicator ${toggle.value ? "is-on" : "is-off"}`}></span>
                </div>
                <p className="text-xs text-(--text-muted)">{toggle.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`menu-demo-inline ${
          enableRTL ? "order-1 lg:order-1" : "order-2 lg:order-2"
        }`}
        dir={dirAttr}
      >
        <div className="stress-target flex w-full flex-col items-center gap-6" style={panelStyle}>
          <p className="text-sm text-(--text-soft)">
            {enableScrollableContainer ? "Scroll parent" : "Free layout"} · {enableTransform ? "Transformed" : "Normal"} container
          </p>
          {enableScrollableContainer && (
            <div className="w-full space-y-3 text-left text-sm leading-relaxed text-(--text-muted)">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum gravida velit non orci bibendum, in vulputate odio aliquet. Integer cursus nibh ac tellus consequat, id tempor risus fermentum.
              </p>
              <p>
                Vivamus non arcu sit amet magna pellentesque efficitur. Donec pharetra sem vitae arcu suscipit, vel faucibus nibh fermentum. Cras lacinia erat ac dui ornare, in facilisis nulla gravida.
              </p>
            </div>
          )}
          <UiMenu>
            <UiMenuTrigger trigger="both" asChild>
              <button className="menu-demo-button">
                <span>Open stress-test menu</span>
                <span>{enableRTL ? "RTL layout" : "LTR layout"}</span>
              </button>
            </UiMenuTrigger>
            <UiMenuContent className="menu-playground-panel" style={menuContentStyle}>
              <UiMenuLabel>Root items ({selectedCount})</UiMenuLabel>
              <UiMenuSeparator />
              {Array.from({ length: selectedCount }, (_, index) => (
                <UiMenuItem key={`root-${index + 1}`} onSelect={() => onSelect(index + 1)}>
                  Item {index + 1}
                </UiMenuItem>
              ))}
              <UiMenuSeparator />
              <UiMenuLabel>Dynamic items ({dynamicItems.length})</UiMenuLabel>
              {dynamicItems.map((item) => (
                <UiMenuItem key={item.id} onSelect={() => onSelect(item.label)}>
                  {item.label}
                </UiMenuItem>
              ))}
              <UiMenuSeparator />
              {enableNested && (
                <NestedChain
                  level={1}
                  maxLevel={nestedDepth}
                  menuMaxWidth={menuMaxWidth}
                  onSelect={onSelect}
                  onDanger={onDanger}
                />
              )}
              <UiMenuSeparator />
              <UiMenuItem danger onSelect={onDanger}>
                Delete something
              </UiMenuItem>
            </UiMenuContent>
          </UiMenu>
        </div>
        <div className="demo-last-action">
          <span className="demo-last-action__label">Last action</span>
          <span className="demo-last-action__value">{lastEvent}</span>
        </div>
      </div>
    </div>
  )
}
