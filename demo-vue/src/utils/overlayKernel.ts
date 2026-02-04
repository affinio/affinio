import { ensureOverlayHost } from "@affino/overlay-host"
import { getDocumentOverlayManager, type OverlayEntry } from "@affino/overlay-kernel"

const HOST_TARGETS = [
  { id: "affino-overlay-host", attribute: "data-affino-overlay-host" },
  { id: "affino-dialog-host", attribute: "data-affino-dialog-host" },
  { id: "affino-popover-host", attribute: "data-affino-popover-host" },
]

export function initializeOverlayKernel(targetDocument: Document | null = typeof document !== "undefined" ? document : null) {
  if (!targetDocument) {
    return null
  }
  HOST_TARGETS.forEach((target) => {
    ensureOverlayHost({ ...target, document: targetDocument })
  })
  const manager = getDocumentOverlayManager(targetDocument)
  if (import.meta.env.DEV && typeof window !== "undefined") {
    ;(window as Window & { __AFFINO_OVERLAY_MANAGER__?: unknown }).__AFFINO_OVERLAY_MANAGER__ = manager
  }
  return manager
}

export type OverlayStackSubscriber = (stack: readonly OverlayEntry[]) => void

export function subscribeToOverlayStack(subscriber: OverlayStackSubscriber): () => void {
  const targetDocument = typeof document !== "undefined" ? document : null
  if (!targetDocument) {
    return () => {}
  }
  const manager = getDocumentOverlayManager(targetDocument)
  subscriber(manager.getStack())
  return manager.onStackChanged((event) => {
    subscriber(event.stack)
  })
}
