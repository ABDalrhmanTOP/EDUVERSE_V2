<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserProgress;

class ConvertLastTimestampToSeconds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'convert:timestamps';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert last_timestamp in hh:mm:ss format to seconds';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Converting last_timestamp to seconds...');
        
        UserProgress::all()->each(function ($progress) {
            // Skip if already in seconds (integer format)
            if (is_numeric($progress->last_timestamp)) {
                return;
            }

            // Convert hh:mm:ss to seconds
            $timestampParts = explode(':', $progress->last_timestamp);
            $seconds = ($timestampParts[0] * 3600) + ($timestampParts[1] * 60) + $timestampParts[2];

            // Update the record
            $progress->update(['last_timestamp' => $seconds]);
            $this->info("Updated progress ID {$progress->id} to {$seconds} seconds.");
        });

        $this->info('Conversion completed.');
    }
}
