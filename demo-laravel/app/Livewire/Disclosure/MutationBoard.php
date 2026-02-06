<?php

namespace App\Livewire\Disclosure;

use Illuminate\View\View;
use Livewire\Component;

class MutationBoard extends Component
{
    /**
     * @var array<int, array<string, string|int>>
     */
    public array $items = [
        ['id' => 401, 'title' => 'Release readiness', 'owner' => 'Alex', 'detail' => 'Checklist aligned with QA sign-off.'],
        ['id' => 402, 'title' => 'Capacity review', 'owner' => 'Bo', 'detail' => 'SLO thresholds and queue depth updated.'],
        ['id' => 403, 'title' => 'Incident follow-ups', 'owner' => 'Cara', 'detail' => 'Postmortem tasks assigned.'],
    ];

    protected int $nextId = 404;

    public function addItem(): void
    {
        $this->items[] = [
            'id' => $this->nextId++,
            'title' => 'New audit block',
            'owner' => 'Auto',
            'detail' => 'Auto-generated checklist item for review.',
        ];
    }

    public function removeItem(int $itemId): void
    {
        $this->items = array_values(array_filter(
            $this->items,
            fn (array $item) => ($item['id'] ?? 0) !== $itemId
        ));
    }

    public function render(): View
    {
        return view('livewire.disclosure.mutation-board');
    }
}
