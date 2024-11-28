<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;

    protected $table = 'user_progress';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'video_id',
        'last_timestamp',
        'completed_tasks',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'completed_tasks' => 'array',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }

    /**
     * Mutators
     */
    public function getCompletedTasksAttribute($value)
    {
        return json_decode($value, true) ?? [];
    }

    public function setCompletedTasksAttribute($value)
    {
        $this->attributes['completed_tasks'] = json_encode($value);
    }
}
