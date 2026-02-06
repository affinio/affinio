<div class="tooltip-dialog">
    <x-affino-dialog
        dialog-id="tooltip-dialog-edge"
        :modal="true"
        :close-on-backdrop="true"
        :close-on-escape="true"
        teleport="body"
    >
        <x-slot:trigger>
            <button type="button" class="tooltip-trigger">Open dialog</button>
        </x-slot:trigger>

        <div class="tooltip-dialog__surface">
            <h4>Dialog content</h4>
            <p>Tooltips inside overlays should mount cleanly.</p>
            <div
                class="tooltip-demo"
                data-affino-tooltip-root="dialog-tooltip"
                data-affino-tooltip-placement="top"
                data-affino-tooltip-align="center"
                data-affino-tooltip-gutter="10"
                data-affino-tooltip-open-delay="0"
                data-affino-tooltip-close-delay="0"
                data-affino-tooltip-trigger-mode="hover"
                data-affino-tooltip-state="closed"
            >
                <button type="button" class="tooltip-trigger" data-affino-tooltip-trigger>
                    Hover inside dialog
                </button>
                <div class="tooltip-surface" data-affino-tooltip-surface data-state="closed" hidden>
                    Tooltip should respect dialog layering.
                </div>
            </div>
        </div>
    </x-affino-dialog>
</div>
