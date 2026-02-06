<?php

namespace App\Livewire\Combobox;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    /**
     * @var array<int, array{value: string, label: string, meta: string, owner: string}>
     */
    public array $accounts = [
        ['value' => 'starlight', 'label' => 'Starlight Analytics', 'meta' => 'Enterprise · Toronto', 'owner' => 'R. Chen'],
        ['value' => 'northwind', 'label' => 'Northwind Ops', 'meta' => 'Growth · New York', 'owner' => 'M. Ortega'],
        ['value' => 'lumina', 'label' => 'Lumina Energy', 'meta' => 'Scale · Austin', 'owner' => 'J. Patel'],
        ['value' => 'arbor', 'label' => 'Arbor Health', 'meta' => 'Growth · Seattle', 'owner' => 'S. Ito'],
        ['value' => 'monocle', 'label' => 'Monocle Finance', 'meta' => 'Enterprise · Chicago', 'owner' => 'L. Bryant'],
        ['value' => 'helios', 'label' => 'Helios Robotics', 'meta' => 'Growth · Berlin', 'owner' => 'I. Becker'],
    ];

    public string $selectedAccount = 'starlight';

    public bool $pinned = false;

    public bool $openOnPointerDown = true;

    public function clearSelection(): void
    {
        $this->selectedAccount = '';
    }

    public function selectNext(): void
    {
        $values = array_column($this->accounts, 'value');
        if ($values === []) {
            return;
        }

        $currentIndex = array_search($this->selectedAccount, $values, true);
        $nextIndex = $currentIndex === false ? 0 : ($currentIndex + 1) % count($values);
        $this->selectedAccount = $values[$nextIndex];
    }

    public function render(): View
    {
        return view('livewire.combobox.simple', [
            'selectedLabel' => $this->resolveLabel($this->selectedAccount),
            'selectedMeta' => $this->resolveMeta($this->selectedAccount),
            'selectedOwner' => $this->resolveOwner($this->selectedAccount),
        ]);
    }

    private function resolveLabel(string $value): string
    {
        foreach ($this->accounts as $account) {
            if (($account['value'] ?? '') === $value) {
                return (string) ($account['label'] ?? $value);
            }
        }

        return 'No account selected';
    }

    private function resolveMeta(string $value): string
    {
        foreach ($this->accounts as $account) {
            if (($account['value'] ?? '') === $value) {
                return (string) ($account['meta'] ?? '');
            }
        }

        return 'Selection cleared';
    }

    private function resolveOwner(string $value): string
    {
        foreach ($this->accounts as $account) {
            if (($account['value'] ?? '') === $value) {
                return (string) ($account['owner'] ?? '—');
            }
        }

        return '—';
    }
}
