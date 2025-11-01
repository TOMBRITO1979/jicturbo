#!/bin/bash
set -e

# JICTurbo Deployment Script
# This script builds and deploys the JICTurbo CRM to Docker Swarm

echo "=========================================="
echo "  JICTurbo CRM - Deployment Script"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your settings:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

# Validate required variables
REQUIRED_VARS=(
    "DOCKER_USERNAME"
    "BACKEND_URL"
    "FRONTEND_URL"
    "FRONTEND_DOMAIN"
    "BACKEND_DOMAIN"
    "POSTGRES_PASSWORD"
    "JWT_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required variable $var is not set in .env"
        exit 1
    fi
done

echo "✅ Environment variables loaded"
echo ""

# Display configuration
echo "📝 Configuration:"
echo "  Frontend Domain: $FRONTEND_DOMAIN"
echo "  Backend Domain:  $BACKEND_DOMAIN"
echo "  Backend API URL: $BACKEND_URL"
echo "  Docker Username: $DOCKER_USERNAME"
echo ""

# Ask for confirmation
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Check if network exists
echo "🌐 Checking Docker network..."
if ! docker network ls | grep -q "network_public"; then
    echo "Creating network_public..."
    docker network create --driver overlay network_public
fi

# Build backend
echo ""
echo "🏗️  Building backend..."
docker build --no-cache -t ${DOCKER_USERNAME}/jicturbo-backend:latest ./backend

# Build frontend with API URL
echo ""
echo "🏗️  Building frontend with API URL: $BACKEND_URL"
docker build --no-cache \
    --build-arg VITE_API_URL=$BACKEND_URL \
    -t ${DOCKER_USERNAME}/jicturbo-frontend:latest ./frontend

# Push images to Docker Hub (if DOCKER_HUB_TOKEN is set)
if [ -n "$DOCKER_HUB_TOKEN" ]; then
    echo ""
    echo "🚀 Logging into Docker Hub..."
    echo $DOCKER_HUB_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin

    echo "📤 Pushing backend image..."
    docker push ${DOCKER_USERNAME}/jicturbo-backend:latest

    echo "📤 Pushing frontend image..."
    docker push ${DOCKER_USERNAME}/jicturbo-frontend:latest
else
    echo ""
    echo "⚠️  DOCKER_HUB_TOKEN not set, skipping push to Docker Hub"
    echo "Images are built locally and ready for local deployment"
fi

# Deploy to Swarm
echo ""
echo "🚢 Deploying to Docker Swarm..."
docker stack deploy -c docker-compose.yml jicturbo

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Show service status
echo ""
echo "📊 Service Status:"
docker stack services jicturbo

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
sleep 10  # Wait for backend to be fully ready

BACKEND_CONTAINER=$(docker ps -q -f name=jicturbo_backend | head -n 1)
if [ -n "$BACKEND_CONTAINER" ]; then
    echo "Running Prisma migrations..."
    docker exec $BACKEND_CONTAINER npx prisma migrate deploy
    echo "✅ Migrations completed"
else
    echo "⚠️  Backend container not found. Run migrations manually:"
    echo "  docker exec \$(docker ps -q -f name=jicturbo_backend | head -n 1) npx prisma migrate deploy"
fi

echo ""
echo "=========================================="
echo "  ✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application should be available at:"
echo "  Frontend: https://$FRONTEND_DOMAIN"
echo "  Backend:  https://$BACKEND_DOMAIN"
echo ""
echo "To view logs:"
echo "  docker service logs jicturbo_backend -f"
echo "  docker service logs jicturbo_frontend -f"
echo ""
echo "To check service status:"
echo "  docker stack services jicturbo"
echo "  docker stack ps jicturbo"
echo ""
