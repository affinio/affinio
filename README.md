# Affino

**Affino** is the interaction layer for product teams who obsess over control, intent, and polish.

We build **headless UI primitives** that keep accessibility, performance, and behavior predictable — even inside the most demanding enterprise interfaces.

> Think **“precision cockpit”**, not “themeable widget”.

🌐 **Live demos & docs:** https://affino.dev

---

## Why Teams Pick Affino

- **Predictable behavior**  
  Deterministic state machines, explicit transitions, zero surprise latency. QA-friendly by design.

- **Accessibility baked in**  
  Screen readers, keyboard loops, focus restoration, and pointer intent are first-class concerns.

- **Framework-agnostic core**  
  All interaction logic lives outside the view layer. Vue today, React tomorrow, anything next.

- **Serious depth**  
  Diagonal hover intent, infinite submenu trees, snapshot-driven subscriptions, controller APIs for automation.

- **Zero lock-in**  
  You keep your DOM, design system, routing, and rendering strategies. Affino only supplies the brains.

---

## Crafted For

- Engineering dashboards and internal tools where correctness outweighs decoration.
- Data-dense frontends mixing keyboard, mouse, pen, and automation flows.
- Product teams who want **premium UX primitives** without inheriting someone else’s styling opinions.

---

## Interaction Pillars

- **Headless menus**  
  Shared tree state, safe focus handoffs, nested coordination, and full programmatic control.

- **Intent-aware pointer logic**  
  Grace zones and timers keep submenus open during diagonal travel and respect human hesitation.

- **Snapshot subscriptions**  
  No render thrash, no hidden observers — just deterministic state snapshots.

- **Positioning intelligence**  
  Viewport-safe geometry, collision handling, and gutter control with zero runtime dependencies.

---

## Core Packages

| Package | Purpose |
|------|------|
| `@affino/menu-core` | Framework-agnostic menu engine (state, intent, positioning) |
| `@affino/selection-core` | Grid and range selection primitives |
| `@affino/virtualization-core` | High-performance virtualization building blocks |

---

## Menu Adapters

| Package | Framework | Status | Notes |
|------|------|------|------|
| `@affino/menu-vue` | Vue 3.4+ | Alpha | Renderless components, `asChild`, controller hooks, Tailwind-friendly motion markers |
| `@affino/menu-react` | React 18+ | Alpha | Mirrors Vue API with hooks, headless components, and identical controller contracts |

You can switch between Vue and React demos instantly using the framework toggle on the site.

👉 **Try it live:** https://affino.dev

---

## Documentation & Demos

- 🧪 **Live interaction demos:** https://affino.dev
- 🧩 **Framework adapters:** see individual package READMEs

The docs cover:
- Installation and setup
- Adapter architecture
- Controller APIs
- Accessibility guarantees
- Real-world integration patterns

---

## Project Status

Affino is currently in **alpha**.

We actively partner with early teams to harden primitives, validate edge cases, and evolve the API responsibly.  
Feedback, issues, and real-world usage stories are always welcome.

---

## License

MIT
