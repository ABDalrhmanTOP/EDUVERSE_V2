<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinalProjectSubmission extends Model
{
    use HasFactory;

    protected $table = 'final_project_submissions';

    protected $fillable = [
        'user_progress_id',
        'code_solution',
        'mcq_answers',
        'tf_answers',
        'coding_marks',
        'mcq_marks',
        'tf_marks',
        'final_mark',
        'grade',
        'rating',
        'feedback',
    ];

    protected $casts = [
        'mcq_answers' => 'array',
        'tf_answers'  => 'array',
    ];

    // Optionally, define a relationship to user progress:
    public function progress()
    {
        return $this->belongsTo(UserProgress::class, 'user_progress_id');
    }
}
