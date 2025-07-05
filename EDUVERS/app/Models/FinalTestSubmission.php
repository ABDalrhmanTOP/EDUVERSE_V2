<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FinalTestSubmission extends Model
{
    use HasFactory;

    protected $table = 'final_test_submissions';

    protected $fillable = [
        'user_progress_id',
        'final_test_id',
        'mcq_answers',
        'tf_answers',
        'code_solutions',
        'coding_marks',
        'mcq_marks',
        'tf_marks',
        'final_mark',
        'grade',
        'rating',
        'feedback',
    ];

    protected $casts = [
        'mcq_answers'    => 'array',
        'tf_answers'     => 'array',
        'code_solutions' => 'array',
        'coding_marks'   => 'float',
        'mcq_marks'      => 'float',
        'tf_marks'       => 'float',
        'final_mark'     => 'float',
        'rating'         => 'integer',
    ];

    // Relationships
    public function userProgress()
    {
        return $this->belongsTo(UserProgress::class);
    }

    public function finalTest()
    {
        return $this->belongsTo(FinalTest::class);
    }
}
