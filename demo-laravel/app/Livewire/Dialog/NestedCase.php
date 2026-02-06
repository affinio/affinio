<?php

namespace App\Livewire\Dialog;

use Illuminate\View\View;
use Livewire\Component;

class NestedCase extends Component
{
    public int $parentApprovals = 0;

    public int $childApprovals = 0;

    public function approveParent(): void
    {
        $this->parentApprovals++;
    }

    public function approveChild(): void
    {
        $this->childApprovals++;
    }

    public function render(): View
    {
        return view('livewire.dialog.nested-case');
    }
}
