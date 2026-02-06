<?php

namespace App\Livewire\Popover;

use Illuminate\View\View;
use Livewire\Component;

class MutationBoard extends Component
{
    /**
     * @var array<int, array<string, string|int>>
     */
    public array $items = [
        ['id' => 101, 'title' => 'Auth sync', 'owner' => 'Iris', 'eta' => '08:30 UTC'],
        ['id' => 102, 'title' => 'Replay queue', 'owner' => 'Niles', 'eta' => '08:45 UTC'],
        ['id' => 103, 'title' => 'ML rollout', 'owner' => 'Kay', 'eta' => '09:10 UTC'],
    ];

    protected int $nextId = 104;

    public function addItem(): void
    {
        $this->items[] = [
            'id' => $this->nextId++,
            'title' => 'New incident lane',
            'owner' => 'Auto',
            'eta' => 'TBD',
        ];
    }

    public function removeItem(int $itemId): void
    {
        $this->items = array_values(array_filter($this->items, fn (array $item) => ($item['id'] ?? 0) !== $itemId));
    }

    public function render(): View
    {
        return view('livewire.popover.mutation-board');
    }
}
