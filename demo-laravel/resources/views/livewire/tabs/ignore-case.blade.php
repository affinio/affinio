@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'tabs-ignore';
    $tabsRootId = "tabs-ignore-{$componentId}";
@endphp

<div class="tabs-ignore">
    <div class="tabs-ignore__header">
        <button type="button" class="tabs-button" wire:click="pulse">
            Run Livewire pulse
        </button>
        <span>Pulses: {{ $pulseCount }}</span>
        <span>Queue depth: {{ $queueDepth }}</span>
    </div>

    <div class="tabs-ignore__island" wire:ignore>
        <div
            class="tabs-ignore__root"
            data-affino-tabs-root="{{ $tabsRootId }}"
            data-affino-tabs-default-value="alpha"
        >
            <div class="tabs-ignore__triggerRow" role="tablist" aria-label="Wire ignore tabs">
                <button type="button" class="tabs-trigger is-active" data-affino-tabs-trigger data-affino-tabs-value="alpha" role="tab" aria-selected="true">
                    <span>Alpha</span>
                    <small>Stable island</small>
                </button>
                <button type="button" class="tabs-trigger" data-affino-tabs-trigger data-affino-tabs-value="beta" role="tab" aria-selected="false">
                    <span>Beta</span>
                    <small>Static DOM</small>
                </button>
                <button type="button" class="tabs-trigger" data-affino-tabs-trigger data-affino-tabs-value="gamma" role="tab" aria-selected="false">
                    <span>Gamma</span>
                    <small>No morphing</small>
                </button>
            </div>

            <article class="tabs-ignore__panel" data-affino-tabs-content data-affino-tabs-value="alpha" role="tabpanel">
                <p>This tab root is wrapped in <code>wire:ignore</code>, so Livewire pulses do not remorph trigger/panel nodes.</p>
            </article>
            <article class="tabs-ignore__panel" data-affino-tabs-content data-affino-tabs-value="beta" role="tabpanel" hidden>
                <p>Use this setup when tabs should stay fully client-driven while server state updates nearby.</p>
            </article>
            <article class="tabs-ignore__panel" data-affino-tabs-content data-affino-tabs-value="gamma" role="tabpanel" hidden>
                <p>Hydration stays deterministic because adapter handles are not recreated on every server update.</p>
            </article>
        </div>
    </div>

    <p class="tabs-ignore__caption">
        Livewire keeps updating counters outside the island while tabs remain interactive inside it.
    </p>
</div>
