@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'dialogs-simple';
    $dialogId = "dialogs-hero-{$componentId}";
    $severityListboxId = "dialogs-severity-{$componentId}";
@endphp

<div class="dialogs-playground">
    <div class="dialogs-playground__controls">
        <label class="dialogs-control dialogs-control--toggle">
            <input type="checkbox" wire:model.live="modal" />
            <span>Modal</span>
        </label>
        <label class="dialogs-control dialogs-control--toggle">
            <input type="checkbox" wire:model.live="closeOnBackdrop" />
            <span>Backdrop close</span>
        </label>
        <label class="dialogs-control dialogs-control--toggle">
            <input type="checkbox" wire:model.live="closeOnEscape" />
            <span>Escape close</span>
        </label>
        <label class="dialogs-control dialogs-control--toggle">
            <input type="checkbox" wire:model.live="lockScroll" />
            <span>Lock scroll</span>
        </label>
    </div>

    <div class="dialogs-playground__stage">
        <x-affino-dialog
            :dialog-id="$dialogId"
            :modal="$modal"
            :close-on-backdrop="$closeOnBackdrop"
            :close-on-escape="$closeOnEscape"
            :lock-scroll="$lockScroll"
            teleport="body"
        >
            <x-slot:trigger>
                <button type="button" class="dialogs-trigger">
                    Open incident modal
                </button>
            </x-slot:trigger>

            <div class="dialogs-surface">
                <h4>Incident update draft</h4>

                <label class="dialogs-field">
                    <span>Title</span>
                    <input
                        type="text"
                        value="{{ $title }}"
                        data-affino-livewire-owner="{{ $componentId }}"
                        data-affino-livewire-model="title"
                        data-affino-livewire-model-event="input"
                        data-affino-focus-key="dialogs-hero-title"
                        placeholder="Incident title"
                    />
                </label>

                <label class="dialogs-field">
                    <span>Owner</span>
                    <input
                        type="text"
                        value="{{ $owner }}"
                        data-affino-livewire-owner="{{ $componentId }}"
                        data-affino-livewire-model="owner"
                        data-affino-livewire-model-event="input"
                        data-affino-focus-key="dialogs-hero-owner"
                        placeholder="Owner"
                    />
                </label>

                <label class="dialogs-field">
                    <span>Severity</span>
                    <x-affino-listbox
                        class="dialogs-field__listbox"
                        :listbox-id="$severityListboxId"
                        placeholder="Select severity"
                        mode="single"
                        model="severity"
                        :data-affino-livewire-owner="$componentId"
                        :selected="$severity"
                        :display="strtoupper($severity)"
                    >
                        <x-affino-listbox-option value="critical" :selected="$severity === 'critical'">CRITICAL</x-affino-listbox-option>
                        <x-affino-listbox-option value="high" :selected="$severity === 'high'">HIGH</x-affino-listbox-option>
                        <x-affino-listbox-option value="medium" :selected="$severity === 'medium'">MEDIUM</x-affino-listbox-option>
                        <x-affino-listbox-option value="low" :selected="$severity === 'low'">LOW</x-affino-listbox-option>
                    </x-affino-listbox>
                </label>

                <div class="dialogs-actions">
                    <button
                        type="button"
                        class="dialogs-button dialogs-button--primary"
                        data-affino-livewire-owner="{{ $componentId }}"
                        data-affino-livewire-call="saveDraft"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        class="dialogs-button dialogs-button--ghost"
                        data-affino-livewire-owner="{{ $componentId }}"
                        data-affino-livewire-call="resetDraft"
                    >
                        Reset
                    </button>
                    <button type="button" class="dialogs-button dialogs-button--ghost" data-affino-dialog-dismiss="programmatic">
                        Close
                    </button>
                </div>
                <p class="dialogs-hint">Saved revisions: {{ $saved }}</p>
            </div>
        </x-affino-dialog>
    </div>

    <dl class="dialogs-meta">
        <div>
            <dt>Saved</dt>
            <dd>{{ $saved }}</dd>
        </div>
        <div>
            <dt>Owner</dt>
            <dd>{{ $owner !== '' ? $owner : 'None' }}</dd>
        </div>
        <div>
            <dt>Severity</dt>
            <dd>{{ strtoupper($severity) }}</dd>
        </div>
    </dl>
</div>
