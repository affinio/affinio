@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'overlay-owner-cascade';
    $dialogId = "overlay-owner-dialog-{$componentId}";
    $popoverId = "overlay-owner-popover-{$componentId}";
@endphp

<div class="overlay-kernel-case">
    <x-affino-dialog
        :dialog-id="$dialogId"
        :modal="false"
        :close-on-backdrop="true"
        :close-on-escape="true"
        :lock-scroll="false"
        teleport="body"
    >
        <x-slot:trigger>
            <button type="button" class="overlay-kernel-trigger">
                Open parent dialog
            </button>
        </x-slot:trigger>

        <div class="overlay-kernel-dialog overlay-kernel-dialog--compact">
            <h4>Parent layer</h4>
            <p>Open child popover, then close the parent and verify the stack collapses cleanly.</p>

            <x-affino-popover
                class="overlay-kernel-popoverRoot"
                :popover-id="$popoverId"
                :owner-id="$dialogId"
                placement="right"
                align="start"
                :gutter="8"
            >
                <x-slot:trigger>
                    <button type="button" class="overlay-kernel-trigger overlay-kernel-trigger--ghost">
                        Open child popover
                    </button>
                </x-slot:trigger>

                <div class="overlay-kernel-popover">
                    <strong>Child layer</strong>
                    <span>Child confirmations: {{ $childConfirms }}</span>
                    <div class="overlay-kernel-actions">
                        <button
                            type="button"
                            class="overlay-kernel-button"
                            data-affino-livewire-owner="{{ $componentId }}"
                            data-affino-livewire-call="confirmChild"
                        >
                            Confirm
                        </button>
                        <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" data-affino-popover-dismiss="programmatic">Close child</button>
                    </div>
                </div>
            </x-affino-popover>

            <button
                type="button"
                class="overlay-kernel-button overlay-kernel-button--ghost"
                data-affino-livewire-owner="{{ $componentId }}"
                data-affino-livewire-call="recordParentClose"
                data-affino-dialog-dismiss="programmatic"
            >
                Close parent dialog
            </button>
        </div>
    </x-affino-dialog>

    <dl class="overlay-kernel-state">
        <div>
            <dt>Parent closes</dt>
            <dd>{{ $parentCloses }}</dd>
        </div>
        <div>
            <dt>Child confirms</dt>
            <dd>{{ $childConfirms }}</dd>
        </div>
    </dl>
</div>
