<?php

use App\Livewire\Page\Combobox as ComboboxPage;
use App\Livewire\Page\DataGrid as DataGridPage;
use App\Livewire\Page\Dialogs as DialogsPage;
use App\Livewire\Page\Disclosure as DisclosurePage;
use App\Livewire\Page\Listbox as ListboxPage;
use App\Livewire\Page\Menus as MenusPage;
use App\Livewire\Page\OverlayKernel as OverlayKernelPage;
use App\Livewire\Page\Popovers as PopoversPage;
use App\Livewire\Page\Tabs as TabsPage;
use App\Livewire\Page\Tooltips as TooltipsPage;
use App\Livewire\Page\Treeview as TreeviewPage;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');
Route::get('/treeview', TreeviewPage::class)->name('pages.treeview');
Route::get('/tabs', TabsPage::class)->name('pages.tabs');
Route::get('/disclosure', DisclosurePage::class)->name('pages.disclosure');
Route::get('/listbox', ListboxPage::class)->name('pages.listbox');
Route::get('/combobox', ComboboxPage::class)->name('pages.combobox');
Route::get('/datagrid', DataGridPage::class)->name('pages.datagrid');
Route::get('/menus', MenusPage::class)->name('pages.menus');
Route::get('/popovers', PopoversPage::class)->name('pages.popovers');
Route::get('/dialogs', DialogsPage::class)->name('pages.dialogs');
Route::get('/tooltips', TooltipsPage::class)->name('pages.tooltips');
Route::get('/overlay-kernel', OverlayKernelPage::class)->name('pages.overlay-kernel');
