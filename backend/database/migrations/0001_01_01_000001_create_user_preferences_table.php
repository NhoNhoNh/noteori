<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('theme', ['light', 'dark'])->default('light');
            $table->enum('font_size', ['small', 'medium', 'large'])->default('medium');
            $table->string('note_color', 20)->default('default');
            $table->enum('layout_mode', ['grid', 'list'])->default('grid');
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
