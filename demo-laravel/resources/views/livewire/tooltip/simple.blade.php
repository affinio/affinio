@php
    $isOpen = $alwaysOpen || ($mode === 'manual' && $manualOpen);
    $rootKey = "simple-tooltip-{$placement}-{$mode}";
@endphp

<div class="tooltip-playground">
    <div class="tooltip-playground__controls">
        <div class="tooltip-control">
            <span>Placement</span>
            <x-affino-listbox
                class="tooltip-control__listbox tooltip-control__listbox--placement"
                listbox-id="tooltip-placement"
                placeholder="Select placement"
                mode="single"
                model="placement"
                :selected="$placement"
                :display="ucfirst($placement)"
            >
                <x-affino-listbox-option value="top" :selected="$placement === 'top'">Top</x-affino-listbox-option>
                <x-affino-listbox-option value="right" :selected="$placement === 'right'">Right</x-affino-listbox-option>
                <x-affino-listbox-option value="bottom" :selected="$placement === 'bottom'">Bottom</x-affino-listbox-option>
                <x-affino-listbox-option value="left" :selected="$placement === 'left'">Left</x-affino-listbox-option>
            </x-affino-listbox>
        </div>

        <div class="tooltip-control">
            <span>Mode</span>
            <x-affino-listbox
                class="tooltip-control__listbox"
                listbox-id="tooltip-mode"
                placeholder="Select mode"
                mode="single"
                model="mode"
                :selected="$mode"
                :display="ucfirst($mode)"
            >
                <x-affino-listbox-option value="hover" :selected="$mode === 'hover'">Hover</x-affino-listbox-option>
                <x-affino-listbox-option value="manual" :selected="$mode === 'manual'">Manual</x-affino-listbox-option>
            </x-affino-listbox>
        </div>

        <label class="tooltip-control tooltip-control--toggle">
            <input type="checkbox" wire:model.live="alwaysOpen" />
            <span>Always open</span>
        </label>

        @if ($mode === 'manual')
            <button type="button" class="tooltip-trigger tooltip-trigger--ghost" wire:click="toggleManual">
                {{ $manualOpen ? 'Close tooltip' : 'Open tooltip' }}
            </button>
        @endif
    </div>

    <div class="tooltip-playground__stage">
        <div
            class="tooltip-demo"
            data-affino-tooltip-root="simple-tooltip"
            data-affino-tooltip-placement="{{ $placement }}"
            data-affino-tooltip-align="center"
            data-affino-tooltip-gutter="12"
            data-affino-tooltip-trigger-mode="{{ $mode === 'manual' ? 'manual' : 'hover' }}"
            data-affino-tooltip-pinned="{{ $alwaysOpen ? 'true' : 'false' }}"
            data-affino-tooltip-state="{{ $isOpen ? 'open' : 'closed' }}"
            wire:key="{{ $rootKey }}"
        >
            <button type="button" class="tooltip-trigger" data-affino-tooltip-trigger>
                Hover me
            </button>
            <div class="tooltip-surface" data-affino-tooltip-surface data-state="{{ $isOpen ? 'open' : 'closed' }}" @if (! $isOpen) hidden @endif>
                Guide users at the exact moment of intent, without breaking flow.
            </div>
        </div>
    </div>
</div>
