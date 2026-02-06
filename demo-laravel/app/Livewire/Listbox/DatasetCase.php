<?php

namespace App\Livewire\Listbox;

use Illuminate\View\View;
use Livewire\Component;

class DatasetCase extends Component
{
    /**
     * @var array<int, array{id: string, label: string, description: string, options: array<int, array{value: string, label: string, meta: string}>}>
     */
    public array $datasets = [
        [
            'id' => 'routing',
            'label' => 'Routing fabric',
            'description' => 'Balancers + region health',
            'options' => [
                ['value' => 'svc-meridians', 'label' => 'Meridians', 'meta' => 'Geo balancers + heartbeats'],
                ['value' => 'svc-shardwatch', 'label' => 'Shardwatch', 'meta' => 'Shard drift + repair'],
                ['value' => 'svc-circuit', 'label' => 'Circuit breakers', 'meta' => 'Bulkhead + retry bus'],
            ],
        ],
        [
            'id' => 'messaging',
            'label' => 'Messaging bus',
            'description' => 'Queues + outbound fan-out',
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

    public int $datasetIndex = 0;

    /**
     * @var array<int, array{value: string, label: string, meta: string}>
     */
    public array $options = [];

    public string $selection = '';

    public int $customOptionCounter = 1;

    public function mount(): void
    {
        $this->applyDataset(0);
    }

    public function loadNextDataset(): void
    {
        $count = count($this->datasets);
        if ($count === 0) {
            return;
        }

        $next = ($this->datasetIndex + 1) % $count;
        $this->applyDataset($next);
    }

    public function loadPreviousDataset(): void
    {
        $count = count($this->datasets);
        if ($count === 0) {
            return;
        }

        $next = ($this->datasetIndex - 1 + $count) % $count;
        $this->applyDataset($next);
    }

    public function addCustomOption(): void
    {
        $suffix = $this->customOptionCounter++;
        $value = 'svc-custom-'.$suffix;
        $label = 'Custom lane '.$suffix;

        $this->options[] = [
            'value' => $value,
            'label' => $label,
            'meta' => 'Injected during a Livewire mutation',
        ];

        $this->selection = $value;
    }

    public function removeCurrentSelection(): void
    {
        if ($this->selection === '') {
            return;
        }

        $this->options = array_values(array_filter(
            $this->options,
            fn (array $option): bool => ($option['value'] ?? '') !== $this->selection
        ));

        $this->selection = $this->options[0]['value'] ?? '';
    }

    public function render(): View
    {
        return view('livewire.listbox.dataset-case', [
            'dataset' => $this->datasets[$this->datasetIndex] ?? null,
            'selectionLabel' => $this->resolveLabel($this->selection),
        ]);
    }

    private function applyDataset(int $index): void
    {
        if ($this->datasets === []) {
            $this->datasetIndex = 0;
            $this->options = [];
            $this->selection = '';
            return;
        }

        $count = count($this->datasets);
        $normalized = ($index % $count + $count) % $count;
        $this->datasetIndex = $normalized;

        $dataset = $this->datasets[$normalized];
        $options = $dataset['options'] ?? [];
        $this->options = is_array($options) ? array_values($options) : [];

        $values = array_column($this->options, 'value');
        if ($values === []) {
            $this->selection = '';
            return;
        }

        if (! in_array($this->selection, $values, true)) {
            $this->selection = (string) $values[0];
        }
    }

    private function resolveLabel(string $value): string
    {
        foreach ($this->options as $option) {
            if (($option['value'] ?? '') === $value) {
                return (string) ($option['label'] ?? $value);
            }
        }

        return 'No service selected';
    }
}
