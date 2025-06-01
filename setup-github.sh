#!/bin/bash

# GitHub Repository Setup Script
# This script helps you set up the repository and push to GitHub

echo "🚀 GitHub Repository Setup for Video Converter"
echo "=============================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get repository name (default to current folder name)
DEFAULT_REPO_NAME=$(basename "$PWD")
read -p "Enter repository name [$DEFAULT_REPO_NAME]: " REPO_NAME
REPO_NAME=${REPO_NAME:-$DEFAULT_REPO_NAME}

# Update files with actual GitHub username
echo "📝 Updating configuration files..."

# Update README.md
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/yourusername/$GITHUB_USERNAME/g" README.md
    sed -i '' "s/yourusername/$GITHUB_USERNAME/g" docker-compose.yml
    sed -i '' "s/yourusername/$GITHUB_USERNAME/g" DEPLOYMENT.md
else
    # Linux
    sed -i "s/yourusername/$GITHUB_USERNAME/g" README.md
    sed -i "s/yourusername/$GITHUB_USERNAME/g" docker-compose.yml
    sed -i "s/yourusername/$GITHUB_USERNAME/g" DEPLOYMENT.md
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📋 Adding files to Git..."
git add .

# Commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Video converter with Docker and GitHub Actions support"

# Add remote origin
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "🔗 Adding remote origin: $REPO_URL"

# Remove existing origin if it exists
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create the repository on GitHub: https://github.com/new"
echo "   - Repository name: $REPO_NAME"
echo "   - Make it public for free GitHub Container Registry access"
echo ""
echo "2. Push your code:"
echo "   git push -u origin main"
echo ""
echo "3. Watch the build in GitHub Actions:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
echo ""
echo "4. Once built, use your image:"
echo "   docker pull ghcr.io/$GITHUB_USERNAME/$REPO_NAME:latest"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
