<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at');

        if ($request->boolean('unread')) {
            $query->unread();
        }

        $notifications = $query->limit(50)->get();

        return response()->json(['data' => $notifications]);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) abort(403);

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Đã đánh dấu đã đọc']);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Đã đánh dấu tất cả đã đọc']);
    }
}
