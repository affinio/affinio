import "./bootstrap"
import { bootstrapAffinoLaravelAdapters, getAffinoOverlayManager } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters()

const overlayPanelBindings = new WeakMap()

function applyVersionBadges(root = document) {
	if (typeof __AFFINO_VERSION__ === "undefined") {
		return
	}

	const targets = []
	if (root instanceof HTMLElement && root.matches("[data-affino-version]")) {
		targets.push(root)
	}
	if (root instanceof HTMLElement || root instanceof DocumentFragment || root instanceof Document) {
		root.querySelectorAll?.("[data-affino-version]").forEach((target) => {
			targets.push(target)
		})
	}

	targets.forEach((target) => {
		target.textContent = `v${__AFFINO_VERSION__}`
	})
}

function collectOverlayPanels(root) {
	const panels = []
	if (root instanceof HTMLElement && root.matches("[data-overlay-panel]")) {
		panels.push(root)
	}
	if (root instanceof HTMLElement || root instanceof DocumentFragment || root instanceof Document) {
		root.querySelectorAll?.("[data-overlay-panel]").forEach((panel) => {
			panels.push(panel)
		})
	}
	return panels
}

function setPanelCollapsed(panel, toggle, collapsed) {
	panel.dataset.overlayPanelCollapsed = collapsed ? "true" : "false"
	if (toggle) {
		toggle.setAttribute("aria-expanded", String(!collapsed))
	}
}

function renderOverlayPanel(panel, stack) {
	const countTarget = panel.querySelector("[data-overlay-panel-count]")
	const dotTarget = panel.querySelector("[data-overlay-panel-dot]")
	const listTarget = panel.querySelector("[data-overlay-panel-list]")
	const emptyLabel = panel.dataset.overlayPanelEmpty ?? "Stack is idle. Open any overlay to populate it."

	if (countTarget) {
		countTarget.textContent = String(stack.length)
	}
	if (dotTarget) {
		dotTarget.dataset.active = stack.length > 0 ? "true" : "false"
	}
	if (!listTarget) {
		return
	}

	listTarget.innerHTML = ""
	if (!stack.length) {
		const emptyItem = document.createElement("li")
		emptyItem.className = "overlay-panel__empty"
		emptyItem.textContent = emptyLabel
		listTarget.appendChild(emptyItem)
		return
	}

	const visibleStack = [...stack].reverse()
	visibleStack.forEach((entry, index) => {
		const item = document.createElement("li")
		item.className = "overlay-panel__item"
		item.dataset.top = index === 0 ? "true" : "false"

		const kind = document.createElement("p")
		kind.className = "overlay-panel__kind"
		kind.textContent = entry.kind

		const meta = document.createElement("p")
		meta.className = "overlay-panel__meta"
		meta.textContent = `${entry.state} · ${entry.id}`

		item.append(kind, meta)
		listTarget.appendChild(item)
	})
}

function bindOverlayPanel(panel, manager) {
	if (overlayPanelBindings.has(panel)) {
		return
	}

	const toggle = panel.querySelector("[data-overlay-panel-toggle]")
	const showLabel = toggle?.dataset.overlayPanelToggleShow ?? "Show stack"
	const hideLabel = toggle?.dataset.overlayPanelToggleHide ?? "Hide stack"

	const updateToggleLabel = () => {
		if (!toggle) {
			return
		}
		const collapsed = panel.dataset.overlayPanelCollapsed !== "false"
		toggle.title = collapsed ? showLabel : hideLabel
	}

	const onToggle = () => {
		const collapsed = panel.dataset.overlayPanelCollapsed !== "false"
		setPanelCollapsed(panel, toggle, !collapsed)
		updateToggleLabel()
	}

	if (toggle) {
		toggle.addEventListener("click", onToggle)
	}

	setPanelCollapsed(panel, toggle, panel.dataset.overlayPanelCollapsed !== "false")
	updateToggleLabel()
	renderOverlayPanel(panel, manager.getStack())
	const unsubscribe = manager.onStackChanged(({ stack }) => renderOverlayPanel(panel, stack))

	overlayPanelBindings.set(panel, () => {
		if (toggle) {
			toggle.removeEventListener("click", onToggle)
		}
		unsubscribe()
	})
}

function mountOverlayPanels(manager, root = document) {
	collectOverlayPanels(root).forEach((panel) => bindOverlayPanel(panel, manager))
}

function setupOverlayPanelObserver(manager) {
	if (typeof window === "undefined") {
		return
	}
	const scope = window
	const key = "__affinoOverlayPanelObserver"
	if (scope[key]) {
		return
	}
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node instanceof HTMLElement || node instanceof DocumentFragment) {
					mountOverlayPanels(manager, node)
				}
			})
			mutation.removedNodes.forEach((node) => {
				if (!(node instanceof HTMLElement)) {
					return
				}
				const panels = collectOverlayPanels(node)
				panels.forEach((panel) => {
					const cleanup = overlayPanelBindings.get(panel)
					cleanup?.()
					overlayPanelBindings.delete(panel)
				})
			})
		})
	})
	observer.observe(document.documentElement, { childList: true, subtree: true })
	scope[key] = observer
}

if (typeof document !== "undefined") {
	applyVersionBadges(document)
	document.addEventListener("livewire:navigated", () => applyVersionBadges(document))

	try {
		const manager = getAffinoOverlayManager(document)
		if (manager) {
			window.__affinoOverlayManager = manager
			mountOverlayPanels(manager, document)
			setupOverlayPanelObserver(manager)
			document.addEventListener("livewire:navigated", () => mountOverlayPanels(manager, document))
		}
	} catch (error) {
		console.warn("Failed to bootstrap overlay kernel", error)
	}
}
