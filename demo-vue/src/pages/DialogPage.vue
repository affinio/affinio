<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import {
  useDialogController,
  createDialogFocusOrchestrator,
} from "@affino/dialog-vue"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuSeparator,
  UiMenuLabel,
} from "@affino/menu-vue"
import { useTooltipController, useFloatingTooltip } from "@affino/tooltip-vue"
import type {
  CloseGuardContext,
  DialogCloseContext,
  DialogOpenContext,
  PendingCloseAttemptInfo,
  PendingCloseAttemptLimitInfo,
} from "@affino/dialog-vue"

type TimelineEntry = {
  id: number
  label: string
  detail: string
  time: string
}

const basicTriggerRef = ref<HTMLElement | null>(null)
const basicDialogRef = ref<HTMLDivElement | null>(null)
const guardTriggerRef = ref<HTMLElement | null>(null)
const guardDialogRef = ref<HTMLDivElement | null>(null)

const tooltipController = useTooltipController({
  id: "dialog-sla-tooltip",
  openDelay: 120,
  closeDelay: 80,
})
const tooltipState = tooltipController.state
const tooltipTriggerProps = computed(() => tooltipController.getTriggerProps())
const tooltipProps = computed(() => tooltipController.getTooltipProps())
const { triggerRef: tooltipTriggerRef, tooltipRef, tooltipStyle } = useFloatingTooltip(tooltipController, {
  placement: "top",
  align: "center",
  gutter: 12,
})

let timelineId = 0
const timeline = ref<TimelineEntry[]>([])

const MAX_PENDING_ATTEMPTS = 3
const guardAlert = ref<string | null>(null)
const hasDraft = ref(true)

const basicBinding = useDialogController({
  focusOrchestrator: createDialogFocusOrchestrator({
    dialog: () => basicDialogRef.value,
    initialFocus: () => getInitialFocusTarget(basicDialogRef.value),
    returnFocus: () => basicTriggerRef.value,
  }),
  lifecycle: {
    afterOpen: ({ reason }: DialogOpenContext) => logTimeline("Opened", `Reason: ${reason}`),
    afterClose: ({ reason }: DialogCloseContext) => logTimeline("Closed", `Reason: ${reason}`),
  },
})

const basicSnapshot = basicBinding.snapshot
const basicOverlayVisible = computed(
  () => basicSnapshot.value.isOpen || basicSnapshot.value.phase === "opening" || basicSnapshot.value.optimisticCloseInFlight
)

watch(
  () => basicSnapshot.value.isOpen,
  (isOpen) => {
    if (!isOpen) {
      tooltipController.close()
    }
  }
)

const guardBinding = useDialogController({
  focusOrchestrator: createDialogFocusOrchestrator({
    dialog: () => guardDialogRef.value,
    initialFocus: () => getInitialFocusTarget(guardDialogRef.value),
    returnFocus: () => guardTriggerRef.value,
  }),
  closeStrategy: "optimistic",
  pendingNavigationMessage: "Waiting for the guard to resolve…",
  maxPendingAttempts: MAX_PENDING_ATTEMPTS,
  onPendingCloseAttempt: ({ attempt }: PendingCloseAttemptInfo) => {
    guardAlert.value = attempt > 0 ? `Close retried ${attempt + 1}× while the guard is running.` : null
  },
  onPendingCloseLimitReached: ({ limit }: PendingCloseAttemptLimitInfo) => {
    guardAlert.value = `Ignored extra closes after ${limit} attempts.`
  },
})

const guardSnapshot = guardBinding.snapshot
const guardOverlayVisible = computed(
  () =>
    guardSnapshot.value.isOpen ||
    guardSnapshot.value.phase === "closing" ||
    guardSnapshot.value.optimisticCloseInFlight
)

const guardStatus = computed(() =>
  guardSnapshot.value.guardMessage ?? guardSnapshot.value.pendingNavigationMessage ?? "Ready to close"
)

const guardAttempts = computed(() => guardSnapshot.value.pendingCloseAttempts)

const hasUnsavedCopy = computed(() => (hasDraft.value ? "Draft has pending edits" : "Draft is clean"))

guardBinding.controller.setCloseGuard(async ({ metadata }: CloseGuardContext) => {
  await delay(900)
  if (hasDraft.value && !metadata?.confirmDiscard) {
    return { outcome: "deny", message: "Draft must be saved or discarded." }
  }
  return { outcome: "allow" }
})

