<?php

namespace App\Livewire\Dialog;

use Illuminate\View\View;
use Illuminate\Validation\Rule;
use Livewire\Component;

class Simple extends Component
{
    public string $title = 'API degradation in us-east';

    public string $owner = 'Ops lead';

    public string $severity = 'high';

    public int $saved = 0;

    public bool $modal = true;

    public bool $closeOnBackdrop = true;

    public bool $closeOnEscape = true;

    public bool $lockScroll = true;

    public function saveDraft(): void
    {
        $this->validate([
            'title' => ['required', 'min:3'],
            'owner' => ['required', 'min:2'],
            'severity' => ['required', Rule::in(['critical', 'high', 'medium', 'low'])],
        ]);
        $this->saved++;
        $this->dispatch('affino-dialog:manual', id: "dialogs-hero-{$this->getId()}", action: 'close', reason: 'programmatic');
    }

    public function resetDraft(): void
    {
        $this->title = '';
        $this->owner = '';
        $this->severity = 'medium';
        $this->resetErrorBag();
    }

    public function render(): View
    {
        return view('livewire.dialog.simple');
    }
}
