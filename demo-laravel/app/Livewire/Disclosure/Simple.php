<?php

namespace App\Livewire\Disclosure;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    /**
     * @var array<int, array<string, string>>
     */
    public array $panels = [
        [
            'id' => 'overview',
            'title' => 'Operational overview',
            'meta' => 'Updated 2 min ago',
            'lead' => 'Livewire keeps mission-critical context steady while teams drill down.',
            'detail' => 'Ownership, escalation paths, and runbooks live here so everyone has the same snapshot.',
        ],
        [
            'id' => 'playbooks',
            'title' => 'Playbook coverage',
            'meta' => '6 active playbooks',
            'lead' => 'Disclosures keep dense material readable without losing scanability.',
            'detail' => 'Each playbook entry is versioned and attached to recent incidents.',
        ],
        [
            'id' => 'handoff',
            'title' => 'Handoff checklist',
            'meta' => 'Shift ends in 38 min',
            'lead' => 'Surface the critical context, then collapse back down to the essentials.',
            'detail' => 'Pending approvals, open tickets, and active experiments are summarized here.',
        ],
    ];

    public function render(): View
    {
        return view('livewire.disclosure.simple');
    }
}
