<?php

namespace App\Livewire\Menu;

use Illuminate\View\View;
use Livewire\Component;

class MutationBoard extends Component
{
    /**
     * @var array<int, array<string, string|int>>
     */
    public array $items = [
        ['id' => 701, 'label' => 'Run diagnostics', 'meta' => 'System'],
        ['id' => 702, 'label' => 'Share summary', 'meta' => 'Collaboration'],
        ['id' => 703, 'label' => 'Archive snapshot', 'meta' => 'Records'],
    ];

    protected int $nextId = 704;

    public function addItem(): void
    {
        $this->items[] = [
            'id' => $this->nextId++,
            'label' => 'New action',
            'meta' => 'Generated',
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
        return view('livewire.menu.mutation-board');
    }
}
