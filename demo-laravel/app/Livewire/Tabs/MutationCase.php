<?php

namespace App\Livewire\Tabs;

use Illuminate\View\View;
use Livewire\Component;

class MutationCase extends Component
{
    /**
     * @var array<int, array{value: string, label: string, metric: string, summary: string}>
     */
    public array $tabs = [
        [
            'value' => 'cluster-1',
            'label' => 'Cluster 1',
            'metric' => 'P95 41ms',
            'summary' => 'Stable canary traffic with minor retries on one worker pool.',
        ],
        [
            'value' => 'cluster-2',
            'label' => 'Cluster 2',
            'metric' => 'P95 63ms',
            'summary' => 'Elevated latency while background compaction is in progress.',
        ],
        [
            'value' => 'cluster-3',
            'label' => 'Cluster 3',
            'metric' => 'P95 52ms',
            'summary' => 'Steady throughput and zero incident alerts during the last hour.',
        ],
    ];

    public string $activeTab = 'cluster-1';

    public int $nextCluster = 4;

    public function addCluster(): void
    {
        $clusterIndex = $this->nextCluster++;
        $value = "cluster-{$clusterIndex}";

        $this->tabs[] = [
            'value' => $value,
            'label' => 'Cluster '.$clusterIndex,
            'metric' => 'P95 '.(40 + ($clusterIndex * 3)).'ms',
            'summary' => 'Livewire inserted this lane while preserving the tabs contract.',
        ];

        $this->activeTab = $value;
    }

    public function removeActiveCluster(): void
    {
        if ($this->activeTab === '') {
            return;
        }

        $this->tabs = array_values(array_filter(
            $this->tabs,
            fn (array $tab): bool => ($tab['value'] ?? '') !== $this->activeTab
        ));

        $this->activeTab = $this->tabs[0]['value'] ?? '';
    }

    public function selectTab(string $value): void
    {
        if (! $this->hasTab($value)) {
            return;
        }

        $this->activeTab = $value;
    }

    public function render(): View
    {
        return view('livewire.tabs.mutation-case');
    }

    private function hasTab(string $value): bool
    {
        foreach ($this->tabs as $tab) {
            if (($tab['value'] ?? '') === $value) {
                return true;
            }
        }

        return false;
    }
}
