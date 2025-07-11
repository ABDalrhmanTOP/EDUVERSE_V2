<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Playlist;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'level',
        'last_task_completed',
        'profile_photo_path',
        'test_taken',
        'role',
        'placement_score',
        'placement_level',
        'job',
        'university',
        'country',
        'experience',
        'career_goals',
        'hobbies',
        'expectations',
        'education_level',
        'field_of_study',
        'student_year',
        'years_of_experience',
        'specialization',
        'teaching_subject',
        'research_field',
        'company_size',
        'industry',
        'semester',
        'has_completed_general_form',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_task_completed' => 'array',
    ];

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Relationships
     */
    public function progress()
    {
        return $this->hasMany(UserProgress::class);
    }

    public function tokens()
    {
        return $this->morphMany(PersonalAccessToken::class, 'tokenable');
    }

    public function Result()
    {
        return $this->hasMany(Result::class);
    }

    public function unlockedCourses()
    {
        return $this->belongsToMany(\App\Models\Playlist::class, 'user_course_unlocks', 'user_id', 'course_id')->withTimestamps()->withPivot('unlocked_at');
    }

    public function activeSubscription()
    {
        return $this->hasOne(\App\Models\Subscription::class)
            ->where('status', 'active')
            ->where('end_date', '>', now());
    }

    /**
     * فحص ما إذا كان المستخدم لديه اشتراك نشط
     */
    public function hasActiveSubscription()
    {
        return $this->activeSubscription()->exists();
    }

    /**
     * الحصول على عدد الكورسات المتبقية للمستخدم
     */
    public function getRemainingCourses()
    {
        $subscription = $this->activeSubscription()->first();
        if (!$subscription) {
            return 0;
        }

        $usedCourses = $this->unlockedCourses()->count();
        return max(0, $subscription->allowed_courses - $usedCourses);
    }
}
