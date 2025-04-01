<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_id',
        'name',
        'description',
    ];

    // Relationship: a playlist has many ratings.
    // In app/Models/Playlist.php
    public function ratings()
    {
        return $this->hasMany(UserRating::class);
    }

    public function getAverageRatingAttribute()
    {
        return round($this->ratings()->avg('rating') ?? 0, 1);
    }
}
