<?php

namespace App\Livewire\Combobox;

use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class StickyCase extends Component
{
    /**
     * @var array<int, array{value: string, label: string, meta: string}>
     */
    public array $segments = [
        ['value' => 'vip', 'label' => 'VIP revenue', 'meta' => 'MRR above 50k'],
        ['value' => 'adoption', 'label' => 'Adoption lag', 'meta' => 'No key action in 14 days'],
        ['value' => 'champions', 'label' => 'Product champions', 'meta' => 'NPS 9 and above'],
        ['value' => 'markets', 'label' => 'New markets', 'meta' => 'Launched in last 90 days'],
        ['value' => 'expansion', 'label' => 'Expansion ready', 'meta' => 'More than 5 idle seats'],
    ];

    /**
     * @var array<int, string>
     */
    public array $selection = ['vip', 'champions'];

    public string $comboboxId = '';

    public function mount(): void
    {
        $componentId = method_exists($this, 'getId')
            ? (string) $this->getId()
            : Str::lower(Str::random(8));

        $this->comboboxId = 'sticky-combobox-'.$componentId;
    }

    public function applyGrowthPreset(): void
    {
        $this->selection = ['adoption', 'expansion', 'markets'];
    }

    public function applyExecutivePreset(): void
    {
        $this->selection = ['vip', 'champions'];
    }

    public function clearSelection(): void
    {
        $this->selection = [];
    }

    public function render(): View
    {
        return view('livewire.combobox.sticky-case', [
            'selectedLabels' => $this->resolveSelectedLabels(),
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function resolveSelectedLabels(): array
    {
        $labels = [];

        foreach ($this->segments as $segment) {
            $value = (string) ($segment['value'] ?? '');
            if (! in_array($value, $this->selection, true)) {
                continue;
            }

            $labels[] = (string) ($segment['label'] ?? $value);
        }

        return $labels;
    }
}
