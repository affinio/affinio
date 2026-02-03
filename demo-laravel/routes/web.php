<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('tooltips.overview');
Route::view('/reports', 'reports')->name('tooltips.reports');
