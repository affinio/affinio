@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'menu-pulse';
    $rootId = "menu-pulse-{$componentId}";
@endphp

<div class="menu-pulse" wire:poll.1s="tick">
    <div class="menu-mutation__controls">
        <button type="button" class="menu-action" wire:click="toggleRunning">
            {{ $running ? 'Pause counter' : 'Start counter' }} · {{ $ticks }}
        </button>
    </div>
    <div
        class="menu-root"
        wire:ignore
        data-affino-menu-root="{{ $rootId }}"
        data-affino-menu-state="closed"
        data-affino-menu-portal="inline"
        data-affino-menu-placement="bottom"
        data-affino-menu-align="start"
        data-affino-menu-gutter="8"
    >
        <button type="button" class="menu-trigger" data-affino-menu-trigger>
            Live updates
        </button>

        <div class="menu-panel" data-affino-menu-panel>
            <button type="button" class="menu-item" data-affino-menu-item>Refresh status</button>
            <button type="button" class="menu-item" data-affino-menu-item>Sync now</button>
            <div class="menu-item menu-item--muted" data-affino-menu-item>
                Live updates enabled
            </div>
        </div>
    </div>
</div>
