@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'overlay-rehydrate';
    $popoverId = "overlay-rehydrate-popover-{$componentId}";
@endphp

<div class="overlay-kernel-case overlay-kernel-case--rehydrate">
    <div class="overlay-kernel-rehydrateActions">
        <button type="button" class="overlay-kernel-button" wire:click="bumpRevision">
            Force re-render
        </button>
        <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" wire:click="toggleDiagnostics">
            {{ $showDiagnostics ? 'Hide diagnostics' : 'Show diagnostics' }}
        </button>
        <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" wire:click="resetDraft">
            Reset text
        </button>
    </div>

    <x-affino-popover
        class="overlay-kernel-popoverRoot"
        :popover-id="$popoverId"
        placement="bottom"
        align="start"
        :gutter="10"
        :close-on-interact-outside="true"
    >
        <x-slot:trigger>
            <button type="button" class="overlay-kernel-trigger">
                Open stable id popover
            </button>
        </x-slot:trigger>

        <div class="overlay-kernel-popover overlay-kernel-popover--form">
            <label class="overlay-kernel-field">
                <span>Draft value</span>
                <input type="text" wire:model.live="draft" data-affino-focus-key="overlay-rehydrate-draft" placeholder="Type and keep focus" />
            </label>
            <span>Revision: {{ $revision }}</span>
            <span>Current text: {{ $draft !== '' ? $draft : 'Empty' }}</span>
            @if ($showDiagnostics)
                <span class="overlay-kernel-hint">Popover id is stable per component instance: {{ $popoverId }}</span>
            @endif
            <div class="overlay-kernel-actions">
                <button type="button" class="overlay-kernel-button overlay-kernel-button--ghost" data-affino-popover-dismiss="programmatic">
                    Close
                </button>
            </div>
        </div>
    </x-affino-popover>

    <p class="overlay-kernel-hint">
        Expected: no duplicate overlay id errors during input updates and forced re-renders.
    </p>
</div>
