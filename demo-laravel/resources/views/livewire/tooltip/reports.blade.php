<section class="tooltip-demo-grid" wire:key="tooltip-reports">
    <article class="tooltip-card">
        <p class="tooltip-card__eyebrow">Mode 05</p>
        <h2 class="tooltip-card__title">Region drill-down</h2>
        <p class="tooltip-card__text">
            Navigate between Livewire pages with <code>wire:navigate</code>, then pivot across regions without a full page
            reload. Each dataset swap triggers a morph, and the tooltip bootstrapper catches every mutation.
        </p>

        <div class="tooltip-card__actions">
            @foreach ($regionKeys as $region)
                <button
                    type="button"
                    class="tooltip-button {{ $activeRegion === $region ? '' : 'tooltip-button--ghost' }}"
                    wire:click="setRegion('{{ $region }}')"
                >
                    {{ strtoupper($region) }}
                </button>
            @endforeach
        </div>

        <ul class="tooltip-report-list">
            @foreach ($entries as $entry)
                <li wire:key="region-{{ $entry['id'] }}">
                    <x-affino-tooltip
                        tooltip-id="{{ $entry['tooltip_id'] }}"
                        trigger="focus"
                        placement="bottom"
                        align="start"
                        gutter="12"
                    >
                        <x-slot:trigger>
                            <button type="button" class="tooltip-trigger tooltip-trigger--minimal">
                                <span>{{ $entry['name'] }}</span>
                                <span>{{ $entry['uptime_label'] }}</span>
                            </button>
                        </x-slot:trigger>

                        <div class="tooltip-bubble" role="tooltip">
                            <p class="tooltip-bubble__title">{{ $entry['name'] }}</p>
                            <p class="tooltip-bubble__body">
                                {{ $entry['tooltip_label'] }}
                                <span class="tooltip-bubble__meta">wire:navigate keeps this tooltip hydrated.</span>
                            </p>
                        </div>
                    </x-affino-tooltip>
                </li>
            @endforeach
        </ul>

        <div class="tooltip-card__actions">
            <button type="button" class="tooltip-button" wire:click="refreshMetrics">Refresh metrics</button>
        </div>
    </article>
</section>
