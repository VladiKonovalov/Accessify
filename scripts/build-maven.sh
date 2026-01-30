#!/bin/bash

# Build script for Maven WebJar packaging
# This script ensures the JavaScript library is built before packaging

set -e

echo "Building Accessify WebJar..."

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

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven is not installed. Please install Maven first."
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

# Build Maven package
echo "Building Maven WebJar..."
mvn clean package

echo "Build complete! WebJar is available in target/accessify-1.0.0.jar"
echo ""
echo "To install to local Maven repository:"
echo "  mvn clean install"
echo ""
echo "To deploy to Maven Central:"
echo "  mvn clean deploy"
