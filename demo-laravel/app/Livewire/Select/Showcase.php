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
            ['value' => 'region-foo', 'label' => 'Foo', 'meta' => 'A'],
            ['value' => 'region-bar', 'label' => 'Bar', 'meta' => 'B'],
            ['value' => 'region-baz', 'label' => 'Baz', 'meta' => 'C'],
            ['value' => 'region-qux', 'label' => 'Qux', 'meta' => 'D'],
        ];
        $this->region = $this->demoRegions[0]['value'];

        $this->serviceDatasets = [
            [
                'id' => 'alpha',
                'label' => 'Alpha set',
                'description' => 'Small set A',
                'options' => [
                    ['value' => 'svc-foo', 'label' => 'Foo', 'meta' => 'A'],
                    ['value' => 'svc-bar', 'label' => 'Bar', 'meta' => 'B'],
                    ['value' => 'svc-baz', 'label' => 'Baz', 'meta' => 'C'],
                ],
            ],
            [
                'id' => 'beta',
                'label' => 'Beta set',
                'description' => 'Small set B',
                'options' => [
                    ['value' => 'svc-qux', 'label' => 'Qux', 'meta' => 'D'],
                    ['value' => 'svc-zip', 'label' => 'Zip', 'meta' => 'E'],
                    ['value' => 'svc-zap', 'label' => 'Zap', 'meta' => 'F'],
                ],
            ],
            [
                'id' => 'gamma',
                'label' => 'Gamma set',
                'description' => 'Small set C',
                'options' => [
                    ['value' => 'svc-foo-2', 'label' => 'Foo 2', 'meta' => 'G'],
                    ['value' => 'svc-bar-2', 'label' => 'Bar 2', 'meta' => 'H'],
                    ['value' => 'svc-baz-2', 'label' => 'Baz 2', 'meta' => 'I'],
                ],
            ],
        ];
        $this->applyServiceDataset(0);

        $this->responseTeams = [
            ['value' => 'team-foo', 'label' => 'Foo team', 'meta' => 'A'],
            ['value' => 'team-bar', 'label' => 'Bar team', 'meta' => 'B'],
            ['value' => 'team-baz', 'label' => 'Baz team', 'meta' => 'C'],
            ['value' => 'team-qux', 'label' => 'Qux team', 'meta' => 'D'],
            ['value' => 'team-zip', 'label' => 'Zip team', 'meta' => 'E'],
        ];
        $this->teamSelection = ['team-foo', 'team-bar'];

        $this->manualTiers = [
            ['value' => 'tier-none', 'label' => 'None', 'meta' => '—'],
            ['value' => 'tier-low', 'label' => 'Low', 'meta' => 'L'],
            ['value' => 'tier-mid', 'label' => 'Mid', 'meta' => 'M'],
            ['value' => 'tier-high', 'label' => 'High', 'meta' => 'H'],
            ['value' => 'tier-max', 'label' => 'Max', 'meta' => 'X'],
        ];
        $this->manualTier = 'tier-mid';
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
        $this->teamSelection = ['team-foo', 'team-bar', 'team-qux'];
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
