@echo off
REM Build script for Gradle WebJar packaging (Windows)
REM This script ensures the JavaScript library is built before packaging

setlocal enabledelayedexpansion

echo Building Accessify WebJar with Gradle...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed. Please install npm first.
    exit /b 1
)

REM Check if Gradle is installed
where gradle >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Gradle is not installed. Please install Gradle first.
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

REM Build JavaScript library
echo Building JavaScript library...
call npm run build

REM Verify dist directory exists and has files
if not exist "dist\accessify.min.js" (
    echo Error: dist directory is empty or doesn't exist. Build failed.
    exit /b 1
)

REM Build Gradle package
echo Building Gradle WebJar...
call gradlew clean build

echo Build complete! WebJar is available in build\libs\accessify-1.0.0.jar
echo.
echo To install to local Maven repository:
echo   gradlew clean publishToMavenLocal
echo.
echo To publish to remote repository:
echo   gradlew clean publish

endlocal
