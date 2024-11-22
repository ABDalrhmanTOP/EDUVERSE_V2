<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'profile_photo_path')) {
                $table->string('profile_photo_path', 2048)->nullable();
            }

            if (!Schema::hasColumn('users', 'level')) {
                $table->string('level')->nullable()->after('password');
            }

            if (!Schema::hasColumn('users', 'last_task_completed')) {
                $table->json('last_task_completed')->nullable()->after('level');
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'profile_photo_path')) {
                $table->dropColumn('profile_photo_path');
            }

            if (Schema::hasColumn('users', 'level')) {
                $table->dropColumn('level');
            }

            if (Schema::hasColumn('users', 'last_task_completed')) {
                $table->dropColumn('last_task_completed');
            }
        });
    }
}
