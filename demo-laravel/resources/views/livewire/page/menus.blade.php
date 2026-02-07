<div class="page-shell">
    <section class="menu-page-hero" aria-label="Menu overview">
        <div class="menu-page-hero__content">
            <p class="menu-page-hero__eyebrow">preview</p>
            <h2>Menus</h2>
            <p>Nested menu navigation.</p>
            <div class="menu-page-hero__chips" aria-label="Menu foundation">
                <span class="menu-page-hero__chip">@affino/menu-core</span>
                <span class="menu-page-hero__chip">@affino/menu-laravel</span>
                <span class="menu-page-hero__chip">Livewire</span>
            </div>
        </div>

        <div class="menu-page-hero__preview">
            <h3>Preview</h3>
            <p class="menu-demo__lead">Open nested menus.</p>
            <livewire:menu.simple />
        </div>
    </section>

    <section class="menu-page-cases" aria-label="Menu edge cases">
        <div class="menu-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Livewire pulses, mutation, inline portal, wire:ignore.</p>
        </div>

        <div class="menu-edge-list">
            <article
                class="menu-edge"
                data-affino-disclosure-root="menu-edge-pulse"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="menu-edge__summary" data-affino-disclosure-trigger>
                    <span class="menu-edge__kicker">Case 01</span>
                    <span class="menu-edge__title">Live updates</span>
                    <span class="menu-edge__lead">Menu inside wire:poll pulse.</span>
                </button>
                <div class="menu-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:menu.pulse />
                </div>
            </article>

            <article
                class="menu-edge"
                data-affino-disclosure-root="menu-edge-mutation"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="menu-edge__summary" data-affino-disclosure-trigger>
                    <span class="menu-edge__kicker">Case 02</span>
                    <span class="menu-edge__title">Mutation board</span>
                    <span class="menu-edge__lead">Items mount/unmount while open.</span>
                </button>
                <div class="menu-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:menu.mutation-board />
                </div>
            </article>

            <article
                class="menu-edge"
                data-affino-disclosure-root="menu-edge-inline"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="menu-edge__summary" data-affino-disclosure-trigger>
                    <span class="menu-edge__kicker">Case 03</span>
                    <span class="menu-edge__title">Inline containment</span>
                    <span class="menu-edge__lead">Panel stays inside the scroll container.</span>
                </button>
                <div class="menu-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:menu.inline-portal />
                </div>
            </article>

            <article
                class="menu-edge"
                data-affino-disclosure-root="menu-edge-ignored"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="menu-edge__summary" data-affino-disclosure-trigger>
                    <span class="menu-edge__kicker">Case 04</span>
                    <span class="menu-edge__title">Wire ignore</span>
                    <span class="menu-edge__lead">Stable menu inside wire:ignore.</span>
                </button>
                <div class="menu-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:menu.ignored />
                </div>
            </article>
        </div>
    </section>

</div>
