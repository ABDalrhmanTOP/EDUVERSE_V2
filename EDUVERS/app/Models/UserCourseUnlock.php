<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCourseUnlock extends Model
{
    use HasFactory;
    protected $table = 'user_course_unlocks';
    protected $guarded = [];
}
