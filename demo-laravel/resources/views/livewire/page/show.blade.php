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
    @endif
</div>
