<div class="popover-modal-case">
    <x-affino-popover
        class="popover-demo"
        popover-id="modal-popover-case"
        placement="bottom"
        align="center"
        :gutter="12"
        :modal="true"
        :lock-scroll="true"
        :close-on-interact-outside="true"
        :return-focus="true"
    >
        <x-slot:trigger>
            <button type="button" class="popover-trigger">
                Open modal popover
            </button>
        </x-slot:trigger>

        <div class="popover-surface popover-surface--form">
            <strong>Danger zone confirmation</strong>
            <span>Use modal popover when action is local but still critical.</span>
            <div class="popover-actions">
                <button type="button" class="popover-action popover-action--primary" wire:click="acknowledge">Acknowledge</button>
                <button type="button" class="popover-action">Cancel</button>
            </div>
            <span>Acknowledged: {{ $acknowledged }}</span>
        </div>
    </x-affino-popover>
</div>
