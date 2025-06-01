# Docker Examples for Video Converter

## Quick Start

1. **Make sure Docker Desktop is running**
2. **Build the image:**
   ```bash
   docker build -t video-converter .
   ```

3. **Run with your video folder:**
   ```bash
   # Windows PowerShell
   docker run -v "${PWD}\videos:/app/videos" video-converter
   
   # Windows Command Prompt
   docker run -v "%cd%\videos:/app/videos" video-converter
   
   # Linux/Mac
   docker run -v "$(pwd)/videos:/app/videos" video-converter
   ```

## Advanced Usage

### Custom Video Folder Location
```bash
# Mount a different folder
docker run -v "C:\MyVideos:/app/videos" video-converter

# Linux/Mac example
docker run -v "/home/user/Videos:/app/videos" video-converter
```

### Run with Custom Input Folder Inside Container
```bash
# If you mount to a different location in the container
docker run -v "C:\MyVideos:/app/input" video-converter bun run index.ts /app/input
```

### Interactive Mode (See Real-time Output)
```bash
docker run -it -v "${PWD}\videos:/app/videos" video-converter
```

### Run in Background
```bash
docker run -d --name video-converter-job -v "${PWD}\videos:/app/videos" video-converter
# Check logs
docker logs video-converter-job
# Remove when done
docker rm video-converter-job
```

## Docker Compose Examples

### Basic Usage
```yaml
version: '3.8'
services:
  video-converter:
    build: .
    volumes:
      - ./videos:/app/videos
```

### Multiple Folders
```yaml
version: '3.8'
services:
  video-converter:
    build: .
    volumes:
      - ./videos:/app/videos
      - C:\Additional\Videos:/app/extra
    command: ["bun", "run", "index.ts", "/app/videos"]
```

### With Environment Variables
```yaml
version: '3.8'
services:
  video-converter:
    build: .
    volumes:
      - ./videos:/app/videos
    environment:
      - NODE_ENV=production
      - DEFAULT_FOLDER=/app/videos
```

## Building and Managing Images

### Build Image
```bash
docker build -t video-converter .
```

### Build with No Cache
```bash
docker build --no-cache -t video-converter .
```

### Remove Image
```bash
docker rmi video-converter
```

### View Image Size
```bash
docker images video-converter
```

## Tips

- **Volume Mounting**: Always use absolute paths for volume mounting
- **File Permissions**: The container runs as root, so output files will be owned by root
- **Performance**: Docker containers may be slightly slower than native execution
- **Storage**: Make sure you have enough disk space for both input and output files
