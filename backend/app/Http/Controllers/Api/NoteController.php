<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\NoteImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class NoteController extends Controller
{
    /**
     * Lấy danh sách ghi chú
     */
    public function index(Request $request)
    {
        $query = Note::forUser($request->user()->id)
            ->with(['labels', 'images'])
            ->withCount('images')
            ->search($request->search)
            ->withLabel($request->label_id)
            ->ordered();

        $notes = $query->get()->map(function ($note) {
            return [
                'id' => $note->id,
                'title' => $note->title,
                'content' => $note->has_password ? null : $note->content,
                'is_pinned' => $note->is_pinned,
                'pinned_at' => $note->pinned_at,
                'has_password' => $note->has_password,
                'is_shared' => $note->is_shared,
                'images_count' => $note->images_count,
                'first_image' => $note->first_image,
                'labels' => $note->labels,
                'updated_at' => $note->updated_at,
                'created_at' => $note->created_at,
            ];
        });

        return response()->json(['data' => $notes]);
    }

    /**
     * Tạo ghi chú mới
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:500',
            'content' => 'nullable|string',
        ]);

        $note = Note::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
        ]);

        $note->load('labels', 'images');

        return response()->json([
            'message' => 'Đã tạo ghi chú',
            'data' => $note,
        ], 201);
    }

    /**
     * Xem chi tiết ghi chú
     */
    public function show(Request $request, Note $note)
    {
        $this->authorizeNote($request->user(), $note);
        $note->load('labels', 'images', 'shares.sharedWith');

        return response()->json(['data' => $note]);
    }

    /**
     * Cập nhật ghi chú (auto-save)
     */
    public function update(Request $request, Note $note)
    {
        $this->authorizeNote($request->user(), $note);

        $request->validate([
            'title' => 'nullable|string|max:500',
            'content' => 'nullable|string',
        ]);

        $note->update($request->only(['title', 'content']));
        $note->load('labels', 'images');

        // Broadcast update for realtime collaboration
        broadcast(new \App\Events\NoteUpdated($note))->toOthers();

        return response()->json([
            'message' => 'Đã cập nhật',
            'data' => $note,
        ]);
    }

    /**
     * Xóa ghi chú
     */
    public function destroy(Request $request, Note $note)
    {
        $this->authorizeNote($request->user(), $note, true);

        // Delete images from storage
        foreach ($note->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $note->delete();

        return response()->json(['message' => 'Đã xóa ghi chú']);
    }

    /**
     * Toggle ghim ghi chú
     */
    public function togglePin(Request $request, Note $note)
    {
        $this->authorizeNote($request->user(), $note);

        $note->update([
            'is_pinned' => !$note->is_pinned,
            'pinned_at' => !$note->is_pinned ? now() : null,
        ]);

        return response()->json(['data' => $note]);
    }

    /**
     * Upload ảnh cho ghi chú
     */
    public function uploadImage(Request $request, Note $note)
    {
        $this->authorizeNote($request->user(), $note);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,gif,webp|max:5120', // 5MB
        ]);

        $file = $request->file('image');
        $path = $file->store('note-images/' . $note->id, 'public');

        $image = NoteImage::create([
            'note_id' => $note->id,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json([
            'message' => 'Đã tải ảnh lên',
            'data' => array_merge($image->toArray(), ['url' => $image->url]),
        ], 201);
    }

    /**
     * Xóa ảnh
     */
    public function deleteImage(Request $request, Note $note, NoteImage $image)
    {
        $this->authorizeNote($request->user(), $note);

        if ($image->note_id !== $note->id) {
            abort(403);
        }

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Đã xóa ảnh']);
    }

    /**
     * Đặt mật khẩu cho ghi chú
     */
    public function setPassword(Request $request, Note $note)
    {
        $this->authorizeNote($request->user(), $note, true);

        $request->validate([
            'password' => 'required|confirmed|min:4',
        ], [
            'password.confirmed' => 'Mật khẩu xác nhận không khớp',
        ]);

        $note->update([
            'has_password' => true,
            'note_password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Đã bật bảo vệ mật khẩu']);
    }

    /**
     * Xác minh mật khẩu ghi chú
     */
    public function verifyPassword(Request $request, Note $note)
    {
        $request->validate(['password' => 'required']);

        if (!$note->has_password) {
            return response()->json(['message' => 'Ghi chú không có mật khẩu'], 422);
        }

        if (!Hash::check($request->password, $note->note_password)) {
            return response()->json(['message' => 'Mật khẩu không đúng'], 422);
        }

        // Store verified state in session
        session(["note_verified_{$note->id}" => true]);

        return response()->json(['message' => 'Xác minh thành công']);
    }

    /**
     * Đổi mật khẩu ghi chú
     */
    public function changePassword(Request $request, Note $note)
    {
        $this->authorizeNote($request->user(), $note, true);

        $request->validate([
            'current_password' => 'required',
            'password' => 'required|confirmed|min:4',
        ]);

        if (!Hash::check($request->current_password, $note->note_password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng'], 422);
        }

        $note->update([
            'note_password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Đã đổi mật khẩu ghi chú']);
    }

    /**
     * Tắt bảo vệ mật khẩu
     */
    public function removePassword(Request $request, Note $note)
    {
        $this->authorizeNote($request->user(), $note, true);

        $request->validate(['password' => 'required']);

        if (!Hash::check($request->password, $note->note_password)) {
            return response()->json(['message' => 'Mật khẩu không đúng'], 422);
        }

        $note->update([
            'has_password' => false,
            'note_password' => null,
        ]);

        return response()->json(['message' => 'Đã tắt bảo vệ mật khẩu']);
    }

    /**
     * Kiểm tra quyền truy cập ghi chú
     */
    private function authorizeNote($user, $note, $ownerOnly = false)
    {
        // Owner
        if ($note->user_id === $user->id) {
            return true;
        }

        // Shared note with edit permission
        if (!$ownerOnly) {
            $share = $note->shares()->where('shared_with_id', $user->id)->first();
            if ($share && $share->permission === 'edit') {
                return true;
            }
            if ($share && $share->permission === 'read') {
                return true;
            }
        }

        abort(403, 'Bạn không có quyền truy cập ghi chú này');
    }
}
