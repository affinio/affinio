<div class="page-shell">
    <section class="tooltip-page-hero" aria-label="Tooltip overview">
        <div class="tooltip-page-hero__content">
            <p class="tooltip-page-hero__eyebrow">preview</p>
            <h2>Tooltips</h2>
            <p>Fast hints, stable state.</p>
            <div class="tooltip-page-hero__chips" aria-label="Tooltip foundation">
                <span class="tooltip-page-hero__chip">@affino/tooltip-core</span>
                <span class="tooltip-page-hero__chip">@affino/overlay-kernel</span>
                <span class="tooltip-page-hero__chip">@affino/tooltip-laravel</span>
            </div>
        </div>

        <div class="tooltip-page-hero__preview">
            <h3>Preview</h3>
            <p class="tooltip-demo__lead">Hover + focus.</p>
            <livewire:tooltip.simple />
        </div>
    </section>

    <section class="tooltip-page-cases" aria-label="Tooltip scenarios">
        <div class="tooltip-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Dock, pulse, ignore, resize, dialog.</p>
        </div>

        <div class="tooltip-edge-list">
            <article
                class="tooltip-edge tooltip-edge--dock"
                data-affino-disclosure-root="tooltip-edge-dock"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                    <span class="tooltip-edge__kicker">Case 01</span>
                    <span class="tooltip-edge__title">Dock rail</span>
                    <span class="tooltip-edge__lead">Smooth hover.</span>
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
                    <span class="tooltip-edge__kicker">Case 02</span>
                    <span class="tooltip-edge__title">Pulse</span>
                    <span class="tooltip-edge__lead">Livewire updates.</span>
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
                    <span class="tooltip-edge__kicker">Case 03</span>
                    <span class="tooltip-edge__title"><code>wire:ignore</code></span>
                    <span class="tooltip-edge__lead">Isolated island.</span>
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
                    <span class="tooltip-edge__kicker">Case 04</span>
                    <span class="tooltip-edge__title">Resize</span>
                    <span class="tooltip-edge__lead">Width changes.</span>
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
                    <span class="tooltip-edge__kicker">Case 05</span>
                    <span class="tooltip-edge__title">Inside dialog</span>
                    <span class="tooltip-edge__lead">Layering safe.</span>
                </button>
                <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:tooltip.dialog-case />
                </div>
            </article>
        </div>
    </section>
</div>
