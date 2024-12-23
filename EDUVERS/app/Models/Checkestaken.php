<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checkestaken extends Model
{
    protected $fillable = ['testlevel'.'testcourse'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
