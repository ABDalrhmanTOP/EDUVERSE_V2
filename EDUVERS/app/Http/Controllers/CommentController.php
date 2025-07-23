<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    // Fetch comments for a course (with replies, likes/dislikes, user info, sorting)
    public function index(Request $request, $courseId)
    {
        $sort = $request->query('sort', 'newest');
        $query = Comment::with(['user', 'replies.user', 'likes', 'replies.likes'])
            ->where('course_id', $courseId)
            ->whereNull('parent_id');

        if ($sort === 'most_liked') {
            $query->withCount('likes')->orderByDesc('likes_count');
        } elseif ($sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $comments = $query->get();
        return response()->json($comments);
    }

    // Post a new comment
    public function store(Request $request, $courseId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $user = Auth::user();
        $comment = Comment::create([
            'user_id' => $user->id,
            'course_id' => $courseId,
            'content' => $request->content,
        ]);
        return response()->json($comment, 201);
    }

    // Post a reply to a comment
    public function reply(Request $request, $commentId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $parent = Comment::findOrFail($commentId);
        $user = Auth::user();
        $reply = Comment::create([
            'user_id' => $user->id,
            'course_id' => $parent->course_id,
            'parent_id' => $parent->id,
            'content' => $request->content,
        ]);
        // Notification logic: notify parent comment's author if not self
        if ($parent->user_id !== $user->id) {
            Notification::create([
                'user_id' => $parent->user_id,
                'type' => 'comment_reply',
                'title' => 'New reply to your comment',
                'data' => json_encode([
                    'comment_id' => $parent->id,
                    'reply_id' => $reply->id,
                    'course_id' => $parent->course_id,
                    'snippet' => mb_substr($reply->content, 0, 100),
                ]),
                'read_at' => null,
            ]);
        }
        return response()->json($reply, 201);
    }

    // Edit a comment
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $comment = Comment::findOrFail($id);
        $user = Auth::user();
        if ($user->id !== $comment->user_id && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $comment->content = $request->content;
        $comment->edited_at = now();
        $comment->save();
        return response()->json($comment);
    }

    // Delete a comment
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $user = Auth::user();
        if ($user->id !== $comment->user_id && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $comment->delete();
        return response()->json(['success' => true]);
    }

    // Like or dislike a comment
    public function like(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:like,dislike',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $user = Auth::user();
        $comment = Comment::findOrFail($id);
        // Only allow one like/dislike per user per comment
        $existing = CommentLike::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->first();
        if ($existing) {
            // If the type is the same, remove the like/dislike (toggle off)
            if ($existing->type === $request->type) {
                $existing->delete();
                return response()->json(['message' => 'Like/dislike removed'], 200);
            } else {
                // Otherwise, update the type
                $existing->type = $request->type;
                $existing->save();
                return response()->json($existing, 200);
            }
        }
        // Otherwise, create new like/dislike
        $like = CommentLike::create([
            'user_id' => $user->id,
            'comment_id' => $comment->id,
            'type' => $request->type,
        ]);
        return response()->json($like, 201);
    }
}
