<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PlacementTestQuestion extends Model
{
    use HasFactory;
    protected $guarded = [];
    protected $casts = [
        'options' => 'array',
        'test_cases' => 'array',
        'difficulty' => 'integer',
    ];
    public function placementTest()
    {
        return $this->belongsTo(PlacementTest::class);
    }
}
