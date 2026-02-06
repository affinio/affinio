<?php

namespace App\Livewire\Overlay;

use Illuminate\View\View;
use Livewire\Component;

class PriorityCase extends Component
{
    public int $pulses = 0;

    public function pulse(): void
    {
        $this->pulses++;
    }

    public function render(): View
    {
        return view('livewire.overlay.priority-case');
    }
}
