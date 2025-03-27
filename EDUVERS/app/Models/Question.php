<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['question', 'correct_answer'];
    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}
