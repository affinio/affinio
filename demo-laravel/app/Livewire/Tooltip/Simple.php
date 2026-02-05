<?php

namespace App\Livewire\Tooltip;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    public string $placement = 'top';

    public string $mode = 'hover';

    public bool $alwaysOpen = false;

    public bool $manualOpen = false;

    public function render(): View
    {
        return view('livewire.tooltip.simple');
    }

    public function updatedManualOpen(bool $value): void
    {
        // Kept for backwards compatibility with wire:model hooks.
        // Tooltip open/close now syncs from DOM state in the adapter.
    }

    public function updatedAlwaysOpen(bool $value): void
    {
        if ($value) {
            $this->manualOpen = true;
        }

        if (! $value && $this->mode === 'manual') {
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
}
