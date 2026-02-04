<?php

namespace App\Livewire\Combobox;

use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class Showcase extends Component
{
    /**
     * @var array<int, array<string, string>>
     */
    public array $playbooks = [];

    public string $playbook = '';

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
    public array $watchCandidates = [];

    /**
     * @var array<int, string>
     */
    public array $watchTeams = [];

    /**
     * @var array<int, array<string, string>>
     */
    public array $manualEscalations = [];

    public ?string $manualEscalation = null;

    public function mount(): void
    {
        $this->playbooks = [
            ['value' => 'scale-lanes', 'label' => 'Scale lanes · 15 min', 'meta' => 'Traffic split + cache warm', 'keywords' => 'scale routing cache warm traffic split'],
            ['value' => 'status-restore', 'label' => 'Status restore · 10 min', 'meta' => 'Rehydrate incidents feed', 'keywords' => 'status page restore feed'],
            ['value' => 'comms-grid', 'label' => 'Comms grid · 12 min', 'meta' => 'Channel + stakeholder sync', 'keywords' => 'communications grid stakeholder'],
            ['value' => 'failover-labs', 'label' => 'Failover labs · 18 min', 'meta' => 'Bring-up standby region', 'keywords' => 'failover region standby labs'],
            ['value' => 'warm-start', 'label' => 'Warm start · 8 min', 'meta' => 'Scale workers after pause', 'keywords' => 'workers restart warm start'],
        ];
        $this->playbook = $this->playbooks[0]['value'];

        $this->serviceDatasets = [
            [
                'id' => 'routing',
                'label' => 'Routing fabric',
                'description' => 'Balancers + pop health',
                'options' => [
                    ['value' => 'svc-meridians', 'label' => 'Meridians', 'meta' => 'Geo balancers + heartbeats'],
                    ['value' => 'svc-shardwatch', 'label' => 'Shardwatch', 'meta' => 'Shard drift + repair'],
                    ['value' => 'svc-circuit', 'label' => 'Circuit breakers', 'meta' => 'Bulkhead + retry bus'],
                ],
            ],
            [
                'id' => 'messaging',
                'label' => 'Messaging bus',
                'description' => 'Queues + fan-out',
                'options' => [
                    ['value' => 'svc-hookrelay', 'label' => 'Hook relay', 'meta' => 'Signed outbound webhooks'],
                    ['value' => 'svc-channels', 'label' => 'Channel router', 'meta' => 'Slack/Teams multiplex'],
                    ['value' => 'svc-bulkmail', 'label' => 'Bulk mailer', 'meta' => 'Customer status pushes'],
                ],
            ],
            [
                'id' => 'analytics',
                'label' => 'Analytics feeds',
                'description' => 'Usage + anomaly streams',
                'options' => [
                    ['value' => 'svc-forecast', 'label' => 'Capacity forecast', 'meta' => 'Seasonality + spikes'],
                    ['value' => 'svc-usage', 'label' => 'Usage lake', 'meta' => '24h drop detection'],
                    ['value' => 'svc-export', 'label' => 'Regulatory export', 'meta' => 'CSV/S3 nightly handoff'],
                ],
            ],
        ];
        $this->applyServiceDataset(0);

        $this->watchCandidates = [
            ['value' => 'ops-emea', 'label' => 'EMEA responders', 'meta' => 'Madrid · remote'],
            ['value' => 'ops-usw', 'label' => 'US West surge', 'meta' => 'Seattle · hybrid'],
            ['value' => 'ops-use', 'label' => 'US East desk', 'meta' => 'Atlanta · onsite'],
            ['value' => 'ops-apac', 'label' => 'APAC follow-the-sun', 'meta' => 'Singapore · remote'],
            ['value' => 'ops-latam', 'label' => 'LatAm standby', 'meta' => 'Bogotá · hybrid'],
        ];
        $this->watchTeams = ['ops-emea', 'ops-use'];

        $this->manualEscalations = [
            ['value' => 'none', 'label' => 'Unassigned', 'meta' => 'Queue triage before escalation'],
            ['value' => 'tier-3', 'label' => 'Tier 3 · Backlog', 'meta' => 'Async review'],
            ['value' => 'tier-2', 'label' => 'Tier 2 · Regional', 'meta' => 'On-duty regional lead'],
            ['value' => 'tier-1', 'label' => 'Tier 1 · Sustained', 'meta' => 'Incident command'],
            ['value' => 'tier-0', 'label' => 'Tier 0 · Critical', 'meta' => 'VP + executive paging'],
        ];
        $this->manualEscalation = 'tier-2';
    }

    public function rollPlaybook(): void
    {
        $values = array_column($this->playbooks, 'value');
        if ($values === []) {
            return;
        }
        $currentIndex = array_search($this->playbook, $values, true);
        $nextIndex = $currentIndex === false ? 0 : ($currentIndex + 1) % count($values);
        $this->playbook = $values[$nextIndex];
    }

    public function loadNextServiceDataset(): void
    {
        $this->cycleDataset(1);
    }

    public function loadPreviousServiceDataset(): void
    {
        $this->cycleDataset(-1);
    }

    public function clearWatchTeams(): void
    {
        $this->watchTeams = [];
    }

    public function seedWatchTeams(): void
    {
        $this->watchTeams = ['ops-emea', 'ops-usw', 'ops-apac'];
    }

    public function openManualEscalation(): void
    {
        $this->dispatch('affino-combobox:manual', id: 'manual-escalation-combobox', action: 'open');
    }

    public function closeManualEscalation(): void
    {
        $this->dispatch('affino-combobox:manual', id: 'manual-escalation-combobox', action: 'close');
    }

    public function selectManualEscalation(string $value): void
    {
        $this->manualEscalation = $value;
        $this->dispatch('affino-combobox:manual', id: 'manual-escalation-combobox', action: 'select', value: $value);
    }

    public function clearManualEscalation(): void
    {
        $this->manualEscalation = null;
        $this->dispatch('affino-combobox:manual', id: 'manual-escalation-combobox', action: 'clear');
    }

    public function render(): View
    {
        return view('livewire.combobox.showcase', [
            'playbookLabel' => $this->resolveLabel($this->playbooks, $this->playbook),
            'serviceDataset' => $this->serviceDatasets[$this->serviceDatasetIndex] ?? null,
            'serviceLabel' => $this->resolveLabel($this->serviceOptions, $this->service),
            'manualLabel' => $this->resolveLabel($this->manualEscalations, $this->manualEscalation),
        ]);
    }

    /**
     * @param array<int, array<string, string>> $options
     * @param string|null $value
     */
    private function resolveLabel(array $options, ?string $value): string
    {
        foreach ($options as $option) {
            if (($option['value'] ?? null) === $value) {
                return $option['label'] ?? $value;
            }
        }

        if ($value === null || $value === '') {
            return '—';
        }

        return Str::upper($value);
    }

    private function cycleDataset(int $delta): void
    {
        if ($this->serviceDatasets === []) {
            return;
        }
        $count = count($this->serviceDatasets);
        $nextIndex = ($this->serviceDatasetIndex + $delta + $count) % $count;
        $this->applyServiceDataset($nextIndex);
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
