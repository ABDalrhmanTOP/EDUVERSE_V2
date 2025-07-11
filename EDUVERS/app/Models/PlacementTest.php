<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Playlist;

class PlacementTest extends Model
{
    use HasFactory;
    protected $table = 'placement_tests';
    protected $guarded = [];

    public function course()
    {
        return $this->belongsTo(Playlist::class, 'course_id');
    }

    public function questions()
    {
        return $this->hasMany(PlacementTestQuestion::class);
    }
}
