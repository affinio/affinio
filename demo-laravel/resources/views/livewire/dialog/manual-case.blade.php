<div class="dialogs-case dialogs-manual">
    <div class="dialogs-manual__actions">
        <button type="button" class="dialogs-button dialogs-button--primary" wire:click="openFromServer">
            Open
        </button>
        <button type="button" class="dialogs-button dialogs-button--ghost" wire:click="closeFromServer">
            Close
        </button>
        <button type="button" class="dialogs-button dialogs-button--ghost" wire:click="toggleFromServer">
            Toggle
        </button>
    </div>

    <x-affino-dialog
        :dialog-id="$dialogId"
        :modal="true"
        :close-on-backdrop="true"
        :close-on-escape="true"
        teleport="body"
    >
        <x-slot:trigger>
            <button type="button" class="dialogs-trigger">
                Open manual dialog
            </button>
        </x-slot:trigger>

        <div class="dialogs-surface dialogs-surface--compact">
            <h4>Manual bridge dialog</h4>
            <p>This root is controlled by <code>affino-dialog:manual</code> events from Livewire.</p>
            <div class="dialogs-actions">
                <button
                    type="button"
                    class="dialogs-button dialogs-button--primary"
                    data-affino-livewire-owner="{{ $this->getId() }}"
                    data-affino-livewire-call="acknowledge"
                >
                    Acknowledge
                </button>
                <button type="button" class="dialogs-button dialogs-button--ghost" data-affino-dialog-dismiss="programmatic">
                    Close
                </button>
            </div>
        </div>
    </x-affino-dialog>

    <dl class="dialogs-state">
        <div>
            <dt>Dialog id</dt>
            <dd>{{ $dialogId }}</dd>
        </div>
        <div>
            <dt>Last action</dt>
            <dd>{{ $lastAction }}</dd>
        </div>
        <div>
            <dt>Dispatches</dt>
            <dd>{{ $dispatchCount }}</dd>
        </div>
        <div>
            <dt>Acknowledged</dt>
            <dd>{{ $acknowledged }}</dd>
        </div>
    </dl>
</div>
