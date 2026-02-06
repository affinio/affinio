<div class="tabs-manual">
    <div class="tabs-manual__actions">
        @foreach ($tabs as $tab)
            <button
                type="button"
                class="tabs-button tabs-button--ghost"
                wire:click="selectFromServer('{{ $tab['value'] }}')"
            >
                Select {{ $tab['label'] }}
            </button>
        @endforeach
        <button type="button" class="tabs-button" wire:click="clearFromServer">
            Clear from server
        </button>
    </div>

    <div
        class="tabs-manual__root"
        data-affino-tabs-root="{{ $tabsRootId }}"
        data-affino-tabs-default-value="{{ $activeTab }}"
        wire:key="tabs-manual-root-{{ $tabsRootId }}"
    >
        <div class="tabs-manual__triggerRow" role="tablist" aria-label="Manual bridge tabs">
            @foreach ($tabs as $tab)
                @php
                    $isActive = $activeTab === $tab['value'];
                    $triggerId = "tabs-manual-trigger-{$tabsRootId}-{$tab['value']}";
                    $panelId = "tabs-manual-panel-{$tabsRootId}-{$tab['value']}";
                @endphp
                <button
                    type="button"
                    class="tabs-trigger {{ $isActive ? 'is-active' : '' }}"
                    data-affino-tabs-trigger
                    data-affino-tabs-value="{{ $tab['value'] }}"
                    id="{{ $triggerId }}"
                    role="tab"
                    aria-controls="{{ $panelId }}"
                    aria-selected="{{ $isActive ? 'true' : 'false' }}"
                >
                    <span>{{ $tab['label'] }}</span>
                    <small>Manual bridge</small>
                </button>
            @endforeach
        </div>

        @foreach ($tabs as $tab)
            @php
                $isActive = $activeTab === $tab['value'];
                $triggerId = "tabs-manual-trigger-{$tabsRootId}-{$tab['value']}";
                $panelId = "tabs-manual-panel-{$tabsRootId}-{$tab['value']}";
            @endphp
            <article
                class="tabs-manual__panel"
                data-affino-tabs-content
                data-affino-tabs-value="{{ $tab['value'] }}"
                id="{{ $panelId }}"
                role="tabpanel"
                aria-labelledby="{{ $triggerId }}"
                @if (! $isActive) hidden @endif
            >
                <p>{{ $tab['summary'] }}</p>
            </article>
        @endforeach
    </div>

    <dl class="tabs-manual__state">
        <div>
            <dt>Root id</dt>
            <dd>{{ $tabsRootId }}</dd>
        </div>
        <div>
            <dt>Last action</dt>
            <dd>{{ $lastAction }}</dd>
        </div>
        <div>
            <dt>Dispatches</dt>
            <dd>{{ $dispatchCount }}</dd>
        </div>
    </dl>
</div>