function logTimeline(label: string, detail: string) {
  const entry: TimelineEntry = {
    id: ++timelineId,
    label,
    detail,
    time: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(Date.now()),
  }
  timeline.value = [entry, ...timeline.value].slice(0, 4)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toggleDraftState() {
  hasDraft.value = !hasDraft.value
}

function discardDraft() {
  hasDraft.value = false
  guardBinding.close("programmatic", { metadata: { confirmDiscard: true } })
}

function closeGuarded(reason: Parameters<typeof guardBinding.close>[0]) {
  guardBinding.close(reason)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    if (isMenuEscape(event)) {
      return
    }
    if (guardOverlayVisible.value) {
      event.preventDefault()
      closeGuarded("escape-key")
      return
    }
    if (basicOverlayVisible.value) {
      event.preventDefault()
      basicBinding.close("escape-key")
    }
    return
  }

  if (event.key === "Tab") {
    const surface = getActiveSurface()
    if (!surface) {
      return
    }
    trapFocus(event, surface)
  }
}

function getActiveSurface(): HTMLElement | null {
  if (guardOverlayVisible.value) {
    return guardDialogRef.value
  }
  if (basicOverlayVisible.value) {
    return basicDialogRef.value
  }
  return null
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown)
})

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function trapFocus(event: KeyboardEvent, surface: HTMLElement | null) {
  if (event.key !== "Tab" || !surface || !isBrowserEnvironment()) {
    return
  }
  const focusables = getFocusableElements(surface)
  if (!focusables.length) {
    event.preventDefault()
    surface.focus()
    return
  }

  const activeElement = document.activeElement as HTMLElement | null
  let index = activeElement ? focusables.indexOf(activeElement) : -1

  if (event.shiftKey) {
    index = index <= 0 ? focusables.length - 1 : index - 1
  } else {
    index = index === focusables.length - 1 ? 0 : index + 1
  }

  event.preventDefault()
  focusables[index]?.focus()
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  if (!isBrowserEnvironment()) {
    return []
  }
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
  return elements.filter((element) => isElementVisible(element) && element.tabIndex !== -1)
}

function isElementVisible(element: HTMLElement): boolean {
  if (!isBrowserEnvironment()) {
    return true
  }
  if (element.offsetParent === null && element !== document.activeElement) {
    return false
  }
  const style = window.getComputedStyle(element)
  return style.visibility !== "hidden" && style.display !== "none"
}

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

function formatReason(reason?: string) {
  if (!reason) return "—"
  return reason.replace(/-/g, " ")
}

function getInitialFocusTarget(surface: HTMLElement | null): HTMLElement | null {
  return surface?.querySelector<HTMLElement>('[data-dialog-initial]') ?? null
}

function isMenuEscape(event: KeyboardEvent): boolean {
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return Boolean(target.closest('[data-ui-menu-panel="true"]'))
}
</script>

