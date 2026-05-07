#!/bin/bash
# Noteori - Docker Setup Script
# Usage: ./setup.sh

set -e

echo "🚀 Setting up Noteori..."

# Copy .env if not exists
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
fi

# Create storage directories
mkdir -p backend/storage/app/public/avatars
mkdir -p backend/storage/app/public/note-images
mkdir -p backend/storage/framework/cache
mkdir -p backend/storage/framework/sessions
mkdir -p backend/storage/framework/views
mkdir -p backend/storage/logs
mkdir -p backend/bootstrap/cache
echo "✅ Created storage directories"

# Build and start containers
echo "🐳 Building Docker containers..."
docker-compose build
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL..."
sleep 10

# Install Composer dependencies
echo "📦 Installing PHP dependencies..."
docker-compose exec php composer install

# Generate app key
echo "🔑 Generating app key..."
docker-compose exec php php artisan key:generate

# Run migrations
echo "🗃️ Running migrations..."
docker-compose exec php php artisan migrate --force

# Create storage link
echo "🔗 Creating storage link..."
docker-compose exec php php artisan storage:link

# Clear caches
echo "🧹 Clearing caches..."
docker-compose exec php php artisan config:clear
docker-compose exec php php artisan cache:clear

echo ""
echo "✅ Noteori is ready!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 API: http://localhost/api"
echo "📊 MySQL: localhost:3306"
echo ""
