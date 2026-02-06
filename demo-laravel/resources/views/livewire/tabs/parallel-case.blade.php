@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'tabs-parallel';
@endphp

<div class="tabs-parallel">
    <div class="tabs-parallel__grid">
        @foreach ($boards as $board)
            @php
                $boardKey = $board['key'];
                $activeValue = $activeTabs[$boardKey] ?? '';
                $tabsRootId = "tabs-parallel-{$componentId}-{$boardKey}";
            @endphp
            <section class="tabs-board" wire:key="tabs-board-{{ $componentId }}-{{ $boardKey }}">
                <header class="tabs-board__header">
                    <strong>{{ $board['title'] }}</strong>
                    <span>{{ $board['subtitle'] }}</span>
                </header>

                <div
                    class="tabs-board__root"
                    data-affino-tabs-root="{{ $tabsRootId }}"
                    data-affino-tabs-default-value="{{ $activeValue }}"
                >
                    <div class="tabs-board__triggerRow" role="tablist" aria-label="{{ $board['title'] }} tabs">
                        @foreach ($board['tabs'] as $tab)
                            @php
                                $isActive = $activeValue === $tab['value'];
                                $triggerId = "tabs-board-trigger-{$componentId}-{$boardKey}-{$tab['value']}";
                                $panelId = "tabs-board-panel-{$componentId}-{$boardKey}-{$tab['value']}";
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
                                wire:click="selectBoardTab('{{ $boardKey }}', '{{ $tab['value'] }}')"
                            >
                                <span>{{ $tab['label'] }}</span>
                                <small>{{ $board['key'] }}</small>
                            </button>
                        @endforeach
                    </div>

                    @foreach ($board['tabs'] as $tab)
                        @php
                            $isActive = $activeValue === $tab['value'];
                            $triggerId = "tabs-board-trigger-{$componentId}-{$boardKey}-{$tab['value']}";
                            $panelId = "tabs-board-panel-{$componentId}-{$boardKey}-{$tab['value']}";
                        @endphp
                        <article
                            class="tabs-board__panel"
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
            </section>
        @endforeach
    </div>
</div>
