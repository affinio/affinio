<?php

namespace App\Livewire\Tooltip;

use Illuminate\View\View;
use Livewire\Component;

class Resize extends Component
{
    public bool $expanded = false;

    public function toggle(): void
    {
        $this->expanded = ! $this->expanded;
    }

    public function render(): View
    {
        return view('livewire.tooltip.resize');
    }
}
