#!/bin/bash
# Noteori - Production Deployment Script
# Usage: ./deploy-prod.sh yourdomain.com your@email.com

if [ "$#" -ne 2 ]; then
    echo "Usage: ./deploy-prod.sh <domain> <email>"
    echo "Example: ./deploy-prod.sh noteori.com admin@noteori.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "🚀 Deploying Noteori to Production on $DOMAIN..."

# Create necessary directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Replace domain in Nginx config
sed -i "s/\${DOMAIN}/$DOMAIN/g" docker/nginx/prod.conf

# Initial Nginx startup (without SSL) to get certs
echo "🌐 Starting Nginx for ACME challenge..."
docker-compose -f docker-compose.prod.yml up -d nginx

# Get SSL certificate
echo "🔒 Requesting Let's Encrypt SSL Certificate..."
docker-compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot

# Download recommended SSL configs
echo "📥 Downloading Let's Encrypt recommended configs..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nodejs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem

# Restart all services with SSL
echo "🔄 Restarting all services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run Laravel setup
echo "⚙️ Running Laravel setup..."
docker-compose -f docker-compose.prod.yml exec php composer install --no-dev --optimize-autoloader
docker-compose -f docker-compose.prod.yml exec php php artisan key:generate --force
docker-compose -f docker-compose.prod.yml exec php php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec php php artisan storage:link
docker-compose -f docker-compose.prod.yml exec php php artisan config:cache
docker-compose -f docker-compose.prod.yml exec php php artisan route:cache
docker-compose -f docker-compose.prod.yml exec php php artisan view:cache

echo "✅ Production deployment complete! Your app is live at https://$DOMAIN"
