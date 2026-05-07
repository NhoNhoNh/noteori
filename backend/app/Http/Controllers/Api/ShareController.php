<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\SharedNote;
use App\Models\User;
use App\Models\Notification;
use App\Jobs\SendNoteSharedEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ShareController extends Controller
{
    /**
     * Chia sẻ ghi chú
     */
    public function share(Request $request, Note $note)
    {
        if ($note->user_id !== $request->user()->id) abort(403);

        $request->validate([
            'email' => 'required|email',
            'permission' => 'required|in:read,edit',
        ]);

        // Check if user exists
        $recipient = User::where('email', $request->email)->first();
        if (!$recipient) {
            return response()->json(['message' => 'Email không tồn tại trong hệ thống. Chỉ có thể chia sẻ với người dùng đã đăng ký.'], 422);
        }

        // Can't share with self
        if ($recipient->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể chia sẻ với chính mình'], 422);
        }

        // Check if already shared
        $existing = SharedNote::where('note_id', $note->id)
            ->where('shared_with_id', $recipient->id)->first();

        if ($existing) {
            $existing->update(['permission' => $request->permission]);
            return response()->json(['message' => 'Đã cập nhật quyền chia sẻ']);
        }

        SharedNote::create([
            'note_id' => $note->id,
            'owner_id' => $request->user()->id,
            'shared_with_id' => $recipient->id,
            'email' => $request->email,
            'permission' => $request->permission,
        ]);

        // Create notification
        Notification::create([
            'user_id' => $recipient->id,
            'type' => 'note_shared',
            'message' => "{$request->user()->name} đã chia sẻ một ghi chú với bạn",
            'data' => [
                'note_id' => $note->id,
                'note_title' => $note->title,
                'permission' => $request->permission,
            ],
        ]);

        // Send email notification via queue
        SendNoteSharedEmail::dispatch(
            $request->email,
            $request->user()->name,
            $note->title ?? 'Không tiêu đề',
            $request->permission,
        );

        return response()->json(['message' => "Đã chia sẻ ghi chú với {$request->email}"], 201);
    }

    /**
     * Xem chi tiết chia sẻ
     */
    public function getShareDetails(Request $request, Note $note)
    {
        if ($note->user_id !== $request->user()->id) abort(403);

        $shares = $note->shares()->with('sharedWith')->get()->map(function ($share) {
            return [
                'id' => $share->id,
                'email' => $share->email,
                'permission' => $share->permission,
                'user' => $share->sharedWith ? [
                    'id' => $share->sharedWith->id,
                    'name' => $share->sharedWith->name,
                    'avatar_url' => $share->sharedWith->avatar_url,
                ] : null,
                'created_at' => $share->created_at,
            ];
        });

        return response()->json(['data' => $shares]);
    }

    /**
     * Cập nhật quyền chia sẻ
     */
    public function updateShare(Request $request, Note $note, SharedNote $share)
    {
        if ($note->user_id !== $request->user()->id) abort(403);

        $request->validate(['permission' => 'required|in:read,edit']);

        $share->update(['permission' => $request->permission]);

        return response()->json(['message' => 'Đã cập nhật quyền']);
    }

    /**
     * Thu hồi chia sẻ
     */
    public function revokeShare(Request $request, Note $note, SharedNote $share)
    {
        if ($note->user_id !== $request->user()->id) abort(403);

        // Notify recipient
        Notification::create([
            'user_id' => $share->shared_with_id,
            'type' => 'share_revoked',
            'message' => "{$request->user()->name} đã thu hồi quyền truy cập ghi chú",
            'data' => ['note_title' => $note->title],
        ]);

        $share->delete();

        return response()->json(['message' => 'Đã thu hồi quyền truy cập']);
    }

    /**
     * Lấy danh sách ghi chú được chia sẻ với user
     */
    public function sharedWithMe(Request $request)
    {
        $shared = SharedNote::where('shared_with_id', $request->user()->id)
            ->with(['note', 'owner'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($share) {
                return [
                    'id' => $share->id,
                    'permission' => $share->permission,
                    'note' => $share->note ? [
                        'id' => $share->note->id,
                        'title' => $share->note->title,
                        'content' => $share->note->has_password ? null : $share->note->content,
                    ] : null,
                    'owner' => $share->owner ? [
                        'name' => $share->owner->name,
                        'avatar_url' => $share->owner->avatar_url,
                    ] : null,
                    'created_at' => $share->created_at,
                ];
            });

        return response()->json(['data' => $shared]);
    }
}
