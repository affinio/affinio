@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'dialogs-nested';
    $parentDialogId = "dialogs-nested-parent-{$componentId}";
    $childDialogId = "dialogs-nested-child-{$componentId}";
@endphp

<div class="dialogs-case dialogs-nested">
    <x-affino-dialog
        :dialog-id="$parentDialogId"
        :modal="true"
        :close-on-backdrop="true"
        :close-on-escape="true"
        teleport="body"
    >
        <x-slot:trigger>
            <button type="button" class="dialogs-trigger">
                Open parent dialog
            </button>
        </x-slot:trigger>

        <div class="dialogs-surface">
            <h4>Parent layer</h4>
            <p>Open a second dialog from here and verify deterministic stack order in overlay inspector.</p>

            <div class="dialogs-actions">
                <button type="button" class="dialogs-button dialogs-button--primary" wire:click="approveParent">
                    Parent approve
                </button>
            </div>

            <x-affino-dialog
                :dialog-id="$childDialogId"
                :modal="true"
                :close-on-backdrop="true"
                :close-on-escape="true"
                teleport="body"
            >
                <x-slot:trigger>
                    <button type="button" class="dialogs-trigger dialogs-trigger--ghost">
                        Open child dialog
                    </button>
                </x-slot:trigger>

                <div class="dialogs-surface dialogs-surface--compact">
                    <h4>Child layer</h4>
                    <div class="dialogs-actions">
                        <button type="button" class="dialogs-button dialogs-button--primary" wire:click="approveChild">
                            Child approve
                        </button>
                        <button type="button" class="dialogs-button dialogs-button--ghost" data-affino-dialog-dismiss="programmatic">
                            Close child
                        </button>
                    </div>
                </div>
            </x-affino-dialog>

            <button type="button" class="dialogs-button dialogs-button--ghost" data-affino-dialog-dismiss="programmatic">
                Close parent
            </button>
        </div>
    </x-affino-dialog>

    <dl class="dialogs-state">
        <div>
            <dt>Parent approvals</dt>
            <dd>{{ $parentApprovals }}</dd>
        </div>
        <div>
            <dt>Child approvals</dt>
            <dd>{{ $childApprovals }}</dd>
        </div>
    </dl>
</div>
