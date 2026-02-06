<?php

namespace App\Livewire\Tooltip;

use Illuminate\View\View;
use Livewire\Component;

class Dock extends Component
{
    /**
     * @var array<int, array<string, string>>
     */
    public array $items = [
        [
            'id' => 'dock-analytics',
            'label' => 'Analytics',
            'meta' => 'Realtime funnels + cohorts',
        ],
        [
            'id' => 'dock-ops',
            'label' => 'Ops Console',
            'meta' => 'Incident routing + paging',
        ],
        [
            'id' => 'dock-billing',
            'label' => 'Billing',
            'meta' => 'Subscriptions + invoices',
        ],
        [
            'id' => 'dock-roles',
            'label' => 'Access',
            'meta' => 'Role & policy editor',
        ],
        [
            'id' => 'dock-runtime',
            'label' => 'Runtime',
            'meta' => 'Cluster health snapshot',
        ],
    ];

    public function render(): View
    {
        return view('livewire.tooltip.dock');
    }
}
