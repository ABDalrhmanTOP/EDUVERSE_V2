<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'video_id',
        'last_timestamp',
        'completed_tasks',
    ];

    protected $casts = [
        'completed_tasks' => 'array',
    ];
}
