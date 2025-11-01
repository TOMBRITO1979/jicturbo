#!/bin/bash
set -e

# JICTurbo Build Script
# This script only builds and pushes Docker images without deploying

echo "=========================================="
echo "  JICTurbo CRM - Build Script"
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
if [ -z "$DOCKER_USERNAME" ]; then
    echo "❌ Error: DOCKER_USERNAME is not set in .env"
    exit 1
fi

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Error: BACKEND_URL is not set in .env"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Display configuration
echo "📝 Configuration:"
echo "  Backend API URL: $BACKEND_URL"
echo "  Docker Username: $DOCKER_USERNAME"
echo ""

# Build backend
echo "🏗️  Building backend..."
docker build --no-cache -t ${DOCKER_USERNAME}/jicturbo-backend:latest ./backend
echo "✅ Backend built successfully"

# Build frontend with API URL
echo ""
echo "🏗️  Building frontend with API URL: $BACKEND_URL"
docker build --no-cache \
    --build-arg VITE_API_URL=$BACKEND_URL \
    -t ${DOCKER_USERNAME}/jicturbo-frontend:latest ./frontend
echo "✅ Frontend built successfully"

# Push images to Docker Hub
if [ -n "$DOCKER_HUB_TOKEN" ]; then
    echo ""
    echo "🚀 Logging into Docker Hub..."
    echo $DOCKER_HUB_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin

    echo "📤 Pushing backend image..."
    docker push ${DOCKER_USERNAME}/jicturbo-backend:latest
    echo "✅ Backend image pushed"

    echo "📤 Pushing frontend image..."
    docker push ${DOCKER_USERNAME}/jicturbo-frontend:latest
    echo "✅ Frontend image pushed"
else
    echo ""
    echo "⚠️  DOCKER_HUB_TOKEN not set, skipping push to Docker Hub"
    echo ""
    read -p "Push images manually? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Logging into Docker Hub..."
        docker login -u $DOCKER_USERNAME

        echo "📤 Pushing backend image..."
        docker push ${DOCKER_USERNAME}/jicturbo-backend:latest

        echo "📤 Pushing frontend image..."
        docker push ${DOCKER_USERNAME}/jicturbo-frontend:latest
    fi
fi

echo ""
echo "=========================================="
echo "  ✅ Build Complete!"
echo "=========================================="
echo ""
echo "Images built:"
echo "  ${DOCKER_USERNAME}/jicturbo-backend:latest"
echo "  ${DOCKER_USERNAME}/jicturbo-frontend:latest"
echo ""
echo "To deploy, run:"
echo "  ./deploy.sh"
echo ""
echo "Or update specific service:"
echo "  docker service update --image ${DOCKER_USERNAME}/jicturbo-backend:latest --force jicturbo_backend"
echo "  docker service update --image ${DOCKER_USERNAME}/jicturbo-frontend:latest --force jicturbo_frontend"
echo ""
