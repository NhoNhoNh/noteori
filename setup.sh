#!/bin/bash

echo "🚀 Khởi tạo dự án Noteori..."

echo "1. Khởi chạy Docker containers..."
docker compose up -d

echo "2. Copy file .env cho Backend..."
docker compose exec php cp .env.example .env

echo "3. Cài đặt thư viện PHP (Composer)..."
docker compose exec php composer install

echo "4. Tạo khóa bảo mật (APP_KEY)..."
docker compose exec php php artisan key:generate

echo "5. Chạy database migrations và tạo dữ liệu mẫu..."
docker compose exec php php artisan migrate --seed

echo "6. Tạo storage link..."
docker compose exec php php artisan storage:link

echo "✅ Hoàn tất! Frontend đang chạy tại http://localhost:5173"
echo "Tài khoản mẫu: admin@noteori.local / password"
