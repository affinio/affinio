import "./bootstrap"
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"
import { getDocumentOverlayManager } from "@affino/overlay-kernel"

bootstrapAffinoLaravelAdapters()
registerLivewireDialogCommands()
registerManualDialogFocusRecovery({
	dialogId: "manual-ops-dialog",
	focusSelector: "[data-manual-dialog-focus-target]",
})
registerOverlayKernelPanels()

function registerLivewireDialogCommands() {
	if (typeof document === "undefined" || typeof window === "undefined") {
		return
	}
	const flag = "__affinoDialogLivewireCommandsRegistered"
	if (window[flag]) {
		return
	}
	window[flag] = true

	document.addEventListener("click", async (nativeEvent) => {
		const target = nativeEvent.target instanceof Element ? nativeEvent.target.closest("[data-affino-dialog-command]") : null
		if (!target) {
			return
		}
		const command = target.getAttribute("data-affino-dialog-command")
		if (!command) {
			return
		}
		const dialogRoot = target.closest("[data-affino-dialog-root]")
		const dialogId = dialogRoot?.getAttribute("data-affino-dialog-root")
		const dialogWasOpen = dialogRoot?.getAttribute("data-affino-dialog-state") === "open"
		const dialogPinned = dialogRoot?.getAttribute("data-affino-dialog-pinned") === "true"
		const livewireRoot = target.closest("[data-affino-livewire-id]")
		const componentId = livewireRoot?.getAttribute("data-affino-livewire-id")
		const livewire = window.Livewire ?? null
		if (!componentId || typeof livewire?.find !== "function") {
			return
		}
		const component = livewire.find(componentId)
		if (!component) {
			return
		}
		if (target instanceof HTMLButtonElement && target.disabled) {
			return
		}
		const button = target instanceof HTMLButtonElement ? target : null
		const previousDisabled = button?.disabled ?? false
		button?.setAttribute("disabled", "disabled")
		target.classList.add("is-busy")
		try {
			await component.call("logEvent", command)
		} finally {
			target.classList.remove("is-busy")
			if (button && !previousDisabled) {
				button.removeAttribute("disabled")
			}
			if (dialogWasOpen && dialogId && dialogPinned) {
				requestAnimationFrame(() => {
					document.dispatchEvent(
						new CustomEvent("affino-dialog:manual", {
							detail: { id: dialogId, action: "open", reason: "morph-resume" },
						}),
					)
				})
			}
		}
	})
}

function registerManualDialogFocusRecovery({ dialogId, focusSelector }) {
	if (typeof document === "undefined" || typeof window === "undefined") {
		return
	}
	const flag = "__affinoManualFocusRecoveryRegistered"
	if (window[flag]) {
		return
	}
	window[flag] = true

	let activeRoot = null
	let observer = null

	const setupObserver = () => {
		const root = document.querySelector(`[data-affino-dialog-root="${dialogId}"]`)
		if (!root || root === activeRoot) {
			return
		}
		observer?.disconnect()
		activeRoot = root
		let previousState = root.getAttribute("data-affino-dialog-state")
		observer = new MutationObserver(() => {
			const nextState = root.getAttribute("data-affino-dialog-state")
			if (previousState === "open" && nextState && nextState !== "open") {
				const focusTarget = document.querySelector(focusSelector)
				if (focusTarget instanceof HTMLElement) {
					focusTarget.focus({ preventScroll: true })
				}
			}
			previousState = nextState
		})
		observer.observe(root, { attributes: true, attributeFilter: ["data-affino-dialog-state"] })
	}

	setupObserver()
	document.addEventListener("livewire:navigated", () => {
		setupObserver()
	})
}

