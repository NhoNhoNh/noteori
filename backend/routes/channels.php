<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('note.{noteId}', function ($user, $noteId) {
    $note = \App\Models\Note::find($noteId);
    if (!$note) return false;

    // Owner can always access
    if ($note->user_id === $user->id) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    // Check if shared with edit permission
    $shared = $note->shares()
        ->where('shared_with_id', $user->id)
        ->where('permission', 'edit')
        ->exists();

    if ($shared) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    return false;
});
