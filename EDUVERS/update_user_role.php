<?php

require_once 'vendor/autoload.php';

use App\Models\User;

// Get the current user's email (you can change this to your email)
$userEmail = 'ert44039@gmail.com'; // This is the admin user from seeder

// Update the user's role to admin
$user = User::where('email', $userEmail)->first();

if ($user) {
    $user->role = 'admin';
    $user->save();
    echo "User {$user->name} ({$user->email}) role updated to: {$user->role}\n";
} else {
    echo "User with email {$userEmail} not found.\n";
}

// List all users and their roles
echo "\nAll users and their roles:\n";
$users = User::all(['name', 'email', 'role']);
foreach ($users as $user) {
    echo "- {$user->name} ({$user->email}) - Role: {$user->role}\n";
}