function registerOverlayKernelPanels() {
	if (typeof document === "undefined" || typeof window === "undefined") {
		return
	}
	const flag = "__affinoOverlayKernelPanelsRegistered"
	if (window[flag]) {
		return
	}
	window[flag] = true

	let manager = null
	try {
		manager = getDocumentOverlayManager(document)
	} catch {
		return
	}
	if (!manager) {
		return
	}
	const hydrate = () => {
		const panels = document.querySelectorAll("[data-overlay-panel]")
		panels.forEach((panel) => {
			if (panel instanceof HTMLElement) {
				attachOverlayPanel(panel, manager)
			}
		})
	}
	hydrate()
	document.addEventListener("livewire:navigated", hydrate)
}

function attachOverlayPanel(panel, manager) {
	if (panel.dataset.overlayPanelHydrated === "true") {
		return
	}
	const toggle = panel.querySelector("[data-overlay-panel-toggle]")
	const list = panel.querySelector("[data-overlay-panel-list]")
	const dot = panel.querySelector("[data-overlay-panel-dot]")
	const countTarget = panel.querySelector("[data-overlay-panel-count]")
	if (!toggle || !list || !dot || !countTarget) {
		return
	}
	panel.dataset.overlayPanelHydrated = "true"
	panel.hidden = false
	const showLabel = toggle.getAttribute("data-overlay-panel-toggle-show")?.trim() || "Show stack"
	const hideLabel = toggle.getAttribute("data-overlay-panel-toggle-hide")?.trim() || toggle.textContent?.trim() || "Hide stack"
	const emptyState =
		panel.getAttribute("data-overlay-panel-empty")?.trim() ||
		list.querySelector(".overlay-panel__empty")?.textContent?.trim() ||
		"Stack is idle. Open any overlay to populate it."
	const setCollapseState = (collapsed) => {
		panel.setAttribute("data-overlay-panel-collapsed", collapsed ? "true" : "false")
		toggle.setAttribute("aria-expanded", collapsed ? "false" : "true")
		toggle.textContent = collapsed ? showLabel : hideLabel
	}
	const initialCollapsed = panel.getAttribute("data-overlay-panel-collapsed") === "true"
	setCollapseState(initialCollapsed)
	toggle.addEventListener("click", () => {
		const collapsed = panel.getAttribute("data-overlay-panel-collapsed") === "true"
		setCollapseState(!collapsed)
	})

	const renderStack = (stack) => {
		const entries = [...stack].reverse()
		countTarget.textContent = String(stack.length)
		dot.dataset.active = stack.length > 0 ? "true" : "false"
		list.innerHTML = ""
		if (!entries.length) {
			const empty = document.createElement("li")
			empty.className = "overlay-panel__empty"
			empty.textContent = emptyState
			list.appendChild(empty)
			return
		}
		const fragment = document.createDocumentFragment()
		entries.forEach((entry, index) => {
			const item = document.createElement("li")
			item.className = "overlay-panel__item"
			item.dataset.top = index === 0 ? "true" : "false"

			const left = document.createElement("div")
			const kind = document.createElement("p")
			kind.className = "overlay-panel__kind"
			kind.textContent = formatOverlayKind(entry.kind)
			left.appendChild(kind)

			const meta = document.createElement("p")
			meta.className = "overlay-panel__meta"
			meta.textContent = `State · ${entry.state}`
			left.appendChild(meta)

			const badge = document.createElement("div")
			badge.className = "overlay-panel__badge"
			const priority = document.createElement("span")
			priority.className = "overlay-panel__badge-rank"
			priority.textContent = `#${entry.priority}`
			badge.appendChild(priority)
			if (index === 0) {
				const pill = document.createElement("span")
				pill.className = "overlay-panel__badge-pill"
				pill.textContent = "Top"
				badge.appendChild(pill)
			}

			item.appendChild(left)
			item.appendChild(badge)
			fragment.appendChild(item)
		})
		list.appendChild(fragment)
	}

	try {
		renderStack(manager.getStack())
		const unsubscribe = manager.onStackChanged((event) => {
			if (!panel.isConnected) {
				unsubscribe()
				return
			}
			renderStack(event.stack)
		})
	} catch {
		panel.dataset.overlayPanelHydrated = "false"
	}
}

function formatOverlayKind(kind) {
	return kind.replace(/-/g, " ")
}
