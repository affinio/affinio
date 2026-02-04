<?php
require __DIR__.'/vendor/autoload.php';
$c = new App\Livewire\Combobox\Showcase();
var_dump(property_exists($c, 'manualEscalation'));
