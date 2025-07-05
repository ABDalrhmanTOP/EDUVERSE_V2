<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FinalTestQuestion extends Model
{
    use HasFactory;
    protected $guarded = [];
    public function finalTest()
    {
        return $this->belongsTo(FinalTest::class);
    }
}
