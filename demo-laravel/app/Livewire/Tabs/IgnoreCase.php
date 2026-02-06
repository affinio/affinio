<?php

namespace App\Livewire\Tabs;

use Illuminate\View\View;
use Livewire\Component;

class IgnoreCase extends Component
{
    public int $pulseCount = 0;

    public int $queueDepth = 3;

    public function pulse(): void
    {
        $this->pulseCount++;
        $this->queueDepth = ($this->queueDepth + 2) % 11;
    }

    public function render(): View
    {
        return view('livewire.tabs.ignore-case');
    }
}
