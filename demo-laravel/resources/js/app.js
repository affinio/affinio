import "./bootstrap"
import { bootstrapAffinoDialogs } from "@affino/dialog-laravel"
import { bootstrapAffinoTooltips } from "@affino/tooltip-laravel"
import { bootstrapAffinoPopovers } from "@affino/popover-laravel"
import { bootstrapAffinoListboxes } from "@affino/listbox-laravel"
import { bootstrapAffinoComboboxes } from "@affino/combobox-laravel"
import { bootstrapAffinoMenus } from "@affino/menu-laravel"

bootstrapAffinoDialogs()
bootstrapAffinoTooltips()
bootstrapAffinoPopovers()
bootstrapAffinoListboxes()
bootstrapAffinoComboboxes()
bootstrapAffinoMenus()
registerManualControllerBridge({
	eventName: "affino-dialog:manual",
	rootAttribute: "data-affino-dialog-root",
	property: "affinoDialog",
	rehydrate: bootstrapAffinoDialogs,
	supportsOptions: true,
})
registerManualControllerBridge({
	eventName: "affino-tooltip:manual",
	rootAttribute: "data-affino-tooltip-root",
	property: "affinoTooltip",
	rehydrate: bootstrapAffinoTooltips,
})
registerManualControllerBridge({
	eventName: "affino-popover:manual",
	rootAttribute: "data-affino-popover-root",
	property: "affinoPopover",
	rehydrate: bootstrapAffinoPopovers,
})
registerListboxManualBridge({
	eventName: "affino-listbox:manual",
	rootAttribute: "data-affino-listbox-root",
	property: "affinoListbox",
	rehydrate: bootstrapAffinoListboxes,
})
registerComboboxManualBridge({
	eventName: "affino-combobox:manual",
	rootAttribute: "data-affino-combobox-root",
	property: "affinoCombobox",
	rehydrate: bootstrapAffinoComboboxes,
})
registerManualControllerBridge({
	eventName: "affino-menu:manual",
	rootAttribute: "data-affino-menu-root",
	property: "affinoMenu",
	rehydrate: bootstrapAffinoMenus,
})
registerScrollGuards()
registerLivewireDialogCommands()
registerManualDialogFocusRecovery({
	dialogId: "manual-ops-dialog",
	focusSelector: "[data-manual-dialog-focus-target]",
})

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

function registerManualControllerBridge({ eventName, rootAttribute, property, rehydrate, supportsOptions = false }) {
	const handledFlag = "__affinoManualHandled"
	const maxRetries = 20 // Give Livewire enough frames (~300ms) to rehydrate new popover roots

	const findHandle = (id) => {
		const escapedId = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id
		const selector = `[${rootAttribute}="${escapedId}"]`
		const root = document.querySelector(selector)
		return { root, handle: root && root[property] }
	}

	const invokeAction = (detail, attempt = 0) => {
		rehydrate?.()
		const { handle } = findHandle(detail.id)
		if (!handle) {
			if (attempt < maxRetries) {
				requestAnimationFrame(() => invokeAction(detail, attempt + 1))
			}
			return
		}

		const reason = detail.reason ?? "programmatic"

		if (detail.action === "open") {
			handle.open(reason)
			return
		}

		if (detail.action === "close") {
			if (supportsOptions && Object.prototype.hasOwnProperty.call(detail, "options")) {
				handle.close(reason, detail.options)
				return
			}
			handle.close(reason)
			return
		}

		handle.toggle()
	}

	const handler = (rawEvent) => {
		const event = rawEvent
		if (event[handledFlag]) {
			return
		}
		event[handledFlag] = true

		const detail = /** @type {CustomEvent<{ id?: string; action?: string; reason?: string; options?: any }> } */ (event).detail
		if (!detail || !detail.id || !detail.action) {
			return
		}

		invokeAction(detail)
	}

	document.addEventListener(eventName, handler)
}

