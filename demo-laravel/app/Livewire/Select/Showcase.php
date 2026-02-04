<?php

namespace App\Livewire\Select;

use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class Showcase extends Component
{
    /**
     * @var array<int, array<string, string>>
     */
    public array $demoRegions = [];

    public string $region = '';

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $serviceDatasets = [];

    public int $serviceDatasetIndex = 0;

    /**
     * @var array<int, array<string, string>>
     */
    public array $serviceOptions = [];

    public string $service = '';

    /**
     * @var array<int, array<string, string>>
     */
    public array $responseTeams = [];

    /**
     * @var array<int, string>
     */
    public array $teamSelection = [];

    /**
     * @var array<int, array<string, string>>
     */
    public array $manualTiers = [];

    public string $manualTier = '';

    public function mount(): void
    {
        $this->demoRegions = [
            ['value' => 'emea-routing', 'label' => 'EMEA · Routing hub', 'meta' => 'Frankfurt + London'],
            ['value' => 'amer-edges', 'label' => 'Americas · Edge mesh', 'meta' => 'Seattle + Montréal'],
            ['value' => 'apac-orbit', 'label' => 'APAC · Orbit lanes', 'meta' => 'Sydney + Seoul'],
            ['value' => 'latam-field', 'label' => 'LatAm · Field kit', 'meta' => 'Bogotá + São Paulo'],
        ];
        $this->region = $this->demoRegions[0]['value'];

        $this->serviceDatasets = [
            [
                'id' => 'core',
                'label' => 'Core services',
                'description' => 'HTTP + control-plane workloads',
                'options' => [
                    ['value' => 'svc-routing', 'label' => 'Routing mesh', 'meta' => 'Edge balancers + keepalives'],
                    ['value' => 'svc-alerts', 'label' => 'Pager dispatcher', 'meta' => 'Alert fan-out + dedupe'],
                    ['value' => 'svc-status', 'label' => 'Status writer', 'meta' => 'Customer facing updates'],
                ],
            ],
            [
                'id' => 'messaging',
                'label' => 'Messaging lanes',
                'description' => 'Queues + async integrations',
                'options' => [
                    ['value' => 'svc-webhooks', 'label' => 'Webhook relay', 'meta' => 'Signed outbound calls'],
                    ['value' => 'svc-inbox', 'label' => 'Shared inbox', 'meta' => 'Replies from Slack/Teams'],
                    ['value' => 'svc-transcript', 'label' => 'Transcript mirror', 'meta' => 'Voice + SMS capture'],
                ],
            ],
            [
                'id' => 'analytics',
                'label' => 'Analytics cuts',
                'description' => 'Usage + anomaly feeds',
                'options' => [
                    ['value' => 'svc-dashboards', 'label' => 'Live dashboards', 'meta' => 'MTTR, SLA, burn-up'],
                    ['value' => 'svc-forecast', 'label' => 'Capacity forecast', 'meta' => 'Seasonality + spikes'],
                    ['value' => 'svc-export', 'label' => 'Audit export', 'meta' => 'CSV/S3 drops nightly'],
                ],
            ],
        ];
        $this->applyServiceDataset(0);

        $this->responseTeams = [
            ['value' => 'ops-emea', 'label' => 'EMEA responders', 'meta' => 'Madrid · remote'],
            ['value' => 'ops-usw', 'label' => 'US West surge', 'meta' => 'Seattle · hybrid'],
            ['value' => 'ops-use', 'label' => 'US East desk', 'meta' => 'Atlanta · onsite'],
            ['value' => 'ops-apac', 'label' => 'APAC follow-the-sun', 'meta' => 'Singapore · remote'],
            ['value' => 'ops-latam', 'label' => 'LatAm standby', 'meta' => 'Bogotá · hybrid'],
        ];
        $this->teamSelection = ['ops-emea', 'ops-usw'];

        $this->manualTiers = [
            ['value' => 'none', 'label' => 'Unassigned', 'meta' => 'Queue triage before escalation'],
            ['value' => 'tier-3', 'label' => 'Tier 3 · Backlog', 'meta' => 'Async review'],
            ['value' => 'tier-2', 'label' => 'Tier 2 · Regional', 'meta' => 'On-duty regional lead'],
            ['value' => 'tier-1', 'label' => 'Tier 1 · Sustained', 'meta' => 'Incident command'],
            ['value' => 'tier-0', 'label' => 'Tier 0 · Critical', 'meta' => 'VP + executive paging'],
        ];
        $this->manualTier = 'tier-2';
    }

    public function cycleRegion(): void
    {
        $values = array_column($this->demoRegions, 'value');
        if ($values === []) {
            return;
        }
        $currentIndex = array_search($this->region, $values, true);
        $nextIndex = $currentIndex === false ? 0 : ($currentIndex + 1) % count($values);
        $this->region = $values[$nextIndex];
    }

    public function loadNextDataset(): void
    {
        if ($this->serviceDatasets === []) {
            return;
        }
        $count = count($this->serviceDatasets);
        $nextIndex = ($this->serviceDatasetIndex + 1) % $count;
        $this->applyServiceDataset($nextIndex);
    }

    public function loadPreviousDataset(): void
    {
        if ($this->serviceDatasets === []) {
            return;
        }
        $count = count($this->serviceDatasets);
        $nextIndex = ($this->serviceDatasetIndex - 1 + $count) % $count;
        $this->applyServiceDataset($nextIndex);
    }

    public function clearTeams(): void
    {
        $this->teamSelection = [];
    }

    public function seedTeams(): void
    {
        $this->teamSelection = ['ops-emea', 'ops-usw', 'ops-apac'];
    }

    public function openManualTier(): void
    {
        $this->dispatch('affino-listbox:manual', id: 'manual-tier-select', action: 'open', reason: 'programmatic');
    }

    public function closeManualTier(): void
    {
        $this->dispatch('affino-listbox:manual', id: 'manual-tier-select', action: 'close', reason: 'programmatic');
    }

    public function selectManualTier(string $value): void
    {
        $this->manualTier = $value;
        $this->dispatch('affino-listbox:manual', id: 'manual-tier-select', action: 'select', value: $value, reason: 'programmatic');
    }

    public function render(): View
    {
        return view('livewire.select.showcase', [
            'regionLabel' => $this->resolveLabel($this->demoRegions, $this->region),
            'serviceDataset' => $this->serviceDatasets[$this->serviceDatasetIndex] ?? null,
            'serviceLabel' => $this->resolveLabel($this->serviceOptions, $this->service),
            'manualTierLabel' => $this->resolveLabel($this->manualTiers, $this->manualTier),
        ]);
    }

    /**
     * @param array<int, array<string, string>> $options
     */
    private function resolveLabel(array $options, string $value): string
    {
        foreach ($options as $option) {
            if (($option['value'] ?? null) === $value) {
                return $option['label'] ?? $value;
            }
        }

        if ($value === '') {
            return '—';
        }

        return Str::upper($value);
    }

    private function applyServiceDataset(int $index): void
    {
        if ($this->serviceDatasets === []) {
            $this->serviceOptions = [];
            $this->service = '';
            $this->serviceDatasetIndex = 0;
            return;
        }

        $count = count($this->serviceDatasets);
        $normalized = ($index % $count + $count) % $count;
        $this->serviceDatasetIndex = $normalized;
        $dataset = $this->serviceDatasets[$normalized];
        $this->serviceOptions = $dataset['options'] ?? [];

        $values = array_column($this->serviceOptions, 'value');
        if ($values === []) {
            $this->service = '';
            return;
        }

        if (!in_array($this->service, $values, true)) {
            $this->service = $values[0];
        }
    }
}
