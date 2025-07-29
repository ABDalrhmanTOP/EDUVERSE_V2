<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportRecommendationRules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recommendations:import-rules';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import recommendation rules from JSON file to database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting recommendation rules import...');

        try {
            // Check if JSON file exists
            $jsonPath = storage_path('app/recommendation_rules.json');

            if (!file_exists($jsonPath)) {
                $this->error('Recommendation rules JSON file not found. Please generate rules first.');
                return 1;
            }

            // Load JSON data
            $jsonData = file_get_contents($jsonPath);
            $rules = json_decode($jsonData, true);

            if (empty($rules)) {
                $this->error('No rules found in JSON file.');
                return 1;
            }

            $this->info("Found " . count($rules) . " rules to import.");

            // Test database connection
            try {
                DB::connection()->getPdo();
                $this->info('Database connection successful.');
            } catch (\Exception $e) {
                $this->error('Database connection failed: ' . $e->getMessage());
                return 1;
            }

            // Create table if not exists
            if (!DB::getSchemaBuilder()->hasTable('recommendation_rules')) {
                $this->info('Creating recommendation_rules table...');
                DB::statement("
                    CREATE TABLE recommendation_rules (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        antecedents VARCHAR(255),
                        consequents VARCHAR(255),
                        support FLOAT,
                        confidence FLOAT,
                        lift FLOAT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                ");
            }

            // Clear existing rules
            DB::table('recommendation_rules')->delete();
            $this->info('Cleared existing rules.');

            // Import rules
            $imported = 0;
            foreach ($rules as $rule) {
                DB::table('recommendation_rules')->insert([
                    'antecedents' => implode(',', $rule['antecedents']),
                    'consequents' => implode(',', $rule['consequents']),
                    'support' => $rule['support'],
                    'confidence' => $rule['confidence'],
                    'lift' => $rule['lift'],
                    'created_at' => $rule['created_at'] ?? now(),
                    'updated_at' => now(),
                ]);
                $imported++;
            }

            $this->info("Successfully imported {$imported} rules to database.");

            // Optionally backup the JSON file
            $backupPath = storage_path('app/recommendation_rules_backup_' . date('Y-m-d_H-i-s') . '.json');
            copy($jsonPath, $backupPath);
            $this->info("JSON file backed up to: " . basename($backupPath));

            return 0;

        } catch (\Exception $e) {
            $this->error('Error importing recommendation rules: ' . $e->getMessage());
            Log::error('Recommendation rules import failed: ' . $e->getMessage());
            return 1;
        }
    }
}
