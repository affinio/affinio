<?php

namespace App\Livewire\Tabs;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    /**
     * @var array<int, array{value: string, label: string, metric: string, summary: string, note: string}>
     */
    public array $tabs = [
        [
            'value' => 'overview',
            'label' => 'Overview',
            'metric' => '14 tracks live',
            'summary' => 'High-signal updates for standups, release checks, and async planning.',
            'note' => 'Connected to cross-team status rollups.',
        ],
        [
            'value' => 'journeys',
            'label' => 'Journeys',
            'metric' => '6 guided flows',
            'summary' => 'Product walkthroughs combining overlays, focus strategy, and stable routing.',
            'note' => 'Primary source for onboarding and operator playbooks.',
        ],
        [
            'value' => 'signals',
            'label' => 'Signals',
            'metric' => '24 watchers',
            'summary' => 'Telemetry lanes that surface live deltas from infrastructure and model services.',
            'note' => 'Supports fast triage during incidents.',
        ],
    ];

    public string $activeTab = 'overview';

    public function updatedActiveTab(string $value): void
    {
        if ($value === '' || $this->hasTab($value)) {
            return;
        }

        $this->activeTab = 'overview';
    }

    public function selectTab(string $value): void
    {
        if ($this->hasTab($value)) {
            $this->activeTab = $value;
        }
    }

    public function clearSelection(): void
    {
        $this->activeTab = '';
    }

    public function resetSelection(): void
    {
        $this->activeTab = 'overview';
    }

    public function render(): View
    {
        return view('livewire.tabs.simple', [
            'activeTabData' => $this->resolveActiveTab(),
        ]);
    }

    /**
     * @return array{value: string, label: string, metric: string, summary: string, note: string}|null
     */
    private function resolveActiveTab(): ?array
    {
        foreach ($this->tabs as $tab) {
            if (($tab['value'] ?? '') === $this->activeTab) {
                return $tab;
            }
        }

        return null;
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
