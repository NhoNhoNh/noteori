<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    /**
     * Đăng ký tài khoản mới
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'name.required' => 'Vui lòng nhập tên hiển thị',
            'email.required' => 'Vui lòng nhập email',
            'email.unique' => 'Email đã được sử dụng',
            'password.required' => 'Vui lòng nhập mật khẩu',
            'password.confirmed' => 'Mật khẩu xác nhận không khớp',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create default preferences
        UserPreference::create(['user_id' => $user->id]);

        // Send verification email
        $user->sendEmailVerificationNotification();

        // Auto login after registration
        $token = $user->createToken('noteori')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Đăng nhập
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'email.required' => 'Vui lòng nhập email',
            'password.required' => 'Vui lòng nhập mật khẩu',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không đúng',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('noteori')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Đăng xuất
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất',
        ]);
    }

    /**
     * Lấy thông tin user hiện tại
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('preferences');

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * Quên mật khẩu - gửi email
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Email không tồn tại trong hệ thống',
        ]);

        // Generate OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($otp),
                'otp' => $otp,
                'created_at' => now(),
            ]
        );

        // Send reset email with link and OTP
        $status = Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'Đã gửi liên kết đặt lại mật khẩu qua email',
        ]);
    }

    /**
     * Xác minh OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $record = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || $record->otp !== $request->otp) {
            return response()->json(['message' => 'OTP không hợp lệ'], 422);
        }

        // Check expiry (60 minutes)
        if (now()->diffInMinutes($record->created_at) > 60) {
            return response()->json(['message' => 'OTP đã hết hạn'], 422);
        }

        return response()->json([
            'message' => 'OTP hợp lệ',
            'data' => ['token' => $record->token],
        ]);
    }

    /**
     * Đặt lại mật khẩu
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                // Revoke all tokens
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Đặt lại mật khẩu thành công']);
        }

        return response()->json(['message' => 'Không thể đặt lại mật khẩu'], 422);
    }

    /**
     * Xác minh email
     */
    public function verifyEmail($id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'Liên kết không hợp lệ'], 422);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return response()->json(['message' => 'Email đã được xác minh']);
    }

    /**
     * Gửi lại email xác minh
     */
    public function resendVerification(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email đã được xác minh rồi']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Đã gửi lại email xác minh']);
    }
}
