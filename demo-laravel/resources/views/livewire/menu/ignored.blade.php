@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'menu-ignored';
    $rootId = "menu-ignored-{$componentId}";
@endphp

<div class="menu-ignored" wire:poll.1s="tick">
    <div class="menu-ignored__meta">
        <span>Livewire pulses: {{ $pulses }}</span>
        <span class="menu-ignored__note">Menu stays stable inside <code>wire:ignore</code>.</span>
    </div>

    <div wire:ignore>
        <div
            class="menu-root"
            data-affino-menu-root="{{ $rootId }}"
            data-affino-menu-state="closed"
            data-affino-menu-portal="inline"
            data-affino-menu-placement="bottom"
            data-affino-menu-align="start"
            data-affino-menu-gutter="8"
        >
            <button type="button" class="menu-trigger" data-affino-menu-trigger>
                Ignored menu
            </button>

            <div class="menu-panel" data-affino-menu-panel>
                <button type="button" class="menu-item" data-affino-menu-item>Paused updates</button>
                <button type="button" class="menu-item" data-affino-menu-item>Still interactive</button>
            </div>
        </div>
    </div>
</div>
