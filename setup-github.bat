@echo off
setlocal enabledelayedexpansion

echo 🚀 GitHub Repository Setup for Video Converter
echo ==============================================

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Get GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "

REM Get repository name (default to current folder name)
for %%I in (.) do set DEFAULT_REPO_NAME=%%~nxI
set /p REPO_NAME="Enter repository name [%DEFAULT_REPO_NAME%]: "
if "%REPO_NAME%"=="" set REPO_NAME=%DEFAULT_REPO_NAME%

echo 📝 Updating configuration files...

REM Update files with actual GitHub username using PowerShell
powershell -Command "(Get-Content README.md) -replace 'yourusername', '%GITHUB_USERNAME%' | Set-Content README.md"
powershell -Command "(Get-Content docker-compose.yml) -replace 'yourusername', '%GITHUB_USERNAME%' | Set-Content docker-compose.yml"
powershell -Command "(Get-Content DEPLOYMENT.md) -replace 'yourusername', '%GITHUB_USERNAME%' | Set-Content DEPLOYMENT.md"

REM Initialize git repository if not already initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
    git branch -M main
)

REM Add all files
echo 📋 Adding files to Git...
git add .

REM Commit
echo 💾 Creating initial commit...
git commit -m "Initial commit: Video converter with Docker and GitHub Actions support"

REM Add remote origin
set REPO_URL=https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
echo 🔗 Adding remote origin: %REPO_URL%

REM Remove existing origin if it exists
git remote remove origin 2>nul
git remote add origin "%REPO_URL%"

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Create the repository on GitHub: https://github.com/new
echo    - Repository name: %REPO_NAME%
echo    - Make it public for free GitHub Container Registry access
echo.
echo 2. Push your code:
echo    git push -u origin main
echo.
echo 3. Watch the build in GitHub Actions:
echo    https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/actions
echo.
echo 4. Once built, use your image:
echo    docker pull ghcr.io/%GITHUB_USERNAME%/%REPO_NAME%:latest
echo.
echo 📖 For detailed instructions, see DEPLOYMENT.md

pause
