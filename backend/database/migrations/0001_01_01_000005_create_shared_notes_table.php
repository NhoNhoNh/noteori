<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('shared_with_id')->constrained('users')->cascadeOnDelete();
            $table->string('email'); // recipient email for display
            $table->enum('permission', ['read', 'edit'])->default('read');
            $table->timestamps();

            $table->unique(['note_id', 'shared_with_id']);
            $table->index('shared_with_id');
            $table->index('owner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_notes');
    }
};
