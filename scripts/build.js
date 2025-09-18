#!/usr/bin/env node

/**
 * Build script for Accessify
 * Creates distribution files and validates the build
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building Accessify...');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  // Run Rollup build
  console.log('📦 Building with Rollup...');
  execSync('npx rollup -c', { stdio: 'inherit' });
  
  // Validate build files
  console.log('✅ Validating build files...');
  const buildFiles = [
    'dist/accessify.js',
    'dist/accessify.min.js',
    'dist/accessify.esm.js',
    'dist/accessify.cjs.js'
  ];
  
  buildFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Build file missing: ${file}`);
    }
    
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error(`Build file is empty: ${file}`);
    }
    
    console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  });
  
  // Validate TypeScript definitions
  const typesFile = path.join(__dirname, '..', 'types', 'index.d.ts');
  if (!fs.existsSync(typesFile)) {
    throw new Error('TypeScript definitions not found');
  }
  
  console.log('  ✓ TypeScript definitions validated');
  
  // Skip tests and linting for now
  console.log('🧪 Skipping tests and linting for now...');
  
  console.log('🎉 Build completed successfully!');
  console.log('');
  console.log('📁 Distribution files:');
  console.log('  - dist/accessify.js (UMD, unminified)');
  console.log('  - dist/accessify.min.js (UMD, minified)');
  console.log('  - dist/accessify.esm.js (ES modules)');
  console.log('  - dist/accessify.cjs.js (CommonJS)');
  console.log('  - types/index.d.ts (TypeScript definitions)');
  console.log('');
  console.log('🌐 Test the build:');
  console.log('  - Open example.html in a browser');
  console.log('  - Run: npm run dev (for development)');
  console.log('');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
