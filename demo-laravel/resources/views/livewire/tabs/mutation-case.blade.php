@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'tabs-mutation';
    $tabsRootId = "tabs-mutation-{$componentId}";
@endphp

<div class="tabs-mutation">
    <div class="tabs-mutation__actions">
        <button type="button" class="tabs-button" wire:click="addCluster">
            Add cluster
        </button>
        <button type="button" class="tabs-button tabs-button--ghost" wire:click="removeActiveCluster" @disabled($activeTab === '')>
            Remove active
        </button>
        <span class="tabs-mutation__hint">Total tabs: {{ count($tabs) }}</span>
    </div>

    @if ($tabs !== [])
        <div
            class="tabs-mutation__root"
            data-affino-tabs-root="{{ $tabsRootId }}"
            data-affino-tabs-default-value="{{ $activeTab }}"
            wire:key="tabs-mutation-root-{{ $componentId }}-{{ count($tabs) }}"
        >
            <div class="tabs-mutation__triggerRow" role="tablist" aria-label="Dynamic cluster tabs">
                @foreach ($tabs as $tab)
                    @php
                        $isActive = $activeTab === $tab['value'];
                        $triggerId = "tabs-mutation-trigger-{$componentId}-{$tab['value']}";
                        $panelId = "tabs-mutation-panel-{$componentId}-{$tab['value']}";
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
                        wire:click="selectTab('{{ $tab['value'] }}')"
                    >
                        <span>{{ $tab['label'] }}</span>
                        <small>{{ $tab['metric'] }}</small>
                    </button>
                @endforeach
            </div>

            @foreach ($tabs as $tab)
                @php
                    $isActive = $activeTab === $tab['value'];
                    $triggerId = "tabs-mutation-trigger-{$componentId}-{$tab['value']}";
                    $panelId = "tabs-mutation-panel-{$componentId}-{$tab['value']}";
                @endphp
                <article
                    class="tabs-mutation__panel"
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
        <p class="tabs-mutation__meta">
            Active: <strong>{{ $activeTab }}</strong>
        </p>
    @else
        <p class="tabs-mutation__empty">No tabs left. Add a cluster to recreate the dataset.</p>
    @endif
</div>