<template>
  <section class="dialog-page">
    <header class="hero">
      <p class="hero__eyebrow">@affino/dialog-core</p>
      <h1>Guard-aware dialogs that own the focus stack.</h1>
      <p>
        Dialogs in Affino are driven by a standalone controller. Vue bindings simply bridge lifecycle hooks,
        focus orchestration, and guard telemetry into the template layer.
      </p>
      <div class="hero__actions">
        <button ref="basicTriggerRef" class="cta" type="button" @click="basicBinding.open('trigger')">
          Launch primary dialog
        </button>
        <button class="ghost" type="button" @click="guardBinding.open('trigger')">
          Try guarded dialog
        </button>
      </div>
    </header>

    <section class="demos">
      <article class="panel">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Focus choreography</p>
            <h2>Lifecycle timeline</h2>
          </div>
          <span class="chip">{{ basicSnapshot.phase }}</span>
        </div>

        <p class="panel__body">
          This dialog records lifecycle events as you open/close it. The focus orchestrator keeps the trigger and
          surface in sync — no manual DOM juggling.
        </p>

        <div class="panel__controls">
          <button type="button" class="cta" @click="basicBinding.open('programmatic')">Open dialog</button>
          <button type="button" class="ghost" @click="basicBinding.close('programmatic')">Close dialog</button>
          <button type="button" class="text" @click="basicBinding.close('escape-key')">Simulate escape</button>
        </div>

        <div class="timeline">
          <p class="timeline__label">Recent events</p>
          <ul>
            <li v-for="entry in timeline" :key="entry.id">
              <div>
                <p class="timeline__label--small">{{ entry.time }}</p>
                <p class="timeline__label">{{ entry.label }}</p>
              </div>
              <p class="timeline__detail">{{ entry.detail }}</p>
            </li>
            <li v-if="!timeline.length" class="timeline__empty">Interact with the dialog to populate events.</li>
          </ul>
        </div>
      </article>

      <article class="panel">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Async guards</p>
            <h2>Optimistic close with limits</h2>
          </div>
          <span class="chip">{{ guardSnapshot.phase }}</span>
        </div>

        <p class="panel__body">
          Closing is optimistic, but the guard can still veto until the draft is saved or discarded. Pending retries are counted,
          and the controller keeps a friendly status message ready for the UI.
        </p>

        <div class="panel__status">
          <div>
            <p class="status__label">Guard status</p>
            <p class="status__value">{{ guardStatus }}</p>
          </div>
          <div>
            <p class="status__label">Pending attempts</p>
            <p class="status__value">{{ guardAttempts }} / {{ MAX_PENDING_ATTEMPTS }}</p>
          </div>
          <div>
            <p class="status__label">Last close reason</p>
            <p class="status__value">{{ formatReason(guardSnapshot.lastCloseReason) }}</p>
          </div>
        </div>

        <div class="panel__controls">
          <button type="button" class="cta" ref="guardTriggerRef" @click="guardBinding.open('programmatic')">
            Open guarded dialog
          </button>
          <button type="button" class="ghost" @click="toggleDraftState">
            {{ hasDraft ? 'Mark draft as clean' : 'Reintroduce dirty draft' }}
          </button>
          <button type="button" class="text" @click="closeGuarded('programmatic')">
            Request close
          </button>
        </div>

        <p class="hint">{{ hasUnsavedCopy }}</p>
        <p v-if="guardAlert" class="alert">{{ guardAlert }}</p>
      </article>
    </section>
  </section>

  <Teleport to="body">
    <transition name="dialog-layer">
      <div v-if="basicOverlayVisible" class="overlay" @click.self="basicBinding.close('backdrop')">
        <div
          ref="basicDialogRef"
          class="surface"
          role="dialog"
          aria-modal="true"
          aria-labelledby="basic-dialog-title"
          tabindex="-1"
        >
          <h3 id="basic-dialog-title">Productivity palette</h3>
          <p>
            This overlay focuses itself on open, traps pointer interactions, and hands focus back to the trigger once closed.
            It is powered entirely by <strong>@affino/dialog-vue</strong>.
          </p>
          <div class="surface__widgets">
            <UiMenu>
              <UiMenuTrigger as-child>
                <button type="button" class="surface-chip">
                  Inline actions
                </button>
              </UiMenuTrigger>
              <UiMenuContent class="surface-menu">
                <UiMenuLabel>Dialog actions</UiMenuLabel>
                <UiMenuSeparator />
                <UiMenuItem @select="basicBinding.close('programmatic')">Close dialog</UiMenuItem>
                <UiMenuItem @select="logTimeline('Menu', 'Duplicated scenario')">Duplicate scenario</UiMenuItem>
                <UiMenuSeparator />
                <UiMenuItem @select="logTimeline('Menu', 'Export queued')">Export data</UiMenuItem>
              </UiMenuContent>
            </UiMenu>

            <div class="surface-tooltip">
              <button
                ref="tooltipTriggerRef"
                type="button"
                class="surface-chip"
                v-bind="tooltipTriggerProps"
              >
                SLA policy
              </button>
              <transition name="tooltip-fade">
                <div
                  v-if="tooltipState.open"
                  ref="tooltipRef"
                  class="surface-tooltip__bubble"
                  v-bind="tooltipProps"
                  :style="tooltipStyle"
                >
                  <p class="surface-tooltip__title">Always-on coverage</p>
                  <p>
                    Emergencies receive a response in under 4 minutes. Hover or focus keeps this tooltip confined inside the dialog.
                  </p>
                </div>
              </transition>
            </div>
          </div>
          <div class="surface__actions">
            <button type="button" class="cta" @click="basicBinding.close('programmatic')">Continue</button>
            <button
              type="button"
              class="ghost"
              data-dialog-initial
              @click="basicBinding.close('backdrop')"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="dialog-layer">
      <div v-if="guardOverlayVisible" class="overlay overlay--warm" @click.self="closeGuarded('backdrop')">
        <div
          ref="guardDialogRef"
          class="surface surface--warm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guarded-dialog-title"
          tabindex="-1"
        >
          <h3 id="guarded-dialog-title">Unsaved draft</h3>
          <p>
            This demo waits for an async guard before closing. Toggle the draft state or choose to discard your work to let the
            controller resolve the optimistic close.
          </p>
          <div class="surface__chips">
            <span>State: {{ hasUnsavedCopy }}</span>
            <span>Optimistic reason: {{ formatReason(guardSnapshot.optimisticCloseReason) }}</span>
          </div>
          <div class="surface__actions">
            <button type="button" class="cta" @click="discardDraft">Discard draft</button>
            <button
              type="button"
              class="ghost"
              data-dialog-initial
              @click="toggleDraftState"
            >
              {{ hasDraft ? 'Keep editing' : 'Re-dirty draft' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.dialog-page {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 2.5rem 1.5rem 4rem;
}

.hero {
  border-radius: 32px;
  padding: 2.75rem;
  border: 1px solid var(--glass-border);
  background: radial-gradient(circle at top left, rgba(121, 134, 255, 0.45), transparent 55%),
    linear-gradient(135deg, rgba(11, 13, 22, 0.85), rgba(6, 7, 12, 0.9));
  color: var(--text-primary);
  box-shadow: var(--shadow-soft);
}

.hero__eyebrow {
  letter-spacing: 0.4em;
  text-transform: uppercase;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.hero h1 {
  font-size: clamp(2rem, 6vw, 3.2rem);
  font-weight: 600;
  margin-bottom: 1rem;
}

.hero p {
  max-width: 52ch;
  color: var(--text-soft);
}

.hero__actions {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.demos {
  display: grid;
  gap: 1.75rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.panel {
  border-radius: 28px;
  padding: 2rem;
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--panel, #090b13) 92%, transparent);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100%;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.panel__eyebrow {
  letter-spacing: 0.3em;
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.panel__body {
  color: var(--text-soft);
  max-width: 60ch;
}

.panel__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.panel__status {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  border: 1px solid var(--glass-highlight);
  border-radius: 18px;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
}

.status__label {
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.status__value {
  font-size: 0.95rem;
  font-weight: 600;
}

.timeline {
  border-radius: 18px;
  border: 1px dashed var(--glass-highlight);
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.015);
}

.timeline__label {
  font-size: 0.85rem;
  font-weight: 600;
}

.timeline__label--small {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.timeline__detail {
  color: var(--text-soft);
}

.timeline ul {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.timeline li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}

.timeline__empty {
  justify-content: center;
  color: var(--text-muted);
}

.hint {
  font-size: 0.85rem;
  color: var(--text-soft);
}

.alert {
  font-size: 0.85rem;
  color: #ffb4b4;
}

.chip {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--glass-highlight);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.cta {
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  font-weight: 600;
  color: #05060a;
  background: linear-gradient(120deg, var(--accent), var(--accent-strong));
  border: none;
  cursor: pointer;
}

.ghost {
  border-radius: 999px;
  padding: 0.6rem 1.4rem;
  font-weight: 600;
  border: 1px solid var(--glass-highlight);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}

.text {
  border: none;
  background: none;
  color: var(--text-muted);
  font-weight: 600;
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 6, 12, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 60;
}

.overlay--warm {
  background: rgba(15, 5, 2, 0.82);
}

.surface {
  max-width: 480px;
  width: 100%;
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  background: linear-gradient(135deg, rgba(9, 12, 23, 0.95), rgba(8, 8, 12, 0.9));
  color: var(--text-primary);
  box-shadow: 0 35px 120px rgba(0, 0, 0, 0.35);
}

.surface--warm {
  background: linear-gradient(135deg, rgba(29, 11, 6, 0.95), rgba(12, 3, 1, 0.92));
}

.surface h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.surface p {
  color: var(--text-soft);
}

.surface__widgets {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: flex-start;
}

.surface-chip {
  border-radius: 999px;
  border: 1px solid var(--glass-highlight);
  padding: 0.45rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}

.surface-chip:hover {
  border-color: color-mix(in srgb, var(--accent), transparent 40%);
}

.surface-menu {
  min-width: 220px;
  padding: 0.75rem 0.5rem;
  border-radius: 18px;
  border: 1px solid var(--glass-border);
  background: rgba(7, 10, 18, 0.95);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
}

.surface-tooltip {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.surface-tooltip__bubble {
  border-radius: 16px;
  padding: 0.85rem 1rem;
  border: 1px solid var(--glass-border);
  background: rgba(8, 10, 19, 0.95);
  color: var(--text-soft);
  max-width: 240px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
}

.surface-tooltip__title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

.surface__chips {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-soft);
}

.surface__actions {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.dialog-layer-enter-active,
.dialog-layer-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-layer-enter-from,
.dialog-layer-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .panel,
  .hero {
    padding: 1.75rem;
  }
}
</style>
