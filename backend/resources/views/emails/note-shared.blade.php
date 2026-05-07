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
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-read { background: #dbeafe; color: #1d4ed8; }
        .badge-edit { background: #dcfce7; color: #15803d; }
        .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><h1>📝 Noteori</h1></div>
        <h2>Bạn nhận được một ghi chú được chia sẻ!</h2>
        <p><strong>{{ $ownerName }}</strong> đã chia sẻ ghi chú <strong>"{{ $noteTitle }}"</strong> với bạn.</p>
        <p>
            Quyền truy cập:
            @if($permission === 'edit')
                <span class="badge badge-edit">✏️ Chỉnh sửa</span>
            @else
                <span class="badge badge-read">👁️ Chỉ đọc</span>
            @endif
        </p>
        <a href="{{ config('app.url') }}/ghi-chu-duoc-chia-se" class="btn">Xem ghi chú</a>
        <div class="footer">
            <p>Email này được gửi từ Noteori. Nếu bạn không mong đợi email này, vui lòng bỏ qua.</p>
        </div>
    </div>
</body>
</html>
