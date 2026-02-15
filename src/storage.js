/**
 * Toolbar V2 — Persistence (localStorage)
 */

import { STORAGE_KEY, defaultSettings } from './constants.js';

/**
 * @returns {Record<string, unknown>}
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return { ...defaultSettings };
  }
}

/**
 * @param {Record<string, unknown>} settings
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {}
}
