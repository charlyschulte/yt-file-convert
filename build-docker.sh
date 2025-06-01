#!/bin/bash

# Build the Docker image
echo "Building video converter Docker image..."
docker build -t video-converter .

echo "Build complete! You can now run the container with:"
echo "  docker-compose up"
echo "  or"
echo "  docker run -v /path/to/your/videos:/app/videos video-converter"
