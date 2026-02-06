<?php

namespace App\Livewire\Tabs;

use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class ManualCase extends Component
{
    /**
     * @var array<int, array{value: string, label: string, summary: string}>
     */
    public array $tabs = [
        [
            'value' => 'profile',
            'label' => 'Profile',
            'summary' => 'Identity data and ownership details for the selected customer account.',
        ],
        [
            'value' => 'security',
            'label' => 'Security',
            'summary' => 'Session policies, MFA posture, and active trust boundary exceptions.',
        ],
        [
            'value' => 'activity',
            'label' => 'Activity',
            'summary' => 'Recent timeline events, operator interventions, and escalation history.',
        ],
    ];

    public string $activeTab = 'profile';

    public int $dispatchCount = 0;

    public string $lastAction = 'idle';

    public string $tabsRootId = '';

    public function mount(): void
    {
        $componentId = method_exists($this, 'getId')
            ? (string) $this->getId()
            : Str::lower(Str::random(8));

        $this->tabsRootId = 'tabs-manual-'.$componentId;
    }

    public function selectFromServer(string $value): void
    {
        if (! $this->hasTab($value)) {
            return;
        }

        $this->activeTab = $value;
        $this->dispatch('affino-tabs:manual', id: $this->tabsRootId, action: 'select', value: $value);
        $this->dispatchCount++;
        $this->lastAction = "select:{$value}";
    }

    public function clearFromServer(): void
    {
        $this->activeTab = '';
        $this->dispatch('affino-tabs:manual', id: $this->tabsRootId, action: 'clear');
        $this->dispatchCount++;
        $this->lastAction = 'clear';
    }

    public function render(): View
    {
        return view('livewire.tabs.manual-case');
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
