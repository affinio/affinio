<?php

namespace App\Livewire\Overlay;

use Illuminate\View\View;
use Livewire\Component;

class OwnerCascadeCase extends Component
{
    public int $parentCloses = 0;

    public int $childConfirms = 0;

    public function recordParentClose(): void
    {
        $this->parentCloses++;
    }

    public function confirmChild(): void
    {
        $this->childConfirms++;
    }

    public function render(): View
    {
        return view('livewire.overlay.owner-cascade-case');
    }
}
