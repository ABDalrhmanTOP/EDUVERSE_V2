<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'plan_name',
        'plan_description',
        'amount',
        'currency',
        'status',
        'payment_intent_id',
        'payment_method',
        'transaction_id',
        'start_date',
        'end_date',
        'cancelled_at',
        'cancellation_reason',
        'features',
        'allowed_courses'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'cancelled_at' => 'datetime',
        'features' => 'array',
        'amount' => 'integer'
    ];

    /**
     * Get the user that owns the subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the formatted amount.
     */
    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount / 100, 2);
    }

    /**
     * Check if subscription is active.
     */
    public function isActive()
    {
        return $this->status === 'active' && $this->end_date->isFuture();
    }

    /**
     * Check if subscription is expired.
     */
    public function isExpired()
    {
        return $this->end_date->isPast();
    }

    /**
     * Get status color for UI.
     */
    public function getStatusColorAttribute()
    {
        switch ($this->status) {
            case 'active':
                return '#10b981';
            case 'cancelled':
                return '#ef4444';
            case 'expired':
                return '#f59e0b';
            case 'pending':
                return '#3b82f6';
            default:
                return '#6b7280';
        }
    }
}
