# Video File Converter

A TypeScript-based video conversion tool that automatically converts `.braw` and ProRes `.mov` files to MP4 format using FFmpeg.

[![Docker](https://github.com/yourusername/yt-file-convert/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/yourusername/yt-file-convert/actions/workflows/docker-publish.yml)

## 🚀 Quick Start with Pre-built Docker Image

The easiest way to use this tool is with the pre-built Docker image from GitHub Container Registry:

```bash
# Pull the latest image from GitHub Container Registry
docker pull ghcr.io/yourusername/yt-file-convert:latest

# Run with your video folder (Windows)
docker run --rm -v "C:\Users\YourName\Videos:/app/videos" ghcr.io/yourusername/yt-file-convert:latest

# Run with your video folder (macOS/Linux)
docker run --rm -v "/path/to/your/videos:/app/videos" ghcr.io/yourusername/yt-file-convert:latest
```

**Available Tags:**
- `latest` - Latest stable version from main branch
- `v1.0.0`, `v1.1.0`, etc. - Specific version releases
- `main` - Latest development version

## Features

- 🎬 **Automatic file detection**: Recursively scans folders and subfolders for `.braw` and `.mov` files
- 🔍 **ProRes validation**: Only converts `.mov` files that are in ProRes format
- ⚡ **Batch processing**: Converts multiple files in sequence
- ✅ **File verification**: Validates that converted MP4 files are intact and playable
- 📊 **Progress reporting**: Shows detailed progress, file discovery, and final summary
- 🎯 **In-place conversion**: Converted files are saved in the same folder as the original files
- 📁 **Recursive scanning**: Automatically finds video files in all subdirectories

## Prerequisites

### For Local Installation
- [Bun](https://bun.sh) runtime
- [FFmpeg](https://ffmpeg.org) installed and available in PATH
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html#build-windows) or use `winget install FFmpeg`
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg` (Ubuntu/Debian) or equivalent

### For Docker Installation (Recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- No other dependencies needed (FFmpeg included in container)

## Installation

### Option 1: Local Installation
```bash
bun install
```

### Option 2: Docker (Recommended)
Using Docker ensures FFmpeg and all dependencies are properly installed:

```bash
# Build the Docker image
docker build -t video-converter .

# Or use the helper script
# Windows:
build-docker.bat
# Linux/Mac:
./build-docker.sh
```

📖 **For detailed Docker usage examples, see [DOCKER.md](DOCKER.md)**

## Usage

### Docker Usage (Recommended)

#### Option 1: Using Pre-built Image from GitHub Container Registry
```bash
# Use the latest published image
docker run --rm -v "/path/to/your/videos:/app/videos" ghcr.io/yourusername/yt-file-convert:latest

# Windows example
docker run --rm -v "C:\Users\YourName\Videos:/app/videos" ghcr.io/yourusername/yt-file-convert:latest

# Linux/Mac example
docker run --rm -v "/Users/yourname/Videos:/app/videos" ghcr.io/yourusername/yt-file-convert:latest
```

#### Option 2: Using Docker Compose with Pre-built Image
Update your `docker-compose.yml` to use the published image:
```yaml
version: '3.8'
services:
  video-converter:
    image: ghcr.io/yourusername/yt-file-convert:latest
    volumes:
      - ./videos:/app/videos
```

Then run:
```bash
docker-compose up
```

#### Option 3: Building Locally
```bash
# Build your own image
docker build -t video-converter .

# Windows
docker run -v "%cd%\videos:/app/videos" video-converter

# Linux/Mac  
docker run -v "$(pwd)/videos:/app/videos" video-converter

# With custom folder
docker run -v "/path/to/your/videos:/app/videos" video-converter
```

### Local Usage

### Default Folder Configuration

You can configure the default input folder by editing the `DEFAULT_INPUT_FOLDER` variable at the top of `index.ts`:

```typescript
const DEFAULT_INPUT_FOLDER = './videos'; // Change this to your default input folder
```

### Running the Script

#### Use Default Folder
```bash
bun run index.ts
```

#### Specify Custom Folder
```bash
bun run index.ts <input-folder>
```

### Examples

Convert files using the default folder (as configured in `index.ts`):
```bash
bun run index.ts
```

Convert files from a specific directory:
```bash
bun run index.ts ./my-videos
```

Convert files from an absolute path:
```bash
bun run index.ts "C:\Videos\Raw Footage"
```

**Note**: Converted MP4 files will be saved in the same folder as the original files.

## Folder Structure

The script recursively scans the input folder and all its subfolders for video files. For example, with this folder structure:

```
videos/
├── clip1.braw
├── Project1/
│   ├── Raw/
│   │   ├── footage1.mov
│   │   └── footage2.braw
│   └── Processed/
├── Project2/
│   └── Raw/
│       └── prores_clip.mov
└── backup.mov
```

The script will find and process:
- `videos/clip1.braw`
- `videos/Project1/Raw/footage1.mov` (if ProRes)
- `videos/Project1/Raw/footage2.braw`
- `videos/Project2/Raw/prores_clip.mov` (if ProRes)
- `videos/backup.mov` (if ProRes)

And create MP4 files in the same directories as the source files.

## Supported File Types

- **`.braw`**: Blackmagic RAW files (converted directly)
- **`.mov`**: QuickTime files (only ProRes variants are converted)
  - ProRes 422
  - ProRes 422 HQ
  - ProRes 422 LT
  - ProRes 422 Proxy
  - ProRes 4444
  - ProRes 4444 XQ

## Conversion Settings

The script uses optimized FFmpeg settings for high-quality MP4 output:

- **Video Codec**: H.264 (libx264)
- **Preset**: Medium (balance of speed vs compression)
- **Quality**: CRF 23 (visually lossless for most content)
- **Audio Codec**: AAC at 128kbps
- **Optimization**: Web-optimized with faststart flag

## Output

The script provides detailed console output including:

- File processing status
- ProRes format detection results
- Conversion progress
- File verification results
- Final summary with statistics

### Example Output
```
Starting conversion process for folder: ./videos

Processing: ./videos/clip001.braw
  🔄 Converting to: clip001.mp4
  ✓ Conversion completed
  ✓ File verification passed

Processing: ./videos/clip002.mov
  ✓ ProRes format detected
  🔄 Converting to: clip002.mp4
  ✓ Conversion completed
  ✓ File verification passed

Processing: ./videos/clip003.mov
  ⏭ Not ProRes format, skipping

==================================================
CONVERSION SUMMARY
==================================================
Total files processed: 3
Successfully converted: 2
Verified as working: 2
Failed conversions: 0

Successful conversions:
  ✓ clip001.braw → clip001.mp4
  ✓ clip002.mov → clip002.mp4
```

## File Verification

After each conversion, the script automatically verifies the output MP4 file by:

1. Using FFprobe to check file integrity
2. Counting video packets to ensure the file is not corrupted
3. Reporting verification status in the summary

Files marked with `⚠` in the summary converted successfully but failed verification.

## Error Handling

The script handles various error conditions:

- Missing or inaccessible input folders
- FFmpeg/FFprobe not found in PATH
- Corrupted or unreadable input files
- Insufficient disk space during conversion
- Invalid ProRes detection

## Development

This project was created using Bun and TypeScript with strict type checking enabled.

### Project Structure
```
├── .github/
│   └── workflows/
│       └── docker-publish.yml  # GitHub Actions workflow for Docker publishing
├── index.ts                    # Main entry point with configuration
├── VideoConverter.ts           # Video conversion logic and utilities
├── Dockerfile                  # Docker image configuration
├── docker-compose.yml          # Docker Compose configuration
├── .dockerignore               # Docker ignore file
├── build-docker.sh             # Linux/Mac build script
├── build-docker.bat            # Windows build script
├── setup-github.sh             # Linux/Mac GitHub setup script
├── setup-github.bat            # Windows GitHub setup script
├── package.json                # Project dependencies
├── tsconfig.json               # TypeScript configuration
├── README.md                   # This file
├── DOCKER.md                   # Detailed Docker usage guide
└── DEPLOYMENT.md               # GitHub deployment guide
```

### Docker Benefits

- **No local FFmpeg installation required**: FFmpeg is included in the container
- **Consistent environment**: Same behavior across different operating systems
- **Easy deployment**: Container can be run anywhere Docker is available
- **Isolated dependencies**: No conflicts with other software on your system

## Troubleshooting

### Docker Issues
- **"docker: command not found"**: Install Docker Desktop and ensure it's added to PATH
- **"Cannot connect to Docker daemon"**: Make sure Docker Desktop is running
- **Permission denied**: On Linux, add your user to the docker group: `sudo usermod -aG docker $USER`

### FFmpeg Issues (Local Installation)
- **"ffprobe: command not found"**: Install FFmpeg and ensure it's in your system PATH
- **"ffmpeg: command not found"**: Same as above, restart your terminal after installation

### File Access Issues
- **"ENOENT: no such file or directory"**: Check that the input folder path is correct
- **Permission errors**: Ensure the application has read access to input files and write access to output locations

### Building
The script runs directly with Bun, no build step required:
```bash
bun run index.ts
```

## 🚀 Deployment & Publishing

This project includes GitHub Actions workflow for automatic Docker image building and publishing to GitHub Container Registry.

### Quick Deployment Setup

1. **Run the setup script:**
   ```bash
   # Linux/Mac
   chmod +x setup-github.sh
   ./setup-github.sh
   
   # Windows
   setup-github.bat
   ```

2. **Create repository on GitHub:**
   - Go to https://github.com/new
   - Use the repository name suggested by the script
   - Make it public for free GHCR access

3. **Push and deploy:**
   ```bash
   git push -u origin main
   ```

4. **Use published image:**
   ```bash
   docker pull ghcr.io/yourusername/yt-file-convert:latest
   ```

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### GitHub Actions Features

- ✅ **Multi-platform builds**: Supports AMD64 and ARM64 architectures
- ✅ **Automatic versioning**: Creates `latest`, version tags, and branch tags
- ✅ **Security**: Images are signed with cosign for integrity verification
- ✅ **Caching**: Fast builds using GitHub Actions cache
- ✅ **Pull request builds**: Test builds on PRs without publishing
