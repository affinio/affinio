@php
    $isOpen = $alwaysOpen || ($mode === 'manual' && $manualOpen);
    $rootKey = "simple-popover-{$placement}-{$align}-{$mode}";
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'popover-simple';
    $instanceKey = "{$componentId}-{$rootKey}";
    $placementListboxId = "popover-placement-{$instanceKey}";
    $alignListboxId = "popover-align-{$instanceKey}";
    $modeListboxId = "popover-mode-{$instanceKey}";
    $popoverId = "simple-popover-{$instanceKey}";
    $priorityListboxId = "simple-popover-priority-{$instanceKey}";
@endphp

<div class="popover-playground">
    <div class="popover-playground__controls">
        <div class="popover-control">
            <span>Placement</span>
            <x-affino-listbox
                class="popover-control__listbox popover-control__listbox--placement"
                :listbox-id="$placementListboxId"
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

        <div class="popover-control">
            <span>Align</span>
            <x-affino-listbox
                class="popover-control__listbox"
                :listbox-id="$alignListboxId"
                placeholder="Select align"
                mode="single"
                model="align"
                :selected="$align"
                :display="ucfirst($align)"
            >
                <x-affino-listbox-option value="start" :selected="$align === 'start'">Start</x-affino-listbox-option>
                <x-affino-listbox-option value="center" :selected="$align === 'center'">Center</x-affino-listbox-option>
                <x-affino-listbox-option value="end" :selected="$align === 'end'">End</x-affino-listbox-option>
            </x-affino-listbox>
        </div>

        <div class="popover-control">
            <span>Mode</span>
            <x-affino-listbox
                class="popover-control__listbox"
                :listbox-id="$modeListboxId"
                placeholder="Select mode"
                mode="single"
                model="mode"
                :selected="$mode"
                :display="ucfirst($mode)"
            >
                <x-affino-listbox-option value="auto" :selected="$mode === 'auto'">Auto</x-affino-listbox-option>
                <x-affino-listbox-option value="manual" :selected="$mode === 'manual'">Manual</x-affino-listbox-option>
            </x-affino-listbox>
        </div>

        <label class="popover-control popover-control--toggle">
            <input type="checkbox" wire:model.live="alwaysOpen" />
            <span>Always open</span>
        </label>

        @if ($mode === 'manual')
            <button type="button" class="popover-trigger popover-trigger--ghost" wire:click="toggleManual">
                {{ $manualOpen ? 'Close popover' : 'Open popover' }}
            </button>
        @endif
    </div>

    <div class="popover-playground__stage" wire:key="{{ $instanceKey }}">
        <x-affino-popover
            class="popover-demo"
            :popover-id="$popoverId"
            :placement="$placement"
            :align="$align"
            :gutter="12"
            :pinned="$isOpen"
            :default-open="$isOpen"
            :data-affino-popover-state="$isOpen ? 'open' : 'closed'"
            :data-affino-popover-state-sync="($mode === 'manual' || $alwaysOpen) ? 'true' : 'false'"
            :data-affino-popover-manual="$mode === 'manual' ? 'true' : 'false'"
            :close-on-interact-outside="$mode !== 'manual'"
        >
            <x-slot:trigger>
                <button type="button" class="popover-trigger">
                    Explore actions
                </button>
            </x-slot:trigger>

            <div class="popover-surface popover-surface--form">
                <label class="popover-field">
                    <span>Owner</span>
                    <input type="text" wire:model.live="draftOwner" data-affino-focus-key="simple-owner-input" placeholder="Type owner" />
                </label>
                <label class="popover-field">
                    <span>Priority</span>
                    <x-affino-listbox
                        class="popover-field__listbox"
                        :listbox-id="$priorityListboxId"
                        placeholder="Select priority"
                        mode="single"
                        model="draftPriority"
                        :data-affino-livewire-owner="$componentId"
                        :selected="$draftPriority"
                        :display="$draftPriority"
                    >
                        <x-affino-listbox-option value="High" :selected="$draftPriority === 'High'">High</x-affino-listbox-option>
                        <x-affino-listbox-option value="Medium" :selected="$draftPriority === 'Medium'">Medium</x-affino-listbox-option>
                        <x-affino-listbox-option value="Low" :selected="$draftPriority === 'Low'">Low</x-affino-listbox-option>
                    </x-affino-listbox>
                </label>
                <span class="popover-surface__live">Live: {{ $draftOwner !== '' ? $draftOwner : 'Unassigned' }} · {{ $draftPriority }}</span>
                <span class="popover-surface__live popover-surface__live--applied">Applied: {{ $appliedOwner }} · {{ $appliedPriority }}</span>
                <div class="popover-actions">
                    <button
                        type="button"
                        class="popover-action popover-action--primary"
                        data-affino-livewire-owner="{{ $componentId }}"
                        data-affino-livewire-call="applyDraft"
                    >
                        Apply
                    </button>
                    <button
                        type="button"
                        class="popover-action"
                        data-affino-livewire-owner="{{ $componentId }}"
                        data-affino-livewire-call="resetDraft"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <x-slot:arrow>
                <span></span>
            </x-slot:arrow>
        </x-affino-popover>
    </div>
</div>
