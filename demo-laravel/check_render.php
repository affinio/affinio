<?php
require __DIR__.'/vendor/autoload.php';
$component = new \App\Livewire\Combobox\Showcase();
$component->mount();
var_dump(property_exists($component, 'manualEscalation'));
var_dump($component->manualEscalation);
$component->render();
echo "render ok\n";
