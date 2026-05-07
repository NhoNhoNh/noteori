<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f1f5f9; padding: 40px 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .logo { text-align: center; margin-bottom: 24px; }
        .logo h1 { font-size: 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h2 { font-size: 18px; color: #0f172a; margin-bottom: 12px; }
        p { color: #475569; line-height: 1.6; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        .otp { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #6366f1; text-align: center; margin: 24px 0; padding: 16px; background: #f1f5f9; border-radius: 8px; }
        .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><h1>📝 Noteori</h1></div>
        <h2>Đặt lại mật khẩu</h2>
        <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>

        @if(isset($otp))
        <p>Mã OTP của bạn:</p>
        <div class="otp">{{ $otp }}</div>
        <p>Mã này có hiệu lực trong 60 phút.</p>
        @endif

        <p>Hoặc nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
        <a href="{{ $resetUrl }}" class="btn">Đặt lại mật khẩu</a>

        <div class="footer">
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <p>Liên kết sẽ hết hạn sau 60 phút.</p>
        </div>
    </div>
</body>
</html>
