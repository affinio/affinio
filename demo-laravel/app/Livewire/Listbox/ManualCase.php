<?php

namespace App\Livewire\Listbox;

use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class ManualCase extends Component
{
    /**
     * @var array<int, array{value: string, label: string, meta: string}>
     */
    public array $tiers = [
        ['value' => 'tier-3', 'label' => 'Tier 3 - Backlog', 'meta' => 'Async review queue'],
        ['value' => 'tier-2', 'label' => 'Tier 2 - Regional', 'meta' => 'Regional duty lead'],
        ['value' => 'tier-1', 'label' => 'Tier 1 - Sustained', 'meta' => 'Incident command'],
        ['value' => 'tier-0', 'label' => 'Tier 0 - Critical', 'meta' => 'Executive paging lane'],
    ];

    public string $selection = 'tier-2';

    public string $listboxId = '';

    public int $dispatchCount = 0;

    public string $lastAction = 'idle';

    public function mount(): void
    {
        $componentId = method_exists($this, 'getId')
            ? (string) $this->getId()
            : Str::lower(Str::random(8));

        $this->listboxId = 'manual-listbox-'.$componentId;
    }

    public function openFromServer(): void
    {
        $this->dispatch('affino-listbox:manual', id: $this->listboxId, action: 'open');
        $this->dispatchCount++;
        $this->lastAction = 'open';
    }

    public function closeFromServer(): void
    {
        $this->dispatch('affino-listbox:manual', id: $this->listboxId, action: 'close');
        $this->dispatchCount++;
        $this->lastAction = 'close';
    }

    public function toggleFromServer(): void
    {
        $this->dispatch('affino-listbox:manual', id: $this->listboxId, action: 'toggle');
        $this->dispatchCount++;
        $this->lastAction = 'toggle';
    }

    public function selectFromServer(string $value): void
    {
        if (! $this->hasTier($value)) {
            return;
        }

        $this->selection = $value;
        $this->dispatch('affino-listbox:manual', id: $this->listboxId, action: 'select', value: $value);
        $this->dispatchCount++;
        $this->lastAction = "select:{$value}";
    }

    public function clearFromServer(): void
    {
        $this->selection = '';
        $this->dispatch('affino-listbox:manual', id: $this->listboxId, action: 'close');
        $this->dispatchCount++;
        $this->lastAction = 'clear';
    }

    public function render(): View
    {
        return view('livewire.listbox.manual-case', [
            'selectionLabel' => $this->resolveLabel($this->selection),
        ]);
    }

    private function hasTier(string $value): bool
    {
        foreach ($this->tiers as $tier) {
            if (($tier['value'] ?? '') === $value) {
                return true;
            }
        }

        return false;
    }

    private function resolveLabel(string $value): string
    {
        foreach ($this->tiers as $tier) {
            if (($tier['value'] ?? '') === $value) {
                return (string) ($tier['label'] ?? $value);
            }
        }

        return 'No tier selected';
    }
}
