<?php

namespace App\Livewire\Tabs;

use Illuminate\View\View;
use Livewire\Component;

class ParallelCase extends Component
{
    /**
     * @var array<int, array{key: string, title: string, subtitle: string, tabs: array<int, array{value: string, label: string, summary: string}>}>
     */
    public array $boards = [
        [
            'key' => 'ops',
            'title' => 'Ops Board',
            'subtitle' => 'Incident response lanes',
            'tabs' => [
                [
                    'value' => 'queue',
                    'label' => 'Queue',
                    'summary' => 'Incoming tickets and owner assignments for on-call rotation.',
                ],
                [
                    'value' => 'sla',
                    'label' => 'SLA',
                    'summary' => 'Breach risk, response clocks, and pager acknowledgements.',
                ],
                [
                    'value' => 'handoff',
                    'label' => 'Handoff',
                    'summary' => 'Follow-the-sun checklist before region handover.',
                ],
            ],
        ],
        [
            'key' => 'ml',
            'title' => 'ML Board',
            'subtitle' => 'Model reliability lanes',
            'tabs' => [
                [
                    'value' => 'signals',
                    'label' => 'Signals',
                    'summary' => 'Drift monitors, confidence windows, and recent model alerts.',
                ],
                [
                    'value' => 'cost',
                    'label' => 'Cost',
                    'summary' => 'Inference spend trajectory with budget guardrail checkpoints.',
                ],
                [
                    'value' => 'quality',
                    'label' => 'Quality',
                    'summary' => 'Evaluation matrix and release gate readiness per segment.',
                ],
            ],
        ],
    ];

    /**
     * @var array<string, string>
     */
    public array $activeTabs = [
        'ops' => 'queue',
        'ml' => 'signals',
    ];

    public function selectBoardTab(string $boardKey, string $value): void
    {
        foreach ($this->tabsForBoard($boardKey) as $tab) {
            if (($tab['value'] ?? '') === $value) {
                $this->activeTabs[$boardKey] = $value;
                return;
            }
        }
    }

    public function render(): View
    {
        return view('livewire.tabs.parallel-case');
    }

    /**
     * @return array<int, array{value: string, label: string, summary: string}>
     */
    private function tabsForBoard(string $boardKey): array
    {
        foreach ($this->boards as $board) {
            if (($board['key'] ?? '') === $boardKey) {
                $tabs = $board['tabs'] ?? [];
                return is_array($tabs) ? $tabs : [];
            }
        }

        return [];
    }
}
