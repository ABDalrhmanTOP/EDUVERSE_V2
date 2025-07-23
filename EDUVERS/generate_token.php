<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

// Find the admin user
$adminUser = User::where('email', 'ert44039@gmail.com')->first();

if (!$adminUser) {
    echo "Admin user not found!\n";
    exit(1);
}

// Create a new token for n8n
$token = $adminUser->createToken('n8n-integration')->plainTextToken;

echo "=== EDUVERSE API TOKEN FOR N8N ===\n";
echo "Token: " . $token . "\n";
echo "User: " . $adminUser->name . " (" . $adminUser->email . ")\n";
echo "Role: " . $adminUser->role . "\n";
echo "================================\n";
echo "\n";
echo "Add this to your n8n environment variables:\n";
echo "EDUVERSE_API_TOKEN=" . $token . "\n";
