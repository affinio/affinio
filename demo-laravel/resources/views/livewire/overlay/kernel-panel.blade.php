<aside
    class="overlay-panel"
    data-overlay-panel
    data-overlay-panel-collapsed="true"
    data-overlay-panel-empty="Stack is idle. Open any dialog/menu to populate it."
    aria-live="polite"
>
    <button
        class="overlay-panel__toggle"
        type="button"
        data-overlay-panel-toggle
        data-overlay-panel-toggle-show="Show stack"
        data-overlay-panel-toggle-hide="Hide stack"
        aria-label="Toggle overlay stack insights"
    >
        <span class="overlay-panel__dot" data-overlay-panel-dot data-active="false" aria-hidden="true"></span>
        <span>Overlay kernel · <span data-overlay-panel-count>0</span></span>
    </button>

    <div class="overlay-panel__body">
        <p class="overlay-panel__hint">
            Live stack from <code>@affino/overlay-kernel</code>
        </p>
        <ul class="overlay-panel__list" data-overlay-panel-list aria-live="polite">
            <li class="overlay-panel__empty">Stack is idle. Open any dialog/menu to populate it.</li>
        </ul>
    </div>
</aside>
