@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'overlay-priority';
    $lowRootId = "overlay-priority-low-{$componentId}";
    $highRootId = "overlay-priority-high-{$componentId}";
@endphp

<div class="overlay-kernel-case overlay-kernel-case--priority">
    <div class="overlay-kernel-priorityHead">
        <button type="button" class="overlay-kernel-button" wire:click="pulse">
            Pulse Livewire
        </button>
        <span>Open both menus and compare top order in the kernel inspector.</span>
    </div>

    <div class="overlay-kernel-priorityGrid">
        <article class="overlay-kernel-menuCard">
            <p class="overlay-kernel-menuCard__label">Priority 40</p>
            <div
                class="overlay-kernel-menuRoot"
                data-affino-menu-root="{{ $lowRootId }}"
                data-affino-menu-state="closed"
                data-affino-menu-close-select="false"
                data-affino-menu-portal="body"
                data-affino-menu-placement="bottom"
                data-affino-menu-align="start"
                data-affino-menu-gutter="8"
                data-affino-menu-overlay-priority="40"
            >
                <button type="button" class="overlay-kernel-trigger" data-affino-menu-trigger>
                    Open low priority menu
                </button>
                <div class="menu-panel" data-affino-menu-panel>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Run checks</button>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Queue report</button>
                </div>
            </div>
        </article>

        <article class="overlay-kernel-menuCard">
            <p class="overlay-kernel-menuCard__label">Priority 120</p>
            <div
                class="overlay-kernel-menuRoot"
                data-affino-menu-root="{{ $highRootId }}"
                data-affino-menu-state="closed"
                data-affino-menu-close-select="false"
                data-affino-menu-portal="body"
                data-affino-menu-placement="bottom"
                data-affino-menu-align="start"
                data-affino-menu-gutter="8"
                data-affino-menu-overlay-priority="120"
            >
                <button type="button" class="overlay-kernel-trigger" data-affino-menu-trigger>
                    Open high priority menu
                </button>
                <div class="menu-panel" data-affino-menu-panel>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Escalate now</button>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Page leadership</button>
                </div>
            </div>
        </article>
    </div>

    <p class="overlay-kernel-hint">Livewire pulses: {{ $pulses }}</p>
</div>
