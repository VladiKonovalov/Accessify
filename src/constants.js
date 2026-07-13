/**
 * Toolbar V2 — Constants and default settings
 * WCAG 2.1 AA aligned (text size 80%–200%, contrast modes, persistence key).
 */

/** Keep in sync with package.json version */
export const VERSION = '2.1.0';

export const STORAGE_KEY = 'accessify-settings';

export const TEXT_SIZE_MIN = 80;
export const TEXT_SIZE_MAX = 200;
export const TEXT_SIZE_STEP = 10;
export const TEXT_SIZE_DEFAULT = 100;

export const CONTRAST_MODES = ['normal', 'high', 'dark'];

export const defaultSettings = Object.freeze({
  textSize: TEXT_SIZE_DEFAULT,
  contrastMode: 'normal',
  textSpacing: 'normal',
  fontType: 'default',
  highlightLinks: false,
  highlightCursor: false,
  language: 'en',
  colorFilter: 'none'
});
