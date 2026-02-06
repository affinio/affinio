<div class="page-shell">
    <section class="combobox-page-hero" aria-label="Combobox overview">
        <div class="combobox-page-hero__content">
            <p class="combobox-page-hero__eyebrow">preview</p>
            <h2>Combobox</h2>
            <p>Search + select.</p>
            <div class="combobox-page-hero__chips" aria-label="Combobox foundation">
                <span class="combobox-page-hero__chip">@affino/combobox-core</span>
                <span class="combobox-page-hero__chip">@affino/listbox-core</span>
                <span class="combobox-page-hero__chip">@affino/combobox-laravel</span>
            </div>
        </div>

        <div class="combobox-page-hero__preview">
            <h3>Preview</h3>
            <p class="combobox-demo__lead">Type to filter.</p>
            <livewire:combobox.simple />
        </div>
    </section>

    <section class="combobox-page-cases" aria-label="Combobox scenarios">
        <div class="combobox-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Manual, multi, dataset, sticky.</p>
        </div>

        <div class="combobox-edge-list">
            <article
                class="combobox-edge combobox-edge--manual"
                data-affino-disclosure-root="combobox-edge-manual"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="combobox-edge__summary" data-affino-disclosure-trigger>
                    <span class="combobox-edge__kicker">Case 01</span>
                    <span class="combobox-edge__title">Manual bridge</span>
                    <span class="combobox-edge__lead">Open/close/select.</span>
                </button>
                <div class="combobox-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:combobox.manual-case />
                </div>
            </article>

            <article
                class="combobox-edge combobox-edge--multiple"
                data-affino-disclosure-root="combobox-edge-multiple"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="combobox-edge__summary" data-affino-disclosure-trigger>
                    <span class="combobox-edge__kicker">Case 02</span>
                    <span class="combobox-edge__title">Multi-select</span>
                    <span class="combobox-edge__lead">Range + add.</span>
                </button>
                <div class="combobox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:combobox.multiple-case />
                </div>
            </article>

            <article
                class="combobox-edge combobox-edge--dataset"
                data-affino-disclosure-root="combobox-edge-dataset"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="combobox-edge__summary" data-affino-disclosure-trigger>
                    <span class="combobox-edge__kicker">Case 03</span>
                    <span class="combobox-edge__title">Dataset swap</span>
                    <span class="combobox-edge__lead">Replace options.</span>
                </button>
                <div class="combobox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:combobox.dataset-case />
                </div>
            </article>

            <article
                class="combobox-edge combobox-edge--sticky"
                data-affino-disclosure-root="combobox-edge-sticky"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="combobox-edge__summary" data-affino-disclosure-trigger>
                    <span class="combobox-edge__kicker">Case 04</span>
                    <span class="combobox-edge__title">Sticky tools</span>
                    <span class="combobox-edge__lead">Pinned actions.</span>
                </button>
                <div class="combobox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:combobox.sticky-case />
                </div>
            </article>
        </div>
    </section>
</div>
