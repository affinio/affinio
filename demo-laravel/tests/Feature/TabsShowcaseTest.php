<?php

namespace Tests\Feature;

use Tests\TestCase;

class TabsShowcaseTest extends TestCase
{
    public function test_tabs_page_renders_primary_demo(): void
    {
        $response = $this->get('/tabs');

        $response->assertOk();
        $response->assertSeeText('Affino tabs');
        $response->assertSeeText('Same contract as Vue');
        $response->assertSee('data-affino-tabs-root="livewire-tabs-demo"', false);
        $response->assertSeeText('Overview');
    }
}
