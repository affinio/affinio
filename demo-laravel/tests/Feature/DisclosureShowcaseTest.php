<?php

namespace Tests\Feature;

use Tests\TestCase;

class DisclosureShowcaseTest extends TestCase
{
    public function test_disclosure_page_renders_primary_demo(): void
    {
        $response = $this->get('/disclosures');

        $response->assertOk();
        $response->assertSeeText('Affino disclosure');
        $response->assertSeeText('Toggle insight stack');
        $response->assertSee('data-affino-disclosure-root="livewire-disclosure-demo"', false);
    }
}
