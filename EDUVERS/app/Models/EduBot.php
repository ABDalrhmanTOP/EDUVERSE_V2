<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EduBot extends Model
{
    use HasFactory;

    // Explicitly set the table name to 'EduBot'
    protected $table = 'EduBot';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'query',
        'response',
    ];

    /**
     * Define the relationship with the User model.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
