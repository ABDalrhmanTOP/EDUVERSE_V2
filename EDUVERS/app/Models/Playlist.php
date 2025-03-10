<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_id',
        'name',
        'description',
    ];

    public function tasks()
    {
        return $this->hasMany(Task::class);

    }
}
