@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'tabs-simple';
    $tabsRootId = "tabs-simple-{$componentId}";
    $activeValue = $activeTab !== '' ? $activeTab : '';
    $activeLabel = $activeTabData['label'] ?? 'No tab';
    $activeMetric = $activeTabData['metric'] ?? 'None';
    $selectorListboxId = "tabs-hero-selector-{$componentId}";
@endphp

<div class="tabs-playground">
    <div class="tabs-playground__controls">
        <div class="tabs-control">
            <span>Active tab</span>
            <x-affino-listbox
                class="tabs-control__listbox"
                :listbox-id="$selectorListboxId"
                placeholder="Select tab"
                mode="single"
                model="activeTab"
                :selected="$activeTab"
                :display="$activeLabel"
            >
                @foreach ($tabs as $tab)
                    <x-affino-listbox-option value="{{ $tab['value'] }}" :selected="$activeTab === $tab['value']">
                        {{ $tab['label'] }}
                    </x-affino-listbox-option>
                @endforeach
            </x-affino-listbox>
        </div>

        <button type="button" class="tabs-button" wire:click="resetSelection">
            Reset overview
        </button>
        <button type="button" class="tabs-button tabs-button--ghost" wire:click="clearSelection">
            Clear
        </button>
    </div>

    <div class="tabs-playground__stage">
        <div
            class="tabs-demo"
            data-affino-tabs-root="{{ $tabsRootId }}"
            data-affino-tabs-default-value="{{ $activeValue }}"
            wire:key="tabs-simple-demo-{{ $componentId }}"
        >
            <div class="tabs-demo__triggerRow" role="tablist" aria-label="Product focus tabs">
                @foreach ($tabs as $tab)
                    @php
                        $isActive = $activeTab === $tab['value'];
                        $triggerId = "tabs-simple-trigger-{$componentId}-{$tab['value']}";
                        $panelId = "tabs-simple-panel-{$componentId}-{$tab['value']}";
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
                    $triggerId = "tabs-simple-trigger-{$componentId}-{$tab['value']}";
                    $panelId = "tabs-simple-panel-{$componentId}-{$tab['value']}";
                @endphp
                <article
                    class="tabs-panel"
                    data-affino-tabs-content
                    data-affino-tabs-value="{{ $tab['value'] }}"
                    id="{{ $panelId }}"
                    role="tabpanel"
                    aria-labelledby="{{ $triggerId }}"
                    @if (! $isActive) hidden @endif
                >
                    <p class="tabs-panel__eyebrow">{{ $tab['label'] }}</p>
                    <h4 class="tabs-panel__title">{{ $tab['metric'] }}</h4>
                    <p class="tabs-panel__summary">{{ $tab['summary'] }}</p>
                    <p class="tabs-panel__note">{{ $tab['note'] }}</p>
                </article>
            @endforeach
        </div>

        <dl class="tabs-meta">
            <div>
                <dt>Active value</dt>
                <dd>{{ $activeValue !== '' ? $activeValue : 'none' }}</dd>
            </div>
            <div>
                <dt>Current signal</dt>
                <dd>{{ $activeMetric }}</dd>
            </div>
        </dl>
    </div>
</div>
