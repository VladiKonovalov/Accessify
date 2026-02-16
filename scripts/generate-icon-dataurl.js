#!/usr/bin/env node

/**
 * Generate src/iconDataUrl.js from assets/accessify-icon.png (or accessify-icon - Copy.png).
 * Run: node scripts/generate-icon-dataurl.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

const candidates = [
  path.join(root, 'assets', 'accessify-icon - Copy.png'),
  path.join(root, 'assets', 'accessify-icon.png'),
];

let iconPath = null;
for (const p of candidates) {
  if (fs.existsSync(p)) {
    iconPath = p;
    break;
  }
}

if (!iconPath) {
  console.error('No icon found. Place accessify-icon.png or "accessify-icon - Copy.png" in assets/');
  process.exit(1);
}

const buffer = fs.readFileSync(iconPath);
const base64 = buffer.toString('base64');
const dataUrl = `data:image/png;base64,${base64}`;

const content = `/**
 * Toolbar V2 — Embedded trigger/header icon (base64 data URL)
 * Generated from assets/accessify-icon.png so consumers need no asset copy.
 */

export const ACCESSIFY_ICON_DATA_URL = '${dataUrl}';
`;

const outPath = path.join(root, 'src', 'iconDataUrl.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Wrote', outPath, '(', Math.round(dataUrl.length / 1024), 'KB )');
console.log('Icon source:', path.relative(root, iconPath));
