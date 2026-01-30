#!/bin/bash

# Build script for Gradle WebJar packaging
# This script ensures the JavaScript library is built before packaging

set -e

echo "Building Accessify WebJar with Gradle..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Check if Gradle is installed
if ! command -v gradle &> /dev/null; then
    echo "Error: Gradle is not installed. Please install Gradle first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Build JavaScript library
echo "Building JavaScript library..."
npm run build

# Verify dist directory exists and has files
if [ ! -d "dist" ] || [ -z "$(ls -A dist/*.js 2>/dev/null)" ]; then
    echo "Error: dist directory is empty or doesn't exist. Build failed."
    exit 1
fi

# Build Gradle package
echo "Building Gradle WebJar..."
./gradlew clean build

echo "Build complete! WebJar is available in build/libs/accessify-1.0.0.jar"
echo ""
echo "To install to local Maven repository:"
echo "  ./gradlew clean publishToMavenLocal"
echo ""
echo "To publish to remote repository:"
echo "  ./gradlew clean publish"
