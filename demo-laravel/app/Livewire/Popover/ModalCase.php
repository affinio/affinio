<?php

namespace App\Livewire\Popover;

use Illuminate\View\View;
use Livewire\Component;

class ModalCase extends Component
{
    public int $acknowledged = 0;

    public function acknowledge(): void
    {
        $this->acknowledged++;
    }

    public function render(): View
    {
        return view('livewire.popover.modal-case');
    }
}
