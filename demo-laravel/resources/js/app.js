import "./bootstrap"
import { bootstrapAffinoTooltips } from "@affino/tooltip-laravel"

bootstrapAffinoTooltips()
registerManualTooltipBridge()
registerScrollGuards()

function registerManualTooltipBridge() {
	const eventName = "affino-tooltip:manual"
	const handledFlag = "__affinoManualHandled"

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

		const escapedId = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(detail.id) : detail.id
		const root = document.querySelector(`[data-affino-tooltip-root="${escapedId}"]`)
		const handle = root && root.affinoTooltip
		if (!handle) {
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

	document.addEventListener(eventName, handler)
}

function registerScrollGuards() {
	let ticking = false

	const closeAll = () => {
		ticking = false
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

	window.addEventListener("scroll", () => {
		if (ticking) return
		ticking = true
		requestAnimationFrame(closeAll)
	})
}
