<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'playlist_id',
        'video_id',
        'timestamp',
        'title',
        'prompt',
        'expected_output',
        'syntax_hint',
        'type',
        'options',
    ];
}
