<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\NotificationEmail;

class NotificationService
{
    /**
     * Create a notification
     */
    public static function create($type, $title, $message, $data = [], $userId = null, $adminId = null, $sendEmail = false)
    {
        $notification = Notification::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'user_id' => $userId,
            'admin_id' => $adminId,
        ]);

        // Send email if requested
        if ($sendEmail) {
            self::sendEmailNotification($notification);
        }

        return $notification;
    }

    /**
     * Create admin notification
     */
    public static function createAdminNotification($type, $title, $message, $data = [], $sendEmail = true)
    {
        // Get all admin users
        $admins = User::where('role', 'admin')->get();

        $notifications = [];
        foreach ($admins as $admin) {
            $notification = self::create($type, $title, $message, $data, null, $admin->id, $sendEmail);
            $notifications[] = $notification;
        }

        return $notifications;
    }

    /**
     * Create user notification
     */
    public static function createUserNotification($userId, $type, $title, $message, $data = [], $sendEmail = false)
    {
        return self::create($type, $title, $message, $data, $userId, null, $sendEmail);
    }

    /**
     * Send email notification
     */
    public static function sendEmailNotification($notification)
    {
        $user = null;
        if ($notification->user_id) {
            $user = User::find($notification->user_id);
        } elseif ($notification->admin_id) {
            $user = User::find($notification->admin_id);
        }

        if (!$user) {
            Log::error('Notification email failed: User not found', [
                'notification_id' => $notification->id,
                'user_id' => $notification->user_id,
                'admin_id' => $notification->admin_id
            ]);
            return false;
        }

        if (!$user->email) {
            Log::error('Notification email failed: User has no email', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'user_email' => $user->email
            ]);
            return false;
        }

        try {
            Log::info('Attempting to send notification email', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'notification_title' => $notification->title
            ]);

            // Send email synchronously for faster delivery
            Mail::to($user->email)->send(new NotificationEmail($notification, $user));

            $notification->update(['email_sent' => true]);

            Log::info('Notification email sent successfully', [
                'notification_id' => $notification->id,
                'user_email' => $user->email,
                'sent_at' => now()->toISOString()
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send notification email: ' . $e->getMessage(), [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return false;
        }
    }

    /**
     * Mark notification as read
     */
    public static function markAsRead($notificationId, $userId = null, $adminId = null)
    {
        $query = Notification::where('id', $notificationId);

        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($adminId) {
            $query->where('admin_id', $adminId);
        }

        $notification = $query->first();

        if ($notification) {
            $notification->markAsRead();
            return $notification;
        }

        return null;
    }

    /**
     * Mark all notifications as read
     */
    public static function markAllAsRead($userId = null, $adminId = null)
    {
        $query = Notification::unread();

        if ($userId) {
            $query->forUser($userId);
        } elseif ($adminId) {
            $query->forAdmin($adminId);
        }

        return $query->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    /**
     * Get notifications for user/admin
     */
    public static function getNotifications($userId = null, $adminId = null, $limit = 50, $unreadOnly = false)
    {
        $query = Notification::query();

        if ($userId) {
            $query->forUser($userId);
        } elseif ($adminId) {
            $query->forAdmin($adminId);
        }

        if ($unreadOnly) {
            $query->unread();
        }

        return $query->orderBy('created_at', 'desc')->limit($limit)->get();
    }

    /**
     * Get unread count
     */
    public static function getUnreadCount($userId = null, $adminId = null)
    {
        $query = Notification::unread();

        if ($userId) {
            $query->forUser($userId);
        } elseif ($adminId) {
            $query->forAdmin($adminId);
        }

        return $query->count();
    }

    /**
     * Create specific notification types
     */
    public static function userRegistered($user)
    {
        return self::createAdminNotification(
            Notification::TYPE_USER,
            'New User Registration',
            "A new user '{$user->name}' has registered on the platform.",
            ['user_id' => $user->id, 'user_name' => $user->name],
            true
        );
    }

    public static function userVerified($user)
    {
        return self::createUserNotification(
            $user->id,
            Notification::TYPE_SUCCESS,
            'Account Verified',
            'Your account has been successfully verified. Welcome to EduVerse!',
            ['user_id' => $user->id],
            true
        );
    }

    public static function userInactive($user)
    {
        return self::createUserNotification(
            $user->id,
            Notification::TYPE_WARNING,
            'We Miss You!',
            'It\'s been a while since you last accessed your courses. Come back and continue learning!',
            ['user_id' => $user->id, 'days_inactive' => 7],
            true
        );
    }

    public static function courseCreated($course)
    {
        // Notify admins about new course
        $adminNotifications = self::createAdminNotification(
            Notification::TYPE_COURSE,
            'Course Created',
            "A new course '{$course->name}' has been created.",
            ['course_id' => $course->id, 'course_name' => $course->name],
            false
        );

        // Notify all users about new course
        $users = \App\Models\User::where('role', 'user')->get();
        $userNotifications = [];

        foreach ($users as $user) {
            $notification = self::createUserNotification(
                $user->id,
                Notification::TYPE_COURSE,
                'New Course Available',
                "A new course '{$course->name}' is now available for you to explore!",
                ['course_id' => $course->id, 'course_name' => $course->name],
                true // Send email to users about new courses
            );
            $userNotifications[] = $notification;
        }

        return array_merge($adminNotifications, $userNotifications);
    }

    public static function taskSubmitted($task, $user)
    {
        return self::createAdminNotification(
            Notification::TYPE_TASK,
            'Task Submission',
            "User '{$user->name}' has submitted a task for '{$task->title}'.",
            ['task_id' => $task->id, 'user_id' => $user->id, 'task_title' => $task->title],
            false
        );
    }

    public static function courseCompleted($course, $user)
    {
        return self::createAdminNotification(
            Notification::TYPE_SUCCESS,
            'Course Completed',
            "User '{$user->name}' has completed the course '{$course->name}'.",
            ['course_id' => $course->id, 'user_id' => $user->id, 'course_name' => $course->name],
            false
        );
    }

    public static function profileUpdated($user, $changedFields = [])
    {
        $message = 'Your profile information has been successfully updated.';

        if (!empty($changedFields)) {
            $fieldLabels = [
                'name' => 'Full Name',
                'username' => 'Username',
                'email' => 'Email Address',
                'password' => 'Password',
                'job' => 'Job Title',
                'country' => 'Country',
                'experience' => 'Experience Level',
                'semester' => 'Semester',
                'career_goals' => 'Career Goals',
                'hobbies' => 'Hobbies',
                'expectations' => 'Expectations',
                'university' => 'University',
                'education_level' => 'Education Level',
                'field_of_study' => 'Field of Study',
                'student_year' => 'Student Year',
                'years_of_experience' => 'Years of Experience',
                'specialization' => 'Specialization',
                'industry' => 'Industry',
                'company_size' => 'Company Size',
                'teaching_subject' => 'Teaching Subject',
                'research_field' => 'Research Field',
                'role' => 'Role'
            ];

            $changedLabels = [];
            foreach ($changedFields as $field) {
                if (isset($fieldLabels[$field])) {
                    $changedLabels[] = $fieldLabels[$field];
                }
            }

            if (!empty($changedLabels)) {
                $message .= ' Updated fields: ' . implode(', ', $changedLabels) . '.';
            }
        }

        return self::createUserNotification(
            $user->id,
            Notification::TYPE_SUCCESS,
            'Profile Updated',
            $message,
            ['user_id' => $user->id, 'changed_fields' => $changedFields],
            false
        );
    }

    public static function welcomeUser($user)
    {
        return self::createUserNotification(
            $user->id,
            Notification::TYPE_SUCCESS,
            'Welcome to EduVerse!',
            'Welcome to EduVerse! We\'re excited to have you on board. Start exploring our courses and begin your learning journey.',
            ['user_id' => $user->id],
            true
        );
    }

    /**
     * Clean up old notifications (optional)
     */
    public static function cleanupOldNotifications($days = 90)
    {
        $cutoffDate = now()->subDays($days);

        return Notification::where('created_at', '<', $cutoffDate)
            ->where('is_read', true)
            ->delete();
    }
}
