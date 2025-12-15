# Affino

Affino is the interaction layer for product teams who obsess over control, intent, and polish. We build headless UI primitives that keep accessibility and performance predictable even inside the most demanding enterprise interfaces. The first release ships menu adapters for **Vue 3** and **React 18**, both powered by the same framework-agnostic core.

> Think “precision cockpit” rather than “themeable widget.”

---

## Why Teams Pick Affino

- **Predictable behavior** — deterministic state machines, zero surprise latency, confident QA stories.
- **Accessibility baked in** — every primitive assumes screen readers, keyboard loops, and pointer intent from day one.
- **Framework-agnostic core** — logic lives outside the view layer, so you can adapt it to Vue today and anything else tomorrow.
- **Serious depth** — diagonal hover intent, infinite submenu trees, snapshot-driven subscriptions, and controller APIs for automation.
- **Zero lock-in** — you keep your DOM, design system, and rendering strategies; Affino only supplies the brains.

---

## Crafted For

- Engineering dashboards and internal tools where correctness outweighs animations.
- Data-dense frontends that mix keyboard, mouse, pen, and automation flows.
- Product teams who need premium UX primitives without inheriting someone else’s styling opinions.

---

## Interaction Pillars

- **Headless menus** with shared tree state, safe focus handoffs, and programmatic control.
- **Intent-aware pointer logic** that keeps submenus open during diagonal travel and respects human hesitation.
- **Snapshot subscriptions** that eliminate render thrash and keep large lists responsive.
- **Positioning intelligence** with viewport-safe geometry and gutter controls, no extra runtime dependencies.

---

## Menu Adapters

| Package | Framework | Status | Notes |
| --- | --- | --- | --- |
| `@affino/menu-vue` | Vue 3.4+ | Alpha | Renderless components with `asChild`, controller hooks, and Tailwind-friendly motion markers. |
| `@affino/menu-react` | React 18+ | Alpha | Mirrors the Vue API surface with hooks, headless components, and identical controller contracts. |

Use the framework toggle in the demo header to switch between adapters instantly.

---

## Where To Go Next

Full product guides, API references, and integration recipes live in [docs/index.md](docs/index.md). That’s where you’ll find installation steps, package breakdowns, and migration notes.

Affino is currently in **alpha**. We partner closely with early teams to harden the primitives, so feedback and real-world edge cases are always welcome.

---

## License

MIT
