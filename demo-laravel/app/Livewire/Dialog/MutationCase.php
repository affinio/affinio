<?php

namespace App\Livewire\Dialog;

use Illuminate\View\View;
use Livewire\Component;

class MutationCase extends Component
{
    /**
     * @var array<int, array{id: int, label: string, owner: string}>
     */
    public array $rows = [
        ['id' => 1, 'label' => 'Routing control plane', 'owner' => 'Network desk'],
        ['id' => 2, 'label' => 'Notification fanout', 'owner' => 'Messaging desk'],
        ['id' => 3, 'label' => 'Usage export pipeline', 'owner' => 'Analytics desk'],
    ];

    public int $nextId = 4;

    /**
     * @var array<int, string>
     */
    public array $drafts = [
        1 => '',
        2 => '',
        3 => '',
    ];

    public function addRow(): void
    {
        $id = $this->nextId++;

        $this->rows[] = [
            'id' => $id,
            'label' => 'Ad hoc lane '.$id,
            'owner' => 'Ops rotation',
        ];

        $this->drafts[$id] = '';
    }

    public function removeRow(int $id): void
    {
        $this->rows = array_values(array_filter(
            $this->rows,
            fn (array $row): bool => (int) ($row['id'] ?? 0) !== $id
        ));

        unset($this->drafts[$id]);
    }

    public function clearDraft(int $id): void
    {
        $this->drafts[$id] = '';
    }

    public function render(): View
    {
        return view('livewire.dialog.mutation-case');
    }
}
