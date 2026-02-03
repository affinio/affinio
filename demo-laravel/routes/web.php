<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/livewire/tooltips');
Route::redirect('/reports', '/livewire/tooltips/reports');
Route::redirect('/popovers', '/livewire/popovers');
Route::redirect('/popovers/workbench', '/livewire/popovers/workbench');

Route::prefix('livewire')->name('livewire.')->group(function () {
	Route::prefix('tooltips')->name('tooltips.')->group(function () {
		Route::view('/', 'tooltips.overview')->name('overview');
		Route::view('/reports', 'tooltips.reports')->name('reports');
	});

	Route::prefix('popovers')->name('popovers.')->group(function () {
		Route::view('/', 'popovers.overview')->name('overview');
		Route::view('/workbench', 'popovers.workbench')->name('workbench');
	});
});