function registerListboxManualBridge({ eventName, rootAttribute, property, rehydrate }) {
	const handledFlag = "__affinoManualHandled"
	const maxRetries = 20

	const findHandle = (id) => {
		const escapedId = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id
		const selector = `[${rootAttribute}="${escapedId}"]`
		const root = document.querySelector(selector)
		return root?.[property]
	}

	const invoke = (detail, attempt = 0) => {
		rehydrate?.()
		const handle = findHandle(detail.id)
		if (!handle) {
			if (attempt < maxRetries) {
				requestAnimationFrame(() => invoke(detail, attempt + 1))
			}
			return
		}

		switch (detail.action) {
			case "open":
				handle.open()
				return
			case "close":
				handle.close()
				return
			case "toggle":
				handle.toggle()
				return
			case "select":
				if (typeof detail.index === "number") {
					handle.selectIndex(detail.index, { toggle: detail.toggle, extend: detail.extend })
					return
				}
				if (typeof detail.value === "string") {
					handle.selectValue(detail.value)
				}
		}
	}

	const handler = (rawEvent) => {
		const event = rawEvent
		if (event[handledFlag]) {
			return
		}
		event[handledFlag] = true

		const detail = /** @type {CustomEvent<{ id?: string; action?: string; index?: number; value?: string; toggle?: boolean; extend?: boolean }> } */ (event).detail
		if (!detail || !detail.id || !detail.action) {
			return
		}

		invoke(detail)
	}

	document.addEventListener(eventName, handler)
}

function registerComboboxManualBridge({ eventName, rootAttribute, property, rehydrate }) {
	const handledFlag = "__affinoComboboxManualHandled"
	const maxRetries = 20

	const findHandle = (id) => {
		const escapedId = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id
		const selector = `[${rootAttribute}="${escapedId}"]`
		const root = document.querySelector(selector)
		return root?.[property]
	}

	const invoke = (detail, attempt = 0) => {
		rehydrate?.()
		const handle = findHandle(detail.id)
		if (!handle) {
			if (attempt < maxRetries) {
				requestAnimationFrame(() => invoke(detail, attempt + 1))
			}
			return
		}

		switch (detail.action) {
			case "open":
				handle.open()
				return
			case "close":
				handle.close()
				return
			case "toggle":
				handle.toggle()
				return
			case "select":
				if (typeof detail.index === "number") {
					handle.selectIndex(detail.index, { toggle: detail.toggle, extend: detail.extend })
					return
				}
				if (typeof detail.value === "string") {
					handle.selectValue(detail.value)
				}
				return
			case "clear":
				handle.clear()
				return
		}
	}

	const handler = (rawEvent) => {
		const event = rawEvent
		if (event[handledFlag]) {
			return
		}
		event[handledFlag] = true

		const detail = /** @type {CustomEvent<{ id?: string; action?: string; index?: number; value?: string; extend?: boolean; toggle?: boolean }> } */ (event).detail
		if (!detail || !detail.id || !detail.action) {
			return
		}

		invoke(detail)
	}

	document.addEventListener(eventName, handler)
}

function registerScrollGuards() {
	let ticking = false

	const closeAll = () => {
		ticking = false
		closeOpenTooltips()
		closeOpenPopovers()
		closeOpenComboboxes()
		closeOpenMenus()
	}

	window.addEventListener("scroll", () => {
		if (ticking) return
		ticking = true
		requestAnimationFrame(closeAll)
	})
}

function closeOpenTooltips() {
	const openTooltips = document.querySelectorAll("[data-affino-tooltip-state='open']")
	openTooltips.forEach((root) => {
		const mode = root.dataset.affinoTooltipTriggerMode
		if (mode === "manual") {
			return
		}
		const handle = root.affinoTooltip
		if (handle) {
			handle.close("programmatic")
		}
	})
}

function closeOpenPopovers() {
	const openPopovers = document.querySelectorAll("[data-affino-popover-state='open']")
	openPopovers.forEach((root) => {
		const isPinned = root.dataset.affinoPopoverPinned === "true"
		const isModal = root.dataset.affinoPopoverModal === "true"
		if (isPinned || isModal) {
			return
		}
		const handle = root.affinoPopover
		if (handle) {
			handle.close("programmatic")
		}
	})
}

function closeOpenComboboxes() {
	const openComboboxes = document.querySelectorAll("[data-affino-combobox-state='true']")
	openComboboxes.forEach((root) => {
		const isPinned = root.dataset.affinoComboboxPinned === "true"
		if (isPinned) {
			return
		}
		const handle = root.affinoCombobox
		if (handle) {
			handle.close()
		}
	})
}

function closeOpenMenus() {
	const openMenus = document.querySelectorAll("[data-affino-menu-state='open']")
	openMenus.forEach((root) => {
		const isPinned = root.dataset.affinoMenuPinned === "true"
		if (isPinned) {
			return
		}
		const handle = root.affinoMenu
		if (handle) {
			handle.close("programmatic")
		}
	})
}
