<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserProgress
 *
 * @method bool save(array $options = [])
 */
class UserProgress extends Model
{
    use HasFactory;

    protected $table = 'user_progress';

    protected $fillable = [
        'user_id',
        'video_id',
        'playlist_id', // Make sure this column exists in the user_progress table
        'last_timestamp',
        'completed_tasks',
    ];

    protected $casts = [
        'completed_tasks' => 'array',
    ];

    // Relationship to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // If needed, relationship to playlist
    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }

    /**
     * Accessor for completed_tasks.
     */
    public function getCompletedTasksAttribute($value)
    {
        return json_decode($value, true) ?? [];
    }

    /**
     * Mutator for completed_tasks.
     */
    public function setCompletedTasksAttribute($value)
    {
        $this->attributes['completed_tasks'] = json_encode($value);
    }
}
