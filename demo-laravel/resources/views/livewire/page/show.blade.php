<div class="page-shell">
    @if ($page === 'tooltips')
        <section class="tooltip-page-hero" aria-label="Tooltip overview">
            <div class="tooltip-page-hero__content">
                <p class="tooltip-page-hero__eyebrow">preview</p>
                <h2>Tooltips that feel instant and stay reliable under Livewire updates</h2>
                <p>
                    Affino tooltip flows are built on top of <strong>@affino/tooltip-core</strong> positioning and
                    coordinated by <strong>@affino/overlay-kernel</strong>. The Laravel layer keeps DOM state and
                    Livewire morphing in sync, so hints remain stable in real product screens.
                </p>
                <div class="tooltip-page-hero__chips" aria-label="Tooltip foundation">
                    <span class="tooltip-page-hero__chip">@affino/tooltip-core</span>
                    <span class="tooltip-page-hero__chip">@affino/overlay-kernel</span>
                    <span class="tooltip-page-hero__chip">@affino/tooltip-laravel</span>
                </div>
            </div>

            <div class="tooltip-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="tooltip-demo__lead">
                    Tune placement and trigger mode to match your product behavior.
                </p>
                <livewire:tooltip.simple />
            </div>
        </section>

        <section class="tooltip-page-cases" aria-label="Advanced tooltip scenarios">
            <div class="tooltip-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    Each block below stresses a different production failure mode. Open one case at a time and inspect how the tooltip
                    behaves under stress.
                </p>
            </div>

            <div class="tooltip-edge-list">
                <article
                    class="tooltip-edge tooltip-edge--dock"
                    data-affino-disclosure-root="tooltip-edge-dock"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 01</span>
                        <span class="tooltip-edge__title">Dock hover rail</span>
                        <span class="tooltip-edge__lead">Fast cursor passes should feel like one continuous surface.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="open">
                        <livewire:tooltip.dock />
                    </div>
                </article>

                <article
                    class="tooltip-edge tooltip-edge--pulse"
                    data-affino-disclosure-root="tooltip-edge-pulse"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 02</span>
                        <span class="tooltip-edge__title">Livewire pulse</span>
                        <span class="tooltip-edge__lead">Tooltip remains stable while Livewire keeps mutating state.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tooltip.pulse />
                    </div>
                </article>

                <article
                    class="tooltip-edge tooltip-edge--ignored"
                    data-affino-disclosure-root="tooltip-edge-ignored"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 03</span>
                        <span class="tooltip-edge__title"><code>wire:ignore</code> island</span>
                        <span class="tooltip-edge__lead">Ignores subtree morphs while external updates continue.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tooltip.ignored />
                    </div>
                </article>

                <article
                    class="tooltip-edge tooltip-edge--resize"
                    data-affino-disclosure-root="tooltip-edge-resize"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 04</span>
                        <span class="tooltip-edge__title">Dynamic trigger width</span>
                        <span class="tooltip-edge__lead">Positioning stays correct when trigger width changes.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tooltip.resize />
                    </div>
                </article>

                <article
                    class="tooltip-edge tooltip-edge--dialog"
                    data-affino-disclosure-root="tooltip-edge-dialog"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 05</span>
                        <span class="tooltip-edge__title">Tooltip inside dialog</span>
                        <span class="tooltip-edge__lead">Layering remains predictable inside modal overlays.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tooltip.dialog-case />
                    </div>
                </article>
            </div>
        </section>
    @elseif ($page === 'popovers')
        <section class="popover-page-hero" aria-label="Popover overview">
            <div class="popover-page-hero__content">
                <p class="popover-page-hero__eyebrow">preview</p>
                <h2>Popovers that carry rich context and stay deterministic in Livewire flows</h2>
                <p>
                    Affino popover behavior is powered by <strong>@affino/popover-core</strong> and coordinated by
                    <strong>@affino/overlay-kernel</strong>. The Laravel layer keeps focus, placement, and state
                    synced while DOM fragments are continuously morphed.
                </p>
                <div class="popover-page-hero__chips" aria-label="Popover foundation">
                    <span class="popover-page-hero__chip">@affino/popover-core</span>
                    <span class="popover-page-hero__chip">@affino/overlay-kernel</span>
                    <span class="popover-page-hero__chip">@affino/popover-laravel</span>
                </div>
            </div>

            <div class="popover-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="popover-demo__lead">
                    Tune placement, align, and mode to mirror real product behavior.
                </p>
                <livewire:popover.simple />
            </div>
        </section>

        <section class="popover-page-cases" aria-label="Advanced popover scenarios">
            <div class="popover-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    Each case targets a production concern: editable inline panels, nested stacks, modal constraints,
                    and list mutations under Livewire updates.
                </p>
            </div>

            <div class="popover-edge-list">
                <article
                    class="popover-edge popover-edge--quick-edit"
                    data-affino-disclosure-root="popover-edge-quick-edit"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                        <span class="popover-edge__kicker">Edge case 01</span>
                        <span class="popover-edge__title">Inline quick-edit popovers</span>
                        <span class="popover-edge__lead">Editable controls inside anchored panels, per-row and stateful.</span>
                    </button>
                    <div class="popover-edge__content" data-affino-disclosure-content data-state="open">
                        <livewire:popover.quick-edit />
                    </div>
                </article>

                <article
                    class="popover-edge popover-edge--nested"
                    data-affino-disclosure-root="popover-edge-nested"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                        <span class="popover-edge__kicker">Edge case 02</span>
                        <span class="popover-edge__title">Nested popover stack</span>
                        <span class="popover-edge__lead">Popover opened from another popover should keep deterministic stack behavior.</span>
                    </button>
                    <div class="popover-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:popover.nested />
                    </div>
                </article>

                <article
                    class="popover-edge popover-edge--modal"
                    data-affino-disclosure-root="popover-edge-modal"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                        <span class="popover-edge__kicker">Edge case 03</span>
                        <span class="popover-edge__title">Modal popover behavior</span>
                        <span class="popover-edge__lead">Focus/scroll constraints for critical local confirmation flows.</span>
                    </button>
                    <div class="popover-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:popover.modal-case />
                    </div>
                </article>

                <article
                    class="popover-edge popover-edge--mutation"
                    data-affino-disclosure-root="popover-edge-mutation"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                        <span class="popover-edge__kicker">Edge case 04</span>
                        <span class="popover-edge__title">Livewire list mutations</span>
                        <span class="popover-edge__lead">Popover handles stay valid while rows are added or removed.</span>
                    </button>
                    <div class="popover-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:popover.mutation-board />
                    </div>
                </article>
            </div>
        </section>
    @endif
</div>
