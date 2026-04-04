<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;

// Public
Route::post('/login',  [AuthController::class, 'login']);
Route::get('/ping',    fn() => ['status' => 'ok']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::get('/me',               [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Customers
    Route::apiResource('customers', CustomerController::class);
    Route::get('/customers/{id}/history', [CustomerController::class, 'history']);

    // Products
    Route::get('/product-categories', [ProductController::class, 'categories']);
    Route::apiResource('products', ProductController::class);

    // Invoices
    Route::apiResource('invoices', InvoiceController::class)->except(['update']);

    // Prescriptions
    Route::get('/prescriptions',    [PrescriptionController::class, 'index']);
    Route::post('/prescriptions',   [PrescriptionController::class, 'store']);
    Route::delete('/prescriptions/{id}', [PrescriptionController::class, 'destroy']);

    // Settings
    // Route::get('/settings',          [SettingsController::class, 'index']);
    // Route::post('/settings',         [SettingsController::class, 'update']);
    // Route::post('/settings/logo',    [SettingsController::class, 'uploadLogo']);

    // Reports
    Route::get('/reports/daily',        [ReportController::class, 'daily']);
    Route::get('/reports/monthly',      [ReportController::class, 'monthly']);
    Route::get('/reports/top-products', [ReportController::class, 'topProducts']);
    Route::get('/reports/pdf',          [ReportController::class, 'exportPdf']);
});