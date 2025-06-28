<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\NotificationService;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class NotificationController extends Controller
{
    use AuthorizesRequests;

    /**
     * Get notifications for the authenticated user/admin
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $limit = $request->get('limit', 50);
        $unreadOnly = $request->get('unread_only', false);

        $notifications = NotificationService::getNotifications(
            $user->role === 'user' ? $user->id : null,
            $user->role === 'admin' ? $user->id : null,
            $limit,
            $unreadOnly
        );

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => NotificationService::getUnreadCount(
                $user->role === 'user' ? $user->id : null,
                $user->role === 'admin' ? $user->id : null
            )
        ]);
    }

    /**
     * Get unread count
     */
    public function unreadCount()
    {
        $user = Auth::user();

        $count = NotificationService::getUnreadCount(
            $user->role === 'user' ? $user->id : null,
            $user->role === 'admin' ? $user->id : null
        );

        return response()->json([
            'success' => true,
            'unread_count' => $count
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $user = Auth::user();

        $notification = NotificationService::markAsRead(
            $id,
            $user->role === 'user' ? $user->id : null,
            $user->role === 'admin' ? $user->id : null
        );

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::user();

        $count = NotificationService::markAllAsRead(
            $user->role === 'user' ? $user->id : null,
            $user->role === 'admin' ? $user->id : null
        );

        return response()->json([
            'success' => true,
            'message' => "Marked {$count} notifications as read"
        ]);
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $notification = Notification::where('id', $id);

        if ($user->role === 'user') {
            $notification->where('user_id', $user->id);
        } elseif ($user->role === 'admin') {
            $notification->where('admin_id', $user->id);
        }

        $notification = $notification->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Delete all notifications for the authenticated user/admin
     */
    public function deleteAll()
    {
        $user = Auth::user();

        $query = Notification::query();

        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'admin') {
            $query->where('admin_id', $user->id);
        }

        $count = $query->count();
        $query->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$count} notifications successfully"
        ]);
    }

    /**
     * Get notification settings (for future use)
     */
    public function settings()
    {
        $user = Auth::user();

        // For now, return default settings
        // In the future, this could be stored in user preferences
        return response()->json([
            'success' => true,
            'settings' => [
                'email_notifications' => true,
                'in_app_notifications' => true,
                'notification_types' => [
                    'user' => true,
                    'course' => true,
                    'task' => true,
                    'system' => true
                ]
            ]
        ]);
    }

    /**
     * Update notification settings (for future use)
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();

        // Validate request
        $request->validate([
            'email_notifications' => 'boolean',
            'in_app_notifications' => 'boolean',
            'notification_types' => 'array',
            'notification_types.*' => 'boolean'
        ]);

        // For now, just return success
        // In the future, this would save to user preferences
        return response()->json([
            'success' => true,
            'message' => 'Notification settings updated successfully'
        ]);
    }

    /**
     * Admin: Get all notifications (for admin dashboard)
     */
    public function adminIndex(Request $request)
    {
        $this->authorize('viewAny', Notification::class);

        $limit = $request->get('limit', 100);
        $type = $request->get('type');
        $unreadOnly = $request->get('unread_only', false);

        $query = Notification::query();

        if ($type) {
            $query->byType($type);
        }

        if ($unreadOnly) {
            $query->unread();
        }

        $notifications = $query->with(['user', 'admin'])
            ->orderBy('created_at', 'desc')
            ->paginate($limit);

        return response()->json([
            'success' => true,
            'notifications' => $notifications
        ]);
    }
}
