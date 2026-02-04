<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/livewire/tooltips');
Route::redirect('/reports', '/livewire/tooltips/reports');
Route::redirect('/popovers', '/livewire/popovers');
Route::redirect('/popovers/workbench', '/livewire/popovers/workbench');
Route::redirect('/selects', '/livewire/selects');
Route::redirect('/comboboxes', '/livewire/comboboxes');
Route::redirect('/dialogs', '/livewire/dialogs');
Route::redirect('/menus', '/livewire/menus');

Route::prefix('livewire')->name('livewire.')->group(function () {
	Route::prefix('dialogs')->name('dialogs.')->group(function () {
		Route::view('/', 'dialogs.overview')->name('overview');
	});

	Route::prefix('tooltips')->name('tooltips.')->group(function () {
		Route::view('/', 'tooltips.overview')->name('overview');
		Route::view('/reports', 'tooltips.reports')->name('reports');
	});

	Route::prefix('popovers')->name('popovers.')->group(function () {
		Route::view('/', 'popovers.overview')->name('overview');
		Route::view('/workbench', 'popovers.workbench')->name('workbench');
	});

	Route::prefix('selects')->name('selects.')->group(function () {
		Route::view('/', 'selects.overview')->name('overview');
	});

	Route::prefix('comboboxes')->name('comboboxes.')->group(function () {
		Route::view('/', 'comboboxes.overview')->name('overview');
	});

	Route::prefix('menus')->name('menus.')->group(function () {
		Route::view('/', 'menus.overview')->name('overview');
	});
});
