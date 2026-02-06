@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'overlay-modal-rules';
    $popoverId = "overlay-modal-popover-{$componentId}";
    $dialogId = "overlay-modal-dialog-{$componentId}";
@endphp

<div class="overlay-kernel-case overlay-kernel-case--modal">
    <div class="overlay-kernel-modalGrid">
        <x-affino-popover
            class="overlay-kernel-popoverRoot"
            :popover-id="$popoverId"
            placement="bottom"
            align="start"
            :gutter="10"
            :modal="true"
            :lock-scroll="true"
            :close-on-interact-outside="false"
        >
            <x-slot:trigger>
                <button type="button" class="overlay-kernel-trigger">
                    Open modal popover
                </button>
            </x-slot:trigger>

            <div class="overlay-kernel-popover overlay-kernel-popover--modal">
                <strong>Modal popover flow</strong>
                <span>Outside pointer/focus is blocked until close.</span>
                <div class="overlay-kernel-actions">
                    <button type="button" class="overlay-kernel-button" wire:click="approvePopover">Approve</button>
                    <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" data-affino-popover-dismiss="programmatic">Close</button>
                </div>
            </div>
        </x-affino-popover>

        <x-affino-dialog
            :dialog-id="$dialogId"
            :modal="true"
            :close-on-backdrop="true"
            :close-on-escape="true"
            :lock-scroll="true"
            teleport="body"
        >
            <x-slot:trigger>
                <button type="button" class="overlay-kernel-trigger">
                    Open modal dialog
                </button>
            </x-slot:trigger>

            <div class="overlay-kernel-dialog overlay-kernel-dialog--compact">
                <h4>Critical confirmation dialog</h4>
                <label class="overlay-kernel-field">
                    <span>Draft message</span>
                    <input type="text" wire:model.live="draftMessage" data-affino-focus-key="overlay-modal-draft" placeholder="Type draft" />
                </label>
                <div class="overlay-kernel-actions">
                    <button type="button" class="overlay-kernel-button" wire:click="saveDialog">Save</button>
                    <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" wire:click="clearDialogDraft">Clear</button>
                    <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" data-affino-dialog-dismiss="programmatic">Close</button>
                </div>
            </div>
        </x-affino-dialog>
    </div>

    <dl class="overlay-kernel-state">
        <div>
            <dt>Popover approvals</dt>
            <dd>{{ $popoverApprovals }}</dd>
        </div>
        <div>
            <dt>Dialog saves</dt>
            <dd>{{ $dialogSaves }}</dd>
        </div>
        <div>
            <dt>Draft</dt>
            <dd>{{ $draftMessage !== '' ? $draftMessage : 'Empty' }}</dd>
        </div>
    </dl>
</div>
