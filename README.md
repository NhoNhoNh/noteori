# Noteori - Note Management Web Application

## 📝 Giới Thiệu

Noteori là ứng dụng quản lý ghi chú thông minh được xây dựng với React + Laravel 11, hỗ trợ realtime collaboration, offline (PWA), và triển khai Docker.

## 🛠️ Công Nghệ

| Layer | Stack |
|-------|-------|
| Frontend | React, Vite, Bootstrap 5, React Icons |
| Backend | PHP 8.3, Laravel 11, Sanctum |
| Database | MySQL 8, Redis |
| Realtime | Laravel Reverb (WebSocket) |
| Offline | PWA, Service Worker, IndexedDB |
| Deploy | Docker Compose, Nginx |

## 🚀 Cài Đặt

### Yêu Cầu
- Docker & Docker Compose
- Node.js 20+ (cho development)

### Chạy Bằng Docker (Khuyên dùng)

```bash
# Clone project
git clone <repo-url> noteori
cd noteori

# Setup tự động
chmod +x setup.sh
./setup.sh
```

### Chạy Thủ Công

```bash
# 1. Start Docker
docker compose up -d

# 2. Copy .env cho Backend
docker compose exec php cp .env.example .env

# 3. Install dependencies
docker compose exec php composer install

# 4. Setup Laravel
docker compose exec php php artisan key:generate
docker compose exec php php artisan migrate --seed
docker compose exec php php artisan storage:link
```

### Truy Cập
- 🌐 **Frontend**: http://localhost:5173
- 🔌 **API**: http://localhost/api
- 📊 **MySQL**: localhost:3306 (user: noteori_user, pass: noteori_secret)

### Tài Khoản Mẫu
Sau khi cài đặt xong (đã chạy migration và seed), bạn có thể đăng nhập ngay với tài khoản:
- **Email**: `admin@noteori.local`
- **Mật khẩu**: `password`

## 📂 Cấu Trúc

```
noteori/
├── docker-compose.yml      # 7 Docker services
├── docker/                 # Docker configs
├── frontend/               # React + Vite
│   └── src/
│       ├── components/     # UI components
│       ├── contexts/       # React context (Auth, Theme, Note)
│       ├── layouts/        # App layouts
│       ├── pages/          # Route pages
│       └── services/       # API, WebSocket, PWA, IndexedDB
└── backend/                # Laravel 11
    ├── app/
    │   ├── Models/         # Eloquent models
    │   ├── Http/Controllers/Api/  # API controllers
    │   ├── Events/         # WebSocket events
    │   ├── Jobs/           # Queue jobs
    │   └── Mail/           # Email templates
    ├── config/             # App configuration
    ├── database/migrations/ # Database schema
    └── routes/             # API + channel routes
```

## ✨ Tính Năng

### Quản Lý Tài Khoản
- Đăng ký / Đăng nhập / Đăng xuất
- Kích hoạt tài khoản qua email
- Đặt lại mật khẩu (email + OTP)
- Hồ sơ + ảnh đại diện
- Tùy chỉnh (dark/light mode, font size, màu ghi chú)

### Quản Lý Ghi Chú
- Tạo / sửa / xóa ghi chú
- Auto-save (không cần nút Lưu)
- Grid view / List view
- Ghim ghi chú
- Đính kèm hình ảnh
- Tìm kiếm realtime (debounce 300ms)

### Nhãn
- CRUD nhãn
- Gắn nhãn cho ghi chú (many-to-many)
- Lọc ghi chú theo nhãn

### Bảo Vệ Mật Khẩu
- Khóa ghi chú bằng mật khẩu riêng
- Xác minh trước khi xem/sửa/xóa
- Đổi / tắt mật khẩu (yêu cầu xác nhận)

### Chia Sẻ
- Chia sẻ ghi chú qua email
- Quyền chỉ đọc / chỉnh sửa
- Quản lý người nhận
- Thu hồi quyền truy cập
- Thông báo email + in-app

### Realtime Collaboration
- Đồng chỉnh sửa qua WebSocket
- Chỉ báo đang gõ
- Hiển thị người đang online

### PWA & Offline
- Service Worker caching
- IndexedDB local storage
- Xem ghi chú khi offline

## 📜 License
MIT
