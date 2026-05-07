<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Label;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(Request $request)
    {
        $labels = Label::where('user_id', $request->user()->id)
            ->withCount('notes')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $labels]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'nullable|string|max:7',
        ], [
            'name.required' => 'Vui lòng nhập tên nhãn',
        ]);

        // Check duplicate
        $exists = Label::where('user_id', $request->user()->id)
            ->where('name', $request->name)->exists();
        if ($exists) {
            return response()->json(['message' => 'Nhãn đã tồn tại'], 422);
        }

        $label = Label::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'color' => $request->color,
        ]);

        return response()->json(['data' => $label], 201);
    }

    public function update(Request $request, Label $label)
    {
        if ($label->user_id !== $request->user()->id) abort(403);

        $request->validate(['name' => 'required|string|max:50']);

        $label->update(['name' => $request->name]);

        return response()->json(['data' => $label]);
    }

    public function destroy(Request $request, Label $label)
    {
        if ($label->user_id !== $request->user()->id) abort(403);

        // Detach from notes but don't delete notes
        $label->notes()->detach();
        $label->delete();

        return response()->json(['message' => 'Đã xóa nhãn']);
    }

    /**
     * Gắn nhãn cho ghi chú
     */
    public function attachToNote(Request $request, $noteId)
    {
        $request->validate(['label_ids' => 'present|array']);

        $note = $request->user()->notes()->findOrFail($noteId);
        $note->labels()->sync($request->label_ids);

        return response()->json(['message' => 'Đã cập nhật nhãn']);
    }
}
