# GitHub Deployment Guide

This guide explains how to set up automatic Docker image building and publishing to GitHub Container Registry (GHCR) using GitHub Actions.

## Prerequisites

1. A GitHub repository for this project
2. Docker enabled on your GitHub repository
3. GitHub Container Registry access (enabled by default for public repos)

## Setup Steps

### 1. Push Your Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: Video converter with Docker support"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/yt-file-convert.git

# Push to main branch
git push -u origin main
```

### 2. Enable GitHub Packages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Features" section
4. Make sure "Packages" is enabled

### 3. GitHub Actions Workflow

The workflow file `.github/workflows/docker-publish.yml` is already included in this repository. It will:

- **Trigger on**:
  - Push to `main` or `master` branch
  - New version tags (e.g., `v1.0.0`)
  - Pull requests (build only, no publish)

- **Build process**:
  - Multi-platform builds (linux/amd64, linux/arm64)
  - Automatic tagging based on branch/tag
  - Image signing with cosign for security
  - Caching for faster builds

### 4. Configure Repository Settings

#### Required Permissions
The workflow needs these permissions (automatically configured in the workflow file):
- `contents: read` - To checkout the repository
- `packages: write` - To publish to GitHub Container Registry
- `id-token: write` - For image signing

#### Repository Secrets
No additional secrets are required! The workflow uses the built-in `GITHUB_TOKEN` which automatically has the necessary permissions.

### 5. Tagging and Releases

#### Creating a Release
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will trigger a build and create the following image tags:
- `ghcr.io/yourusername/yt-file-convert:v1.0.0`
- `ghcr.io/yourusername/yt-file-convert:1.0`
- `ghcr.io/yourusername/yt-file-convert:latest`

#### Version Tagging Strategy
- Use semantic versioning: `v1.0.0`, `v1.1.0`, `v2.0.0`
- Push to main branch creates: `latest` and `main` tags
- Feature branches create: `pr-123` tags (not published)

### 6. Using Published Images

#### Pull and Run Latest Version
```bash
# Pull the latest version
docker pull ghcr.io/yourusername/yt-file-convert:latest

# Run with your video folder
docker run --rm -v "/path/to/videos:/app/videos" ghcr.io/yourusername/yt-file-convert:latest
```

#### Use Specific Version
```bash
# Use a specific version
docker pull ghcr.io/yourusername/yt-file-convert:v1.0.0
docker run --rm -v "/path/to/videos:/app/videos" ghcr.io/yourusername/yt-file-convert:v1.0.0
```

#### Update Docker Compose
Update your `docker-compose.yml` to use the published image:
```yaml
services:
  video-converter:
    image: ghcr.io/yourusername/yt-file-convert:latest
    # ... rest of configuration
```

### 7. Repository Visibility and Packages

#### Public Repository
- Images are publicly accessible
- Anyone can pull and use your images
- No authentication required for pulling

#### Private Repository
- Images are private by default
- Authentication required for pulling:
  ```bash
  # Login to GHCR
  echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin
  
  # Pull private image
  docker pull ghcr.io/yourusername/yt-file-convert:latest
  ```

### 8. Monitoring Builds

#### GitHub Actions Tab
1. Go to your repository on GitHub
2. Click the "Actions" tab
3. Monitor build progress and logs
4. Check for any build failures

#### Package Registry
1. Go to your repository
2. Click "Packages" on the right sidebar
3. View published images and download statistics

### 9. Troubleshooting

#### Build Failures
- Check the Actions tab for detailed logs
- Common issues:
  - Dockerfile syntax errors
  - Missing dependencies
  - Permission issues

#### Permission Denied
```bash
# If you get permission denied when pushing packages
# Make sure your token has the 'write:packages' scope
```

#### Image Not Found
- Wait a few minutes after the build completes
- Check that the workflow completed successfully
- Verify the image name and tag are correct

### 10. Advanced Configuration

#### Custom Build Matrix
Modify `.github/workflows/docker-publish.yml` to build for additional platforms:
```yaml
strategy:
  matrix:
    platform:
      - linux/amd64
      - linux/arm64
      - linux/arm/v7
```

#### Build Optimization
- The workflow includes GitHub Actions cache for Docker layers
- Multi-stage builds reduce final image size
- Base image updates are automatically detected

#### Security Features
- Images are automatically signed with cosign
- Vulnerability scanning can be added
- SBOM (Software Bill of Materials) generation available

## Example Complete Workflow

```bash
# 1. Set up the repository
git clone https://github.com/yourusername/yt-file-convert.git
cd yt-file-convert

# 2. Make changes and commit
git add .
git commit -m "Updated video converter settings"

# 3. Push changes (triggers build)
git push origin main

# 4. Create a release
git tag v1.1.0
git push origin v1.1.0

# 5. Use the published image
docker pull ghcr.io/yourusername/yt-file-convert:latest
docker run --rm -v "./videos:/app/videos" ghcr.io/yourusername/yt-file-convert:latest
```

## Benefits of This Setup

✅ **Automated builds**: Every push triggers a new build  
✅ **Multi-platform support**: Works on Intel and ARM systems  
✅ **Version management**: Automatic tagging and release management  
✅ **Security**: Image signing and vulnerability scanning  
✅ **Efficiency**: Build caching for faster iterations  
✅ **No maintenance**: Fully automated pipeline  

## Next Steps

1. Replace `yourusername` with your actual GitHub username in all files
2. Push your code to GitHub
3. Watch the first build complete in the Actions tab
4. Start using your published Docker images!
