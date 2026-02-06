<div class="page-shell">
    <section class="overlay-kernel-page-hero" aria-label="Overlay kernel overview">
        <div class="overlay-kernel-page-hero__content">
            <p class="overlay-kernel-page-hero__eyebrow">preview</p>
            <h2>Overlay kernel</h2>
            <p>Stack coordination.</p>
            <div class="overlay-kernel-page-hero__chips" aria-label="Overlay kernel foundation">
                <span class="overlay-kernel-page-hero__chip">@affino/overlay-kernel</span>
                <span class="overlay-kernel-page-hero__chip">@affino/laravel-adapter</span>
                <span class="overlay-kernel-page-hero__chip">Livewire</span>
            </div>
        </div>

        <div class="overlay-kernel-page-hero__preview">
            <h3>Preview</h3>
            <p class="overlay-kernel-hint">Open layered surfaces.</p>
            <livewire:overlay.simple />
        </div>
    </section>

    <section class="overlay-kernel-page-cases" aria-label="Overlay kernel scenarios">
        <div class="overlay-kernel-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Owner cascade, modal rules, priority, rehydrate.</p>
        </div>

        <div class="overlay-kernel-edge-list">
            <article
                class="overlay-kernel-edge overlay-kernel-edge--owner"
                data-affino-disclosure-root="overlay-kernel-edge-owner"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="overlay-kernel-edge__summary" data-affino-disclosure-trigger>
                    <span class="overlay-kernel-edge__kicker">Case 01</span>
                    <span class="overlay-kernel-edge__title">Owner cascade</span>
                    <span class="overlay-kernel-edge__lead">Close parent + children.</span>
                </button>
                <div class="overlay-kernel-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:overlay.owner-cascade-case />
                </div>
            </article>

            <article
                class="overlay-kernel-edge overlay-kernel-edge--modal"
                data-affino-disclosure-root="overlay-kernel-edge-modal"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="overlay-kernel-edge__summary" data-affino-disclosure-trigger>
                    <span class="overlay-kernel-edge__kicker">Case 02</span>
                    <span class="overlay-kernel-edge__title">Modal rules</span>
                    <span class="overlay-kernel-edge__lead">Focus + scroll.</span>
                </button>
                <div class="overlay-kernel-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:overlay.modal-rules-case />
                </div>
            </article>

            <article
                class="overlay-kernel-edge overlay-kernel-edge--priority"
                data-affino-disclosure-root="overlay-kernel-edge-priority"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="overlay-kernel-edge__summary" data-affino-disclosure-trigger>
                    <span class="overlay-kernel-edge__kicker">Case 03</span>
                    <span class="overlay-kernel-edge__title">Priority</span>
                    <span class="overlay-kernel-edge__lead">Ordering.</span>
                </button>
                <div class="overlay-kernel-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:overlay.priority-case />
                </div>
            </article>

            <article
                class="overlay-kernel-edge overlay-kernel-edge--rehydrate"
                data-affino-disclosure-root="overlay-kernel-edge-rehydrate"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="overlay-kernel-edge__summary" data-affino-disclosure-trigger>
                    <span class="overlay-kernel-edge__kicker">Case 04</span>
                    <span class="overlay-kernel-edge__title">Rehydrate</span>
                    <span class="overlay-kernel-edge__lead">Stable ids.</span>
                </button>
                <div class="overlay-kernel-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:overlay.rehydrate-case />
                </div>
            </article>
        </div>
    </section>
</div>
