@echo off
echo Testing Video Converter Docker Setup
echo ====================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running or not installed
    echo Please start Docker Desktop and try again
    exit /b 1
)

echo ✅ Docker is running

REM Check if image exists
docker images | findstr "video-converter" >nul
if %errorlevel% neq 0 (
    echo 📦 Building video-converter image...
    docker build -t video-converter .
    if %errorlevel% neq 0 (
        echo ❌ Failed to build image
        exit /b 1
    )
    echo ✅ Image built successfully
) else (
    echo ✅ video-converter image found
)

REM Test run with dry-run
echo 🧪 Testing container startup...
docker run --rm video-converter echo "Container test successful"
if %errorlevel% neq 0 (
    echo ❌ Container failed to start
    exit /b 1
)

echo ✅ Container can start successfully
echo.
echo 🎉 Docker setup is working correctly!
echo.
echo To run the video converter:
echo   docker run -v "%cd%\videos:/app/videos" video-converter
echo.
echo Or use docker-compose:
echo   docker-compose up
