@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'overlay-kernel-simple';
    $dialogId = "overlay-kernel-hero-dialog-{$componentId}";
    $popoverId = "overlay-kernel-hero-popover-{$componentId}";
    $menuRootId = "overlay-kernel-hero-menu-{$componentId}";
    $menuSubRootId = "overlay-kernel-hero-menu-sub-{$componentId}";
    $menuSubItemId = "overlay-kernel-hero-menu-subitem-{$componentId}";
@endphp

<div class="overlay-kernel-playground">
    <div class="overlay-kernel-playground__controls">
        <button type="button" class="overlay-kernel-button" wire:click="pulse">
            Pulse Livewire
        </button>
        <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" wire:click="clearNote">
            Clear note
        </button>
    </div>

    <div class="overlay-kernel-playground__stage">
        <x-affino-dialog
            :dialog-id="$dialogId"
            :modal="true"
            :close-on-backdrop="true"
            :close-on-escape="true"
            teleport="body"
        >
            <x-slot:trigger>
                <button type="button" class="overlay-kernel-trigger">
                    Open incident dialog
                </button>
            </x-slot:trigger>

            <div class="overlay-kernel-dialog">
                <h4>Incident command dialog</h4>
                <p>Open nested layers and watch stack ordering in the kernel inspector.</p>

                <label class="overlay-kernel-field">
                    <span>Operator note</span>
                    <input
                        type="text"
                        value="{{ $note }}"
                        data-affino-livewire-owner="{{ $componentId }}"
                        data-affino-livewire-model="note"
                        data-affino-livewire-model-event="input"
                        data-affino-focus-key="overlay-kernel-note"
                        placeholder="Type status note"
                    />
                </label>

                <x-affino-popover
                    class="overlay-kernel-popoverRoot"
                    :popover-id="$popoverId"
                    placement="right"
                    align="start"
                    :gutter="8"
                >
                    <x-slot:trigger>
                        <button type="button" class="overlay-kernel-trigger overlay-kernel-trigger--ghost">
                            Open decision popover
                        </button>
                    </x-slot:trigger>

                    <div class="overlay-kernel-popover">
                        <strong>Decision checkpoint</strong>
                        <span>Acknowledged: {{ $acknowledged }}</span>
                        <div class="overlay-kernel-actions">
                            <button
                                type="button"
                                class="overlay-kernel-button"
                                data-affino-livewire-owner="{{ $componentId }}"
                                data-affino-livewire-call="acknowledge"
                            >
                                Acknowledge
                            </button>
                            <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" data-affino-popover-dismiss="programmatic">Close</button>
                        </div>
                    </div>
                </x-affino-popover>

                <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" data-affino-dialog-dismiss="programmatic">
                    Close dialog
                </button>
            </div>
        </x-affino-dialog>

        <div class="overlay-kernel-menuDemo">
            <div
                class="overlay-kernel-menuRoot"
                data-affino-menu-root="{{ $menuRootId }}"
                data-affino-menu-state="closed"
                data-affino-menu-close-select="false"
                data-affino-menu-portal="body"
                data-affino-menu-placement="bottom"
                data-affino-menu-align="start"
                data-affino-menu-gutter="8"
            >
                <button type="button" class="overlay-kernel-trigger" data-affino-menu-trigger>
                    Open operations menu
                </button>

                <div class="menu-panel" data-affino-menu-panel>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>
                        Diagnostics
                    </button>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>
                        Activity log
                    </button>

                    <div
                        class="menu-submenu"
                        data-affino-menu-root="{{ $menuSubRootId }}"
                        data-affino-menu-parent="{{ $menuRootId }}"
                        data-affino-menu-parent-item="{{ $menuSubItemId }}"
                        data-affino-menu-state="closed"
                        data-affino-menu-close-select="false"
                        data-affino-menu-portal="inline"
                        data-affino-menu-placement="right"
                        data-affino-menu-align="start"
                        data-affino-menu-gutter="6"
                    >
                        <button type="button" class="menu-item menu-item--submenu" id="{{ $menuSubItemId }}" data-affino-menu-item data-affino-menu-trigger>
                            Escalations
                            <span class="menu-item__chevron">></span>
                        </button>
                        <div class="menu-panel menu-panel--submenu" data-affino-menu-panel>
                            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>
                                Page on-call
                            </button>
                            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>
                                Open incident
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <dl class="overlay-kernel-meta">
        <div>
            <dt>Acknowledged</dt>
            <dd>{{ $acknowledged }}</dd>
        </div>
        <div>
            <dt>Operator note</dt>
            <dd>{{ $note !== '' ? $note : 'None' }}</dd>
        </div>
        <div>
            <dt>Livewire pulses</dt>
            <dd>{{ $pulseCount }}</dd>
        </div>
    </dl>
</div>
