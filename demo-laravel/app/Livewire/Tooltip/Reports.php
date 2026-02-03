<?php

namespace App\Livewire\Tooltip;

use Illuminate\Support\Arr;
use Livewire\Component;
use Illuminate\View\View;

class Reports extends Component
{
    public string $activeRegion = 'emea';

    public int $refreshTick = 0;

    /**
     * @var array<string, array<int, array<string, mixed>>>
     */
    protected array $regions = [
        'emea' => [
            ['id' => 'fr-edge', 'name' => 'Frankfurt edge', 'uptime' => '99.986%', 'tooltip' => 'Edge nodes proxy requests across 3 AZs.'],
            ['id' => 'ldn-core', 'name' => 'London core', 'uptime' => '99.972%', 'tooltip' => 'Primary host for EU-based Livewire renders.'],
        ],
        'apac' => [
            ['id' => 'sin-core', 'name' => 'Singapore core', 'uptime' => '99.994%', 'tooltip' => 'Autoscaled for the nightly Melbourne traffic spike.'],
            ['id' => 'tok-ml', 'name' => 'Tokyo ML cluster', 'uptime' => '99.961%', 'tooltip' => 'GPU-heavy inference nodes that emit tooltips for 120ms less latency.'],
        ],
        'amer' => [
            ['id' => 'sfo-core', 'name' => 'San Francisco core', 'uptime' => '99.982%', 'tooltip' => 'Primary Livewire navigation host.'],
            ['id' => 'iad-edge', 'name' => 'Ashburn edge', 'uptime' => '99.978%', 'tooltip' => 'Fallback region when east coast traffic spikes.'],
        ],
    ];

    public function setRegion(string $region): void
    {
        if (array_key_exists($region, $this->regions)) {
            $this->activeRegion = $region;
        }
    }

    public function refreshMetrics(): void
    {
        $this->refreshTick++;
    }

    public function render(): View
    {
        return view('livewire.tooltip.reports', [
            'regionKeys' => array_keys($this->regions),
            'entries' => $this->regionEntries,
        ]);
    }

    public function getRegionEntriesProperty(): array
    {
        $entries = $this->regions[$this->activeRegion] ?? [];

        return array_map(function (array $entry) {
            $entry['uptime_label'] = $entry['uptime'] . ($this->refreshTick ? ' · refresh ' . $this->refreshTick : '');
            $entry['tooltip_label'] = $entry['tooltip'] . ($this->refreshTick ? " (refreshed {$this->refreshTick}×)" : '');
            $entry['tooltip_id'] = 'report-tooltip-' . $entry['id'];

            return $entry;
        }, $entries);
    }
}
