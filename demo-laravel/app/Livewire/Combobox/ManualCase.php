<?php

namespace App\Livewire\Combobox;

use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class ManualCase extends Component
{
    /**
     * @var array<int, array{value: string, label: string, meta: string}>
     */
    public array $escalations = [
        ['value' => 'tier-3', 'label' => 'Tier 3 · Backlog', 'meta' => 'Async review queue'],
        ['value' => 'tier-2', 'label' => 'Tier 2 · Regional', 'meta' => 'Regional duty lead'],
        ['value' => 'tier-1', 'label' => 'Tier 1 · Sustained', 'meta' => 'Incident command'],
        ['value' => 'tier-0', 'label' => 'Tier 0 · Critical', 'meta' => 'Executive paging lane'],
    ];

    public string $selection = 'tier-2';

    public string $comboboxId = '';

    public int $dispatchCount = 0;

    public string $lastAction = 'idle';

    public function mount(): void
    {
        $componentId = method_exists($this, 'getId')
            ? (string) $this->getId()
            : Str::lower(Str::random(8));

        $this->comboboxId = 'manual-combobox-'.$componentId;
    }

    public function openFromServer(): void
    {
        $this->dispatch('affino-combobox:manual', id: $this->comboboxId, action: 'open');
        $this->dispatchCount++;
        $this->lastAction = 'open';
    }

    public function closeFromServer(): void
    {
        $this->dispatch('affino-combobox:manual', id: $this->comboboxId, action: 'close');
        $this->dispatchCount++;
        $this->lastAction = 'close';
    }

    public function selectFromServer(string $value): void
    {
        if (! $this->hasEscalation($value)) {
            return;
        }

        $this->selection = $value;
        $this->dispatch('affino-combobox:manual', id: $this->comboboxId, action: 'select', value: $value);
        $this->dispatchCount++;
        $this->lastAction = "select:{$value}";
    }

    public function clearFromServer(): void
    {
        $this->selection = '';
        $this->dispatch('affino-combobox:manual', id: $this->comboboxId, action: 'clear');
        $this->dispatchCount++;
        $this->lastAction = 'clear';
    }

    public function render(): View
    {
        return view('livewire.combobox.manual-case', [
            'selectionLabel' => $this->resolveLabel($this->selection),
        ]);
    }

    private function hasEscalation(string $value): bool
    {
        foreach ($this->escalations as $escalation) {
            if (($escalation['value'] ?? '') === $value) {
                return true;
            }
        }

        return false;
    }

    private function resolveLabel(string $value): string
    {
        foreach ($this->escalations as $escalation) {
            if (($escalation['value'] ?? '') === $value) {
                return (string) ($escalation['label'] ?? $value);
            }
        }

        return 'No escalation selected';
    }
}
