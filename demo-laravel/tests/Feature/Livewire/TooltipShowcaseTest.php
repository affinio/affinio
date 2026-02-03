<?php

namespace Tests\Feature\Livewire;

use App\Livewire\Tooltip\Showcase;
use Livewire\Livewire;
use Tests\TestCase;

class TooltipShowcaseTest extends TestCase
{
    public function test_email_field_rehydrates_livewire_state(): void
    {
        Livewire::test(Showcase::class)
            ->set('email', 'alex@affino.dev')
            ->assertSee('alex@affino.dev');
    }
}
