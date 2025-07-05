<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FinalTest extends Model
{
    use HasFactory;
    protected $guarded = [];
    public function course()
    {
        return $this->belongsTo(Playlist::class, 'course_id');
    }
    public function questions()
    {
        return $this->hasMany(FinalTestQuestion::class);
    }
}
