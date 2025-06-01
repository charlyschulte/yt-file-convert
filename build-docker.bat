@echo off
REM Build the Docker image
echo Building video converter Docker image...
docker build -t video-converter .

echo Build complete! You can now run the container with:
echo   docker-compose up
echo   or
echo   docker run -v "%cd%\videos:/app/videos" video-converter
