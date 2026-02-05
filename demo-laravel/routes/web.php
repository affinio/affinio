<?php

use App\Livewire\Page\Show as PageShow;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');
Route::get('/tabs', PageShow::class)->defaults('page', 'tabs')->name('pages.tabs');
Route::get('/disclosure', PageShow::class)->defaults('page', 'disclosure')->name('pages.disclosure');
Route::get('/listbox', PageShow::class)->defaults('page', 'listbox')->name('pages.listbox');
Route::get('/combobox', PageShow::class)->defaults('page', 'combobox')->name('pages.combobox');
Route::get('/menus', PageShow::class)->defaults('page', 'menus')->name('pages.menus');
Route::get('/popovers', PageShow::class)->defaults('page', 'popovers')->name('pages.popovers');
Route::get('/dialogs', PageShow::class)->defaults('page', 'dialogs')->name('pages.dialogs');
Route::get('/tooltips', PageShow::class)->defaults('page', 'tooltips')->name('pages.tooltips');
Route::get('/overlay-kernel', PageShow::class)->defaults('page', 'overlay-kernel')->name('pages.overlay-kernel');
