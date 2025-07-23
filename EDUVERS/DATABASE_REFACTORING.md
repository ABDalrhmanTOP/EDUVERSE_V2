# Database Refactoring Documentation

## Overview

This document outlines the comprehensive refactoring performed on the EduVerse backend database to eliminate redundancy, improve structure, and ensure clean, maintainable code.

## Changes Made

### 1. Migration Consolidation

-   **Removed redundant migrations** that modified the same columns multiple times
-   **Consolidated user profile fields** into the initial users table migration
-   **Eliminated duplicate personal access tokens** table creation
-   **Fixed inconsistent migration syntax** to use modern Laravel anonymous class format
-   **Merged foreign key constraints** into their respective table migrations

### 2. Table Structure Improvements

#### Users Table (`0001_01_01_000000_create_users_table.php`)

-   Consolidated all profile fields into a single migration
-   Added missing fields: `faculty`, `cs_field`, `current_year`
-   All profile fields are now nullable with appropriate defaults

#### Playlists Table (`2024_11_20_160237_create_playlists_table.php`)

-   Updated to use modern Laravel syntax
-   Added `video_duration` field
-   Changed `description` to `text` type for better storage

#### Tasks Table (`2024_11_20_160243_create_tasks_table.php`)

-   Consolidated all task-related fields into a single migration
-   Fixed `video_id` to be `string` type from the start
-   Added all additional fields: `description`, `question`, `correct_answer`, etc.
-   Made `prompt` and `expected_output` nullable

#### Results Table (`2025_06_30_161649_create_results_table.php`)

-   Moved to run after placement_tests table creation
-   Includes proper foreign key constraint for `test_id`
-   Added test-related fields: `test_id`, `total_questions`, `percentage`, `test_type`
-   Made `level_id` nullable to support both level-based and test-based results

#### Placement Tests (`2025_06_30_161633_create_placement_tests_table.php`)

-   Standard placement test structure with course relationship

#### Placement Test Questions (`2025_06_30_161638_create_placement_test_questions_table.php`)

-   Fixed `difficulty` to be `string` type from the start
-   Proper foreign key relationships

#### Final Projects (`2025_06_30_161648_create_final_tests_table.php`)

-   Renamed from "final_tests" to "final_projects"
-   Clean structure for final project management

#### Final Project Questions (`2025_07_05_000007_create_final_project_questions_table.php`)

-   New migration for final project questions
-   Comprehensive question structure with multiple types

### 3. Removed Redundant Migrations

The following migrations were removed as they were redundant or no longer needed:

-   `2025_07_11_214542_change_video_id_to_string_in_tasks_table.php`
-   `2025_07_11_214803_make_prompt_nullable_in_tasks_table.php`
-   `2025_07_11_214804_make_expected_output_nullable_in_tasks_table.php`
-   `fix_correct_answer_column_in_tasks_table.php`
-   `2025_06_25_225006_add_missing_columns_to_tasks_table.php`
-   `2025_06_25_224405_add_video_duration_to_playlists_table.php`
-   `2025_07_01_000001_fix_paid_column_on_playlists_table.php`
-   `2025_03_08_074049_add_role_to_users_table.php`
-   `2024_12_27_215015_add_test_taken_to_users_table.php`
-   `2025_07_05_000004_add_placement_fields_to_users_table.php`
-   `2025_06_26_222631_add_profile_fields_to_users_table.php`
-   `2025_07_05_000001_add_test_columns_to_results_table.php`
-   `2025_07_05_000003_make_level_id_nullable_in_results.php`
-   `2025_07_09_232716_rename_final_tests_to_final_projects.php`
-   `2025_07_09_165500_rename_final_tests_to_final_projects.php`
-   `2025_07_05_000006_rename_final_test_questions_to_final_project_questions.php`
-   `2025_07_09_201834_fix_difficulty_column_in_final_project_questions.php`
-   `2025_07_09_164440_add_missing_columns_to_final_project_questions_table.php`
-   `2025_07_11_211354_change_difficulty_to_string_in_placement_test_questions_table.php`
-   `2025_07_05_000002_add_placement_score_to_user_course_unlocks.php`
-   `2025_07_01_000005_add_placement_fields_to_users_table.php`
-   `2025_01_20_213348_create_email_verification_codes_table.php`
-   `2025_04_06_035107_drop_email_verification_codes_table.php`
-   `2025_07_01_000003_create_placement_questions_table.php`
-   `2025_07_12_000000_add_test_id_foreign_key_to_results_table.php`

### 4. Removed Redundant Models and Seeders

-   **PlacementQuestion model** - replaced by PlacementTestQuestion
-   **PlacementQuestionsSeeder** - replaced by PlacementTestQuestionsSeeder

### 5. Model Updates

-   **User model**: Added new fillable fields
-   **EduBot model**: Fixed table name to follow Laravel conventions (`edu_bot`)

### 6. Seeder Updates

-   **DatabaseSeeder**: Updated to use PlacementTestQuestionsSeeder instead of PlacementQuestionsSeeder

### 7. Table Naming Convention

-   **user_progress** table renamed to **user_progresses** to follow Laravel plural naming convention
-   Updated all foreign key references accordingly

## Database Schema Overview

### Core Tables

1. **users** - User accounts and profiles
2. **playlists** - Course playlists/videos
3. **tasks** - Interactive tasks and questions
4. **user_progresses** - User learning progress
5. **levels** - Difficulty levels
6. **questions** - Level-based questions
7. **results** - Test and level results

### Placement Test System

8. **placement_tests** - Placement test definitions
9. **placement_test_questions** - Questions for placement tests
10. **user_course_unlocks** - Course access based on placement scores

### Final Project System

11. **final_projects** - Final project definitions
12. **final_project_questions** - Questions for final projects
13. **final_project_submissions** - User submissions for final projects

### Supporting Tables

14. **user_ratings** - User feedback and ratings
15. **notifications** - System notifications
16. **edu_bot** - Chat bot conversations
17. **personal_access_tokens** - API authentication
18. **sessions** - User sessions
19. **cache** - System cache
20. **jobs** - Queue jobs

## Migration Order

The migrations are designed to run in the correct order with proper foreign key relationships:

1. Core tables (users, playlists, tasks, etc.)
2. Supporting tables (sessions, cache, jobs)
3. Feature-specific tables (placement tests, final projects, etc.)
4. Results table (runs after placement_tests to ensure foreign key constraints work)

## Benefits of Refactoring

1. **Eliminated Redundancy**: No more multiple migrations modifying the same columns
2. **Improved Consistency**: All migrations use modern Laravel syntax
3. **Better Structure**: Related fields are grouped together in single migrations
4. **Cleaner Codebase**: Removed unused models and seeders
5. **Proper Relationships**: All foreign keys use modern Laravel syntax
6. **Maintainability**: Easier to understand and modify the database structure
7. **Single Responsibility**: Each migration file creates only one table with all its constraints

## Deployment Instructions

1. **Backup existing database** before running migrations
2. **Drop all tables** and run fresh migrations: `php artisan migrate:fresh`
3. **Run seeders**: `php artisan db:seed`
4. **Verify data integrity** by testing key functionality

## Notes for Team Members

-   All migrations are now clean and follow Laravel best practices
-   No more conflicting migrations that modify the same columns
-   Each migration file creates only one table with all its constraints
-   The database structure is well-documented and maintainable
-   When adding new features, create comprehensive migrations that include all necessary fields
-   Follow the established naming conventions and structure
