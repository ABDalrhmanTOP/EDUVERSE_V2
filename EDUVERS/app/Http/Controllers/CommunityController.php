<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CommunityPost;
use App\Models\CommunityComment;
use Illuminate\Support\Facades\Auth;

class CommunityController extends Controller
{
    // جلب جميع منشورات المجتمع
    public function index()
    {
        return CommunityPost::with('user')->withCount('comments')->latest()->get();
    }

    // جلب منشور مع التعليقات
    public function show($id)
    {
        return CommunityPost::with(['user', 'comments.user'])->findOrFail($id);
    }

    // إضافة منشور جديد
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);
        $post = CommunityPost::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
        ]);
        return response()->json($post, 201);
    }

    // إضافة تعليق جديد
    public function comment(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);
        $comment = CommunityComment::create([
            'post_id' => $id,
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);
        return response()->json($comment, 201);
    }

    // تعديل منشور
    public function updatePost(Request $request, $id)
    {
        $post = CommunityPost::findOrFail($id);
        if ($post->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);
        $post->update([
            'title' => $request->title,
            'content' => $request->content,
        ]);
        return response()->json($post);
    }

    // حذف منشور
    public function deletePost($id)
    {
        $post = CommunityPost::findOrFail($id);
        if ($post->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }

    // تعديل تعليق
    public function updateComment(Request $request, $id)
    {
        $comment = CommunityComment::findOrFail($id);
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $request->validate([
            'content' => 'required|string',
        ]);
        $comment->update([
            'content' => $request->content,
        ]);
        return response()->json($comment);
    }

    // حذف تعليق
    public function deleteComment($id)
    {
        $comment = CommunityComment::findOrFail($id);
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
