<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NoteImage extends Model
{
    protected $fillable = ['note_id', 'filename', 'path', 'mime_type', 'size'];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function getUrlAttribute()
    {
        return asset('storage/' . $this->path);
    }
}
