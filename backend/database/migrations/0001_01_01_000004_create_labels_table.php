<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 7)->nullable(); // hex color
            $table->timestamps();

            $table->index('user_id');
            $table->unique(['user_id', 'name']);
        });

        Schema::create('note_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained()->cascadeOnDelete();
            $table->foreignId('label_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['note_id', 'label_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_labels');
        Schema::dropIfExists('labels');
    }
};
