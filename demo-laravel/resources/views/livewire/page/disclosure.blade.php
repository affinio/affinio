<div class="page-shell">
    <section class="disclosure-page-hero" aria-label="Disclosure overview">
        <div class="disclosure-page-hero__content">
            <p class="disclosure-page-hero__eyebrow">preview</p>
            <h2>Disclosure</h2>
            <p>Accordion panels.</p>
            <div class="disclosure-page-hero__chips" aria-label="Disclosure foundation">
                <span class="disclosure-page-hero__chip">@affino/disclosure-core</span>
                <span class="disclosure-page-hero__chip">@affino/disclosure-laravel</span>
                <span class="disclosure-page-hero__chip">Livewire</span>
            </div>
        </div>

        <div class="disclosure-page-hero__preview">
            <h3>Preview</h3>
            <p class="disclosure-demo__lead">Open/close panels.</p>
            <livewire:disclosure.simple />
        </div>
    </section>

    <section class="disclosure-page-cases" aria-label="Disclosure scenarios">
        <div class="disclosure-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Nested, pulse, mutation, ignore.</p>
        </div>

        <div class="disclosure-edge-list">
            <article
                class="disclosure-edge disclosure-edge--nested"
                data-affino-disclosure-root="disclosure-edge-nested"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="disclosure-edge__summary" data-affino-disclosure-trigger>
                    <span class="disclosure-edge__kicker">Case 01</span>
                    <span class="disclosure-edge__title">Nested</span>
                    <span class="disclosure-edge__lead">Parent + child.</span>
                </button>
                <div class="disclosure-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:disclosure.nested />
                </div>
            </article>

            <article
                class="disclosure-edge disclosure-edge--pulse"
                data-affino-disclosure-root="disclosure-edge-pulse"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="disclosure-edge__summary" data-affino-disclosure-trigger>
                    <span class="disclosure-edge__kicker">Case 02</span>
                    <span class="disclosure-edge__title">Pulse</span>
                    <span class="disclosure-edge__lead">Livewire updates.</span>
                </button>
                <div class="disclosure-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:disclosure.pulse />
                </div>
            </article>

            <article
                class="disclosure-edge disclosure-edge--mutation"
                data-affino-disclosure-root="disclosure-edge-mutation"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="disclosure-edge__summary" data-affino-disclosure-trigger>
                    <span class="disclosure-edge__kicker">Case 03</span>
                    <span class="disclosure-edge__title">List changes</span>
                    <span class="disclosure-edge__lead">Add/remove items.</span>
                </button>
                <div class="disclosure-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:disclosure.mutation-board />
                </div>
            </article>

            <article
                class="disclosure-edge disclosure-edge--ignored"
                data-affino-disclosure-root="disclosure-edge-ignored"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="disclosure-edge__summary" data-affino-disclosure-trigger>
                    <span class="disclosure-edge__kicker">Case 04</span>
                    <span class="disclosure-edge__title"><code>wire:ignore</code></span>
                    <span class="disclosure-edge__lead">Isolated island.</span>
                </button>
                <div class="disclosure-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:disclosure.ignored />
                </div>
            </article>
        </div>
    </section>
</div>
