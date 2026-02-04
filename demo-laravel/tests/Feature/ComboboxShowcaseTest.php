<?php

namespace Tests\Feature;

use App\Livewire\Combobox\Showcase;
use Livewire\Livewire;
use Tests\TestCase;

class ComboboxShowcaseTest extends TestCase
{
    public function test_manual_escalation_property_is_available(): void
    {
        Livewire::test(Showcase::class)
            ->assertSet('manualEscalation', 'tier-2')
            ->set('manualEscalation', 'tier-0')
            ->assertSet('manualEscalation', 'tier-0');
    }
}
