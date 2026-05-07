<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use Illuminate\Http\Request;

class PreferenceController extends Controller
{
    public function show(Request $request)
    {
        $prefs = $request->user()->preferences;
        if (!$prefs) {
            $prefs = UserPreference::create(['user_id' => $request->user()->id]);
        }
        return response()->json(['data' => $prefs]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'theme' => 'nullable|in:light,dark',
            'font_size' => 'nullable|in:small,medium,large',
            'note_color' => 'nullable|string|max:20',
            'layout_mode' => 'nullable|in:grid,list',
        ]);

        $prefs = $request->user()->preferences;
        if (!$prefs) {
            $prefs = UserPreference::create(['user_id' => $request->user()->id]);
        }

        $prefs->update($request->only(['theme', 'font_size', 'note_color', 'layout_mode']));

        return response()->json(['data' => $prefs]);
    }
}
