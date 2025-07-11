<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Result extends Model
{

    protected $fillable = ['user_id', 'level_id', 'test_id', 'score', 'total_questions', 'percentage', 'test_type'];

    public function student()
    {
        return $this->belongsTo(User::class);
    }

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function test()
    {
        return $this->belongsTo(PlacementTest::class, 'test_id');
    }
}
