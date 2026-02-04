<?php

namespace Tests\Feature\Livewire;

use App\Livewire\Dialog\Showcase;
use Livewire\Livewire;
use Tests\TestCase;

class DialogShowcaseTest extends TestCase
{
    public function test_timeline_entries_keep_unique_keys_when_logging_events(): void
    {
        $component = Livewire::test(Showcase::class);

        $component->call('logEvent', 'compose');
        $component->call('logEvent', 'dispatch');

        $timeline = $component->get('timeline');
        $ids = array_map(static fn (array $entry): int => $entry['id'], $timeline);

        $this->assertSameSize($ids, array_unique($ids));
    }

    public function test_log_event_updates_last_event_payload(): void
    {
        $component = Livewire::test(Showcase::class);

        $this->assertNull($component->get('lastEvent'));

        $component->call('logEvent', 'sync');

        $lastEvent = $component->get('lastEvent');
        $this->assertSame('Mirrors synced', $lastEvent['label']);

        $timeline = $component->get('timeline');
        $this->assertSame('Mirrors synced', $timeline[0]['label']);
    }
}
