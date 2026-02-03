<?php

namespace App\Livewire\Select;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class Showcase extends Component
{
    /**
     * @var array<int, array<string, string>>
     */
    public array $regions = [];

    /**
     * @var array<int, array<string, string>>
     */
    public array $watcherPools = [];

    /**
     * @var array<int, array<string, string>>
     */
    public array $priorityTiers = [];

    public string $primaryRegion = 'emea';

    /**
     * @var array<int, string>
     */
    public array $watchlists = ['emea', 'latam'];

    public string $priorityTier = 'tier-1';

    public function mount(): void
    {
        $this->regions = [
            ['value' => 'emea', 'label' => 'EMEA control plane', 'meta' => 'Frankfurt + London', 'status' => 'Green'],
            ['value' => 'apac', 'label' => 'APAC dispatch', 'meta' => 'Sydney + Singapore', 'status' => 'Monitoring'],
            ['value' => 'us-west', 'label' => 'US West core', 'meta' => 'Seattle + LA', 'status' => 'Scaling'],
            ['value' => 'latam', 'label' => 'LatAm responders', 'meta' => 'Bogotá + São Paulo', 'status' => 'Green'],
        ];

        $this->watcherPools = [
            ['value' => 'emea', 'label' => 'EMEA follow-up', 'meta' => 'Paris + Berlin'],
            ['value' => 'apac', 'label' => 'APAC escalations', 'meta' => 'Tokyo + Sydney'],
            ['value' => 'us-west', 'label' => 'US West edge', 'meta' => 'SFO + PDX'],
            ['value' => 'latam', 'label' => 'LatAm playbooks', 'meta' => 'Lima + Bogotá'],
            ['value' => 'global', 'label' => 'Global standby', 'meta' => 'Remote rotation'],
        ];

        $this->priorityTiers = [
            ['value' => 'tier-0', 'label' => 'Tier 0 · Critical', 'meta' => 'VP + Incident Cmd'],
            ['value' => 'tier-1', 'label' => 'Tier 1 · Sustained', 'meta' => 'On-call IC'],
            ['value' => 'tier-2', 'label' => 'Tier 2 · Regional', 'meta' => 'Regional lead'],
            ['value' => 'tier-3', 'label' => 'Tier 3 · Backlog', 'meta' => 'Async review'],
        ];
    }

    public function randomizePrimary(): void
    {
        $this->primaryRegion = Arr::random(array_column($this->regions, 'value'));
    }

    public function applyFollowTheSun(): void
    {
        $this->watchlists = ['emea', 'apac', 'latam'];
    }

    public function clearWatchlists(): void
    {
        $this->watchlists = [];
    }

    public function setPriority(string $value): void
    {
        $this->priorityTier = $value;
        $this->dispatch('affino-listbox:manual', id: 'priority-tier-select', action: 'select', value: $value, reason: 'programmatic');
    }

    public function openPriority(): void
    {
        $this->dispatch('affino-listbox:manual', id: 'priority-tier-select', action: 'open', reason: 'programmatic');
    }

    public function render(): View
    {
        return view('livewire.select.showcase', [
            'primaryRegionLabel' => $this->resolveLabel($this->regions, $this->primaryRegion),
            'priorityTierLabel' => $this->resolveLabel($this->priorityTiers, $this->priorityTier),
        ]);
    }

    /**
     * @param array<int, array<string, string>> $options
     */
    private function resolveLabel(array $options, string $value): string
    {
        $match = collect($options)->firstWhere('value', $value);
        return $match['label'] ?? Str::upper($value);
    }
}
