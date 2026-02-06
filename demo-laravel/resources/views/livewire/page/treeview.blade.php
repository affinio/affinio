<div class="page-shell">
    <section class="treeview-page-hero" aria-label="Treeview overview">
        <div class="treeview-page-hero__content">
            <p class="treeview-page-hero__eyebrow">preview</p>
            <h2>Treeview</h2>
            <p>Keyboard-friendly hierarchy.</p>
        </div>

        <div class="treeview-page-hero__preview">
            <h3>Preview</h3>
            <p class="treeview-demo__lead">Navigate nodes.</p>
            <livewire:treeview.simple />
        </div>
    </section>

    <section class="treeview-page-cases" aria-label="Treeview scenarios">
        <div class="treeview-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Manual bridge controls.</p>
        </div>

        <div class="treeview-edge-list">
            <article
                class="treeview-edge treeview-edge--manual"
                data-affino-disclosure-root="treeview-edge-manual"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="treeview-edge__summary" data-affino-disclosure-trigger>
                    <span class="treeview-edge__kicker">Case 01</span>
                    <span class="treeview-edge__title">Manual bridge</span>
                    <span class="treeview-edge__lead">Select/focus/expand.</span>
                </button>
                <div class="treeview-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:treeview.manual-case />
                </div>
            </article>
        </div>
    </section>
</div>
