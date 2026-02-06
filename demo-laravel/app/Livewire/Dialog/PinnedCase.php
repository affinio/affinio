<?php

namespace App\Livewire\Dialog;

use Illuminate\View\View;
use Livewire\Component;

class PinnedCase extends Component
{
    public bool $pinned = true;

    public int $pulseCount = 0;

    public string $note = '';

    public function pulse(): void
    {
        $this->pulseCount++;
    }

    public function clearNote(): void
    {
        $this->note = '';
    }

    public function render(): View
    {
        return view('livewire.dialog.pinned-case');
    }
}
