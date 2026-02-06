<?php

namespace App\Livewire\Popover;

use Illuminate\View\View;
use Livewire\Component;

class Nested extends Component
{
    public int $confirmations = 0;

    public function confirm(): void
    {
        $this->confirmations++;
    }

    public function render(): View
    {
        return view('livewire.popover.nested');
    }
}
