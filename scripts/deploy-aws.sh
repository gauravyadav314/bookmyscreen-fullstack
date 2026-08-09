#!/bin/bash
set -e

echo "🚀 Starting AWS Production Deployment for bookMyScreen..."

# 1. Ensure Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# 2. Build and launch production Docker containers
echo "📦 Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Wait for services to be ready
echo "⏳ Waiting for MongoDB and Backend services to initialize..."
sleep 10

# 4. Seed Database (Theaters, Movies, Shows)
echo "🌱 Seeding database (theaters, movies, showtimes)..."
docker exec -it bms_backend_prod npm run seed:theaters || true
docker exec -it bms_backend_prod npm run seed:movies || true
docker exec -it bms_backend_prod npm run seed:shows || true

echo "✅ AWS Deployment Completed Successfully!"
echo "🌐 App is accessible at: http://$(curl -s http://checkip.amazonaws.com || echo 'your-ec2-ip')"
