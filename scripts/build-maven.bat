@echo off
REM Build script for Maven WebJar packaging (Windows)
REM This script ensures the JavaScript library is built before packaging

setlocal enabledelayedexpansion

echo Building Accessify WebJar...

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

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Maven is not installed. Please install Maven first.
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

REM Build Maven package
echo Building Maven WebJar...
call mvn clean package

echo Build complete! WebJar is available in target\accessify-1.0.0.jar
echo.
echo To install to local Maven repository:
echo   mvn clean install
echo.
echo To deploy to Maven Central:
echo   mvn clean deploy

endlocal
