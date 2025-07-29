<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserCourseUnlock;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateRecommendationRules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recommendations:generate-rules';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate recommendation rules using Python script';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting recommendation rules generation...');

        try {
            // Step 1: Export user courses data
            $this->info('Exporting user courses data...');
            $this->exportUserCourses();

            // Step 2: Run Python script
            $this->info('Running Python script to generate rules...');
            $this->runPythonScript();

            $this->info('Recommendation rules generated successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('Error generating recommendation rules: ' . $e->getMessage());
            Log::error('Recommendation rules generation failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Export user courses data to JSON file
     */
    private function exportUserCourses()
    {
        $data = UserCourseUnlock::select('user_id', 'course_id')->get();

        $transactions = [];
        foreach ($data as $row) {
            $transactions[$row->user_id][] = $row->course_id;
        }

        // Save as JSON in storage/app/transactions.json
        Storage::disk('local')->put('transactions.json', json_encode(array_values($transactions)));

        // Also save in the root directory for Python script access
        $rootPath = base_path('../transactions.json');
        file_put_contents($rootPath, json_encode(array_values($transactions)));

        $this->info('Exported ' . count($transactions) . ' user transactions');
        $this->info('File saved to: ' . Storage::disk('local')->path('transactions.json'));
        $this->info('File also saved to: ' . $rootPath);
    }

    /**
     * Run the Python script
     */
    private function runPythonScript()
    {
        $pythonScript = base_path('../generate_rules.py');

        if (!file_exists($pythonScript)) {
            throw new \Exception("Python script not found at: $pythonScript");
        }

        // Set environment variables for database connection
        $env = [
            'DB_HOST' => config('database.connections.mysql.host'),
            'DB_USER' => config('database.connections.mysql.username'),
            'DB_PASSWORD' => config('database.connections.mysql.password'),
            'DB_NAME' => config('database.connections.mysql.database'),
        ];

        // Build command with environment variables and correct working directory
        $command = '';
        foreach ($env as $key => $value) {
            $command .= "set $key=$value && ";
        }
        // Change to the root directory before running Python script
        $command .= "cd " . base_path('../') . " && ";
        $command .= "python \"$pythonScript\"";

        // Execute the command
        $output = [];
        $returnCode = 0;

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception("Python script failed with return code: $returnCode\nOutput: " . implode("\n", $output));
        }

        $this->info('Python script executed successfully');
        $this->line(implode("\n", $output));
    }
}
