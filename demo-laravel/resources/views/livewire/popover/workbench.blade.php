<section class="tooltip-demo-grid popover-grid" wire:key="popover-workbench">
    <article class="tooltip-card popover-card">
        <p class="tooltip-card__eyebrow">Mode 06</p>
        <h2 class="tooltip-card__title">Incident drawer</h2>
        <p class="tooltip-card__text">
            Popovers attach to every cluster row. When Livewire refreshes the data, the helper rebinds the controller,
            preserves the open state, and keeps placement aligned with the trigger.
        </p>

        <ul class="popover-stack">
            @foreach ($clusters as $cluster)
                <li class="popover-stack__row" wire:key="cluster-{{ $cluster['id'] }}">
                    <div class="popover-stack__meta">
                        <p>{{ $cluster['name'] }}</p>
                        <small>{{ $cluster['owner'] }}</small>
                    </div>
                    <div class="popover-runtime">
                        <span>{{ $cluster['lag'] }}</span>
                        <span>{{ $cluster['load'] }}</span>
                    </div>

                    <x-affino-popover
                        :popover-id="'cluster-' . $cluster['id']"
                        placement="left"
                        align="center"
                        gutter="18"
                        viewport-padding="32"
                    >
                        <x-slot:trigger>
                            <button type="button" class="tooltip-button tooltip-button--ghost">
                                {{ $cluster['status'] }}
                            </button>
                        </x-slot:trigger>

                        <div class="popover-bubble" role="dialog">
                            <p class="popover-bubble__title">{{ $cluster['name'] }}</p>
                            <p class="popover-bubble__body">{{ $cluster['detail'] }}</p>
                            <ul class="popover-bubble__list">
                                @foreach ($cluster['checklist'] as $item)
                                    <li>{{ $item }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </x-affino-popover>
                </li>
            @endforeach
        </ul>

        <button type="button" class="tooltip-button" wire:click="refreshClusters">
            Refresh feed ({{ $refreshTick }})
        </button>
    </article>

    <article class="tooltip-card popover-card">
        <p class="tooltip-card__eyebrow">Mode 07</p>
        <h2 class="tooltip-card__title">Approval matrix</h2>
        <p class="tooltip-card__text">
            Grouped popovers highlight where approvals are stuck. Each button toggles the Livewire array; hydration keeps the
            correct controller wired to the DOM node.
        </p>

        <div class="popover-matrix">
            @foreach ($matrixGroups as $role => $entries)
                <div class="popover-matrix__group" wire:key="matrix-role-{{ \Illuminate\Support\Str::slug($role) }}">
                    <p class="popover-matrix__title">{{ $role }}</p>
                    <ul>
                        @foreach ($entries as $entry)
                            <li class="popover-matrix__row" wire:key="matrix-{{ $entry['id'] }}">
                                <div>
                                    <p>{{ $entry['label'] }}</p>
                                    <small>{{ $entry['owner'] }}</small>
                                </div>

                                <x-affino-popover
                                    :popover-id="'matrix-' . $entry['id']"
                                    placement="top"
                                    align="end"
                                    gutter="10"
                                >
                                    <x-slot:trigger>
                                        <button type="button" class="tooltip-button {{ $entry['status'] === 'Ready' ? 'tooltip-button--accent' : 'tooltip-button--ghost' }}">
                                            {{ $entry['status'] }}
                                        </button>
                                    </x-slot:trigger>

                                    <div class="popover-bubble" role="dialog">
                                        <p class="popover-bubble__title">{{ $entry['label'] }}</p>
                                        <p class="popover-bubble__body">{{ $entry['notes'] }}</p>
                                        <button type="button" class="tooltip-button tooltip-button--ghost" wire:click="toggleMatrix('{{ $entry['id'] }}')">
                                            Toggle status
                                        </button>
                                    </div>
                                </x-affino-popover>
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endforeach
        </div>
    </article>

    <article class="tooltip-card popover-card">
        <p class="tooltip-card__eyebrow">Mode 08</p>
        <h2 class="tooltip-card__title">Insights pinned by default</h2>
        <p class="tooltip-card__text">
            Default-open popovers act as inline panels. The pinned attribute ensures they re-open after polling or
            wire:navigate routes.
        </p>

        <x-affino-popover
            popover-id="insight-popover"
            placement="right"
            align="start"
            gutter="14"
            default-open="true"
            :pinned="$insightPinned"
        >
            <x-slot:trigger>
                <button type="button" class="tooltip-button tooltip-button--ghost">
                    View insight
                </button>
            </x-slot:trigger>

            <div class="popover-bubble" role="dialog">
                <p class="popover-bubble__title">Follow-up insights</p>
                <p class="popover-bubble__body">
                    This panel stays open while Livewire re-renders the component. Toggle the checkbox to control whether the
                    helper should re-open the surface automatically.
                </p>
            </div>
        </x-affino-popover>

        <label class="popover-toggle" for="popover-insight-pinned">
            <input id="popover-insight-pinned" name="insight_pinned" type="checkbox" wire:model.live="insightPinned">
            Keep insights pinned after renders
        </label>
    </article>
</section>
