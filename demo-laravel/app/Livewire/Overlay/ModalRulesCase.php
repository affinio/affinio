<?php

namespace App\Livewire\Overlay;

use Illuminate\View\View;
use Livewire\Component;

class ModalRulesCase extends Component
{
    public int $popoverApprovals = 0;

    public int $dialogSaves = 0;

    public string $draftMessage = '';

    public function approvePopover(): void
    {
        $this->popoverApprovals++;
    }

    public function saveDialog(): void
    {
        $this->dialogSaves++;
    }

    public function clearDialogDraft(): void
    {
        $this->draftMessage = '';
    }

    public function render(): View
    {
        return view('livewire.overlay.modal-rules-case');
    }
}
