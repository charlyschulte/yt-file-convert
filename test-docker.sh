#!/bin/bash

echo "Testing Video Converter Docker Setup"
echo "===================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running or not installed"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"

# Check if image exists
if docker images | grep -q "video-converter"; then
    echo "✅ video-converter image found"
else
    echo "📦 Building video-converter image..."
    if docker build -t video-converter .; then
        echo "✅ Image built successfully"
    else
        echo "❌ Failed to build image"
        exit 1
    fi
fi

# Test run with dry-run (just check if container starts)
echo "🧪 Testing container startup..."
if docker run --rm video-converter echo "Container test successful"; then
    echo "✅ Container can start successfully"
else
    echo "❌ Container failed to start"
    exit 1
fi

echo ""
echo "🎉 Docker setup is working correctly!"
echo ""
echo "To run the video converter:"
echo "  docker run -v \"\$(pwd)/videos:/app/videos\" video-converter"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up"
