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
        'description',
        'prompt',
        'expected_output',
        'syntax_hint',
        'type',
        'options',
        'question',
        'correct_answer',
        'tf_question',
        'tf_answer',
        'coding_question',
        'coding_test_cases',
        'coding_solution',
        'coding_language',
        'points',
    ];

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }
}
