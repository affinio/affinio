@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'popover-nested';
    $parentPopoverId = "nested-parent-popover-{$componentId}";
    $childPopoverId = "nested-child-popover-{$componentId}";
@endphp

<div class="popover-nested">
    <x-affino-popover
        class="popover-demo"
        :popover-id="$parentPopoverId"
        placement="bottom"
        align="start"
        :gutter="10"
        :close-on-interact-outside="false"
        data-affino-popover-manual="true"
    >
        <x-slot:trigger>
            <button type="button" class="popover-trigger">
                Open parent popover
            </button>
        </x-slot:trigger>

        <div class="popover-surface">
            <strong>Parent layer</strong>
            <span>Nested surfaces should keep stack order and close semantics.</span>

            <x-affino-popover class="popover-demo" :popover-id="$childPopoverId" placement="right" align="start" :gutter="8">
                <x-slot:trigger>
                    <button type="button" class="popover-trigger popover-trigger--ghost">
                        Open nested
                    </button>
                </x-slot:trigger>

                <div class="popover-surface">
                    <strong>Nested layer</strong>
                    <span>Confirmations: {{ $confirmations }}</span>
                    <div class="popover-actions">
                        <button type="button" class="popover-action popover-action--primary" wire:click="confirm">Confirm</button>
                    </div>
                </div>
            </x-affino-popover>
        </div>
    </x-affino-popover>
</div>
