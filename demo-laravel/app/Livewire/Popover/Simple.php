<?php

namespace App\Livewire\Popover;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    public string $placement = 'bottom';

    public string $align = 'center';

    public string $mode = 'auto';

    public bool $alwaysOpen = false;

    public bool $manualOpen = false;

    public string $draftOwner = 'Ops Lead';

    public string $draftPriority = 'High';

    public string $appliedOwner = 'Ops Lead';

    public string $appliedPriority = 'High';

    public function render(): View
    {
        return view('livewire.popover.simple');
    }

    public function updatedAlwaysOpen(bool $value): void
    {
        if ($value) {
            $this->manualOpen = true;
            return;
        }

        if ($this->mode === 'manual') {
            $this->manualOpen = false;
        }
    }

    public function updatedMode(string $value): void
    {
        if ($value !== 'manual') {
            $this->manualOpen = false;
        }
    }

    public function toggleManual(): void
    {
        if ($this->mode !== 'manual') {
            return;
        }

        $this->manualOpen = ! $this->manualOpen;
    }

    public function applyDraft(): void
    {
        $this->appliedOwner = trim($this->draftOwner) !== '' ? trim($this->draftOwner) : 'Unassigned';
        $this->appliedPriority = $this->normalizePriority($this->draftPriority);
    }

    public function resetDraft(): void
    {
        $this->draftOwner = $this->appliedOwner;
        $this->draftPriority = $this->appliedPriority;
    }

    private function normalizePriority(string $priority): string
    {
        return match (strtolower($priority)) {
            'high' => 'High',
            'medium' => 'Medium',
            default => 'Low',
        };
    }
}
