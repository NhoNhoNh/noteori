<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\LabelController;
use App\Http\Controllers\Api\ShareController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PreferenceController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes - Noteori
|--------------------------------------------------------------------------
*/

// ===== Auth (Guest) =====
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:10,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:3,1');
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->name('verification.verify');
});

// ===== Protected Routes =====
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // Preferences
    Route::get('/preferences', [PreferenceController::class, 'show']);
    Route::put('/preferences', [PreferenceController::class, 'update']);

    // Notes
    Route::get('/notes/shared-with-me', [ShareController::class, 'sharedWithMe']);
    Route::apiResource('notes', NoteController::class);
    Route::patch('/notes/{note}/toggle-pin', [NoteController::class, 'togglePin']);

    // Note Images
    Route::post('/notes/{note}/images', [NoteController::class, 'uploadImage']);
    Route::delete('/notes/{note}/images/{image}', [NoteController::class, 'deleteImage']);

    // Note Password
    Route::post('/notes/{note}/password', [NoteController::class, 'setPassword']);
    Route::post('/notes/{note}/verify-password', [NoteController::class, 'verifyPassword']);
    Route::put('/notes/{note}/password', [NoteController::class, 'changePassword']);
    Route::delete('/notes/{note}/password', [NoteController::class, 'removePassword']);

    // Note Sharing
    Route::post('/notes/{note}/share', [ShareController::class, 'share']);
    Route::get('/notes/{note}/share', [ShareController::class, 'getShareDetails']);
    Route::put('/notes/{note}/share/{share}', [ShareController::class, 'updateShare']);
    Route::delete('/notes/{note}/share/{share}', [ShareController::class, 'revokeShare']);

    // Labels
    Route::apiResource('labels', LabelController::class);
    Route::post('/notes/{note}/labels', [LabelController::class, 'attachToNote']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
