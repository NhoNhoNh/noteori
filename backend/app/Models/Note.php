<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'content', 'is_pinned', 'pinned_at',
        'has_password', 'note_password',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'has_password' => 'boolean',
        'pinned_at' => 'datetime',
    ];

    protected $hidden = ['note_password'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(NoteImage::class);
    }

    public function labels()
    {
        return $this->belongsToMany(Label::class, 'note_labels')->withTimestamps();
    }

    public function shares()
    {
        return $this->hasMany(SharedNote::class);
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->whereFullText(['title', 'content'], $search);
        }
        return $query;
    }

    public function scopeWithLabel($query, $labelId)
    {
        if ($labelId) {
            return $query->whereHas('labels', fn($q) => $q->where('labels.id', $labelId));
        }
        return $query;
    }

    public function scopeOrdered($query)
    {
        return $query->orderByDesc('is_pinned')
                     ->orderByDesc('pinned_at')
                     ->orderByDesc('updated_at');
    }

    public function getIsSharedAttribute()
    {
        return $this->shares()->exists();
    }

    public function getFirstImageAttribute()
    {
        $image = $this->images()->first();
        return $image ? asset('storage/' . $image->path) : null;
    }

    public function getImagesCountAttribute()
    {
        return $this->images()->count();
    }
}
