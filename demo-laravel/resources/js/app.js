import "./bootstrap"
import { bootstrapAffinoTooltips } from "@affino/tooltip-laravel"
import { bootstrapAffinoPopovers } from "@affino/popover-laravel"

bootstrapAffinoTooltips()
bootstrapAffinoPopovers()
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
registerScrollGuards()

function registerManualControllerBridge({ eventName, rootAttribute, property, rehydrate }) {
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

		const detail = /** @type {CustomEvent<{ id?: string; action?: string; reason?: string }> } */ (event).detail
		if (!detail || !detail.id || !detail.action) {
			return
		}

		invokeAction(detail)
	}

	document.addEventListener(eventName, handler)
}

function registerScrollGuards() {
	let ticking = false

	const closeAll = () => {
		ticking = false
		closeOpenTooltips()
		closeOpenPopovers()
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
