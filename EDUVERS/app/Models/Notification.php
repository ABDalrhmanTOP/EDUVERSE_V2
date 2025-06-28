<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'data',
        'user_id',
        'admin_id',
        'is_read',
        'email_sent',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'email_sent' => 'boolean',
        'read_at' => 'datetime',
    ];

    // Notification types
    const TYPE_INFO = 'info';
    const TYPE_WARNING = 'warning';
    const TYPE_SUCCESS = 'success';
    const TYPE_ERROR = 'error';
    const TYPE_USER = 'user';
    const TYPE_COURSE = 'course';
    const TYPE_TASK = 'task';

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForAdmin($query, $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Methods
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    public function getIconAttribute()
    {
        return match ($this->type) {
            self::TYPE_INFO => 'info-circle',
            self::TYPE_WARNING => 'exclamation-triangle',
            self::TYPE_SUCCESS => 'check-circle',
            self::TYPE_ERROR => 'times-circle',
            self::TYPE_USER => 'user',
            self::TYPE_COURSE => 'book',
            self::TYPE_TASK => 'tasks',
            default => 'bell'
        };
    }

    public function getColorAttribute()
    {
        return match ($this->type) {
            self::TYPE_INFO => 'blue',
            self::TYPE_WARNING => 'yellow',
            self::TYPE_SUCCESS => 'green',
            self::TYPE_ERROR => 'red',
            self::TYPE_USER => 'purple',
            self::TYPE_COURSE => 'indigo',
            self::TYPE_TASK => 'teal',
            default => 'gray'
        };
    }
}
