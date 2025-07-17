<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlacementQuestion extends Model
{
    use HasFactory;
    protected $table = 'placement_questions';
    protected $guarded = [];
    protected $casts = [
        'options' => 'array',
        'test_cases' => 'array',
    ];
}
