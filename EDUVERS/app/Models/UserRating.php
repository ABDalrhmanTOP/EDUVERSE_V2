<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRating extends Model
{
    use HasFactory;

    protected $table = 'user_ratings';

    protected $fillable = [
        'user_progress_id',
        'rating',
        'feedback',
    ];

    // Relationship: a user rating belongs to user progress
    public function userProgress()
    {
        return $this->belongsTo(UserProgress::class, 'user_progress_id');
    }
}
