<?php

namespace App\Livewire\Overlay;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    public int $acknowledged = 0;

    public int $pulseCount = 0;

    public string $note = '';

    public function acknowledge(): void
    {
        $this->acknowledged++;
    }

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
        return view('livewire.overlay.simple');
    }
}
