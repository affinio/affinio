@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'dialogs-pinned';
    $dialogId = "dialogs-pinned-{$componentId}";
@endphp

<div class="dialogs-case dialogs-pinned">
    <div class="dialogs-pinned__controls">
        <button type="button" class="dialogs-button dialogs-button--primary" wire:click="pulse">
            Pulse Livewire
        </button>
        <button type="button" class="dialogs-button dialogs-button--ghost" wire:click="clearNote">
            Clear note
        </button>
        <label class="dialogs-control dialogs-control--toggle">
            <input type="checkbox" wire:model.live="pinned" />
            <span>Pinned</span>
        </label>
    </div>

    <x-affino-dialog
        :dialog-id="$dialogId"
        :modal="false"
        :lock-scroll="false"
        :close-on-backdrop="true"
        :close-on-escape="true"
        :pinned="$pinned"
        teleport="body"
    >
        <x-slot:trigger>
            <button type="button" class="dialogs-trigger">
                Open pinned dialog
            </button>
        </x-slot:trigger>

        <div class="dialogs-surface dialogs-surface--compact">
            <h4>Pinned behavior check</h4>
            <label class="dialogs-field">
                <span>Live note</span>
                <input
                    type="text"
                    value="{{ $note }}"
                    data-affino-livewire-owner="{{ $componentId }}"
                    data-affino-livewire-model="note"
                    data-affino-livewire-model-event="input"
                    data-affino-focus-key="dialogs-pinned-note"
                    placeholder="Type while pulses run"
                />
            </label>
            <span class="dialogs-hint">Pinned keeps this dialog open across Livewire morphs.</span>
            <button type="button" class="dialogs-button dialogs-button--ghost" data-affino-dialog-dismiss="programmatic">
                Close
            </button>
        </div>
    </x-affino-dialog>

    <dl class="dialogs-state">
        <div>
            <dt>Pulses</dt>
            <dd>{{ $pulseCount }}</dd>
        </div>
        <div>
            <dt>Pinned</dt>
            <dd>{{ $pinned ? 'true' : 'false' }}</dd>
        </div>
        <div>
            <dt>Note</dt>
            <dd>{{ $note !== '' ? $note : 'None' }}</dd>
        </div>
    </dl>
</div>
