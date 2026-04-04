<?php
// MIGRATION 1: create_customers_table.php
// File: database/migrations/2024_01_02_000001_create_customers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('phone', 15);
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->date('dob')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('customers'); }
};
