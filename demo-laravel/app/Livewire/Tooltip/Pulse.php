<?php

namespace App\Livewire\Tooltip;

use Illuminate\View\View;
use Livewire\Component;

class Pulse extends Component
{
    public int $count = 0;

    public bool $running = false;

    public function toggleRunning(): void
    {
        $this->running = ! $this->running;
    }

    public function resetCount(): void
    {
        $this->count = 0;
    }

    public function tick(): void
    {
        if ($this->running) {
            $this->count++;
        }
    }

    public function render(): View
    {
        return view('livewire.tooltip.pulse');
    }
}
