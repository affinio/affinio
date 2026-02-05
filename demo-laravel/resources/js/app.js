import "./bootstrap"
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"
import { getDocumentOverlayManager } from "@affino/overlay-kernel"

bootstrapAffinoLaravelAdapters()

if (typeof document !== "undefined") {
	const versionTarget = document.querySelector("[data-affino-version]")

	if (versionTarget && typeof __AFFINO_VERSION__ !== "undefined") {
		versionTarget.textContent = `v${__AFFINO_VERSION__}`
	}

	try {
		const manager = getDocumentOverlayManager(document)
		window.__affinoOverlayManager = manager
	} catch (error) {
		console.warn("Failed to bootstrap overlay kernel", error)
	}
}
