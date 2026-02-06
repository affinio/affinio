<?php

namespace App\Livewire\Treeview;

use Illuminate\View\View;
use Livewire\Component;

class ManualCase extends Component
{
    public string $treeRootId = '';

    public function mount(): void
    {
        $componentId = method_exists($this, 'getId') ? (string) $this->getId() : uniqid('treeview-manual-', true);
        $this->treeRootId = 'treeview-manual-'.$componentId;
    }

    public function selectBacklog(): void
    {
        $this->dispatch('affino-treeview:manual', id: $this->treeRootId, action: 'select', value: 'backlog');
    }

    public function focusIncidents(): void
    {
        $this->dispatch('affino-treeview:manual', id: $this->treeRootId, action: 'focus', value: 'incidents');
    }

    public function expandQuality(): void
    {
        $this->dispatch('affino-treeview:manual', id: $this->treeRootId, action: 'expand', value: 'qa');
    }

    public function collapseQuality(): void
    {
        $this->dispatch('affino-treeview:manual', id: $this->treeRootId, action: 'collapse', value: 'qa');
    }

    public function clearTreeSelection(): void
    {
        $this->dispatch('affino-treeview:manual', id: $this->treeRootId, action: 'clear');
    }

    public function render(): View
    {
        return view('livewire.treeview.manual-case');
    }
}
