<?php

namespace App\Livewire\Combobox;

use Illuminate\View\View;
use Livewire\Component;

class MultipleCase extends Component
{
    /**
     * @var array<int, array{value: string, label: string, meta: string}>
     */
    public array $teams = [
        ['value' => 'ops-emea', 'label' => 'EMEA responders', 'meta' => 'Madrid · remote'],
        ['value' => 'ops-usw', 'label' => 'US West surge', 'meta' => 'Seattle · hybrid'],
        ['value' => 'ops-use', 'label' => 'US East desk', 'meta' => 'Atlanta · onsite'],
        ['value' => 'ops-apac', 'label' => 'APAC follow-the-sun', 'meta' => 'Singapore · remote'],
        ['value' => 'ops-latam', 'label' => 'LatAm standby', 'meta' => 'Bogota · hybrid'],
    ];

    /**
     * @var array<int, string>
     */
    public array $selection = ['ops-emea', 'ops-use'];

    public function seedFollowSun(): void
    {
        $this->selection = ['ops-emea', 'ops-apac', 'ops-usw'];
    }

    public function clearSelection(): void
    {
        $this->selection = [];
    }

    public function render(): View
    {
        return view('livewire.combobox.multiple-case', [
            'selectedLabels' => $this->resolveSelectedLabels(),
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function resolveSelectedLabels(): array
    {
        $labels = [];

        foreach ($this->teams as $team) {
            $value = (string) ($team['value'] ?? '');
            if (! in_array($value, $this->selection, true)) {
                continue;
            }

            $labels[] = (string) ($team['label'] ?? $value);
        }

        return $labels;
    }
}
