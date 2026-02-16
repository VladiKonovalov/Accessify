(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Accessify = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Toolbar V2 — Constants and default settings
   * WCAG 2.1 AA aligned (text size 80%–200%, contrast modes, persistence key).
   */

  const STORAGE_KEY = 'accessify-settings';

  const TEXT_SIZE_MIN = 80;
  const TEXT_SIZE_MAX = 200;
  const TEXT_SIZE_STEP = 10;
  const TEXT_SIZE_DEFAULT = 100;

  const defaultSettings = Object.freeze({
    textSize: TEXT_SIZE_DEFAULT,
    contrastMode: 'normal',
    textSpacing: 'normal',
    fontType: 'default',
    highlightLinks: false,
    highlightCursor: false,
    language: 'en',
    colorFilter: 'none'
  });

  /**
   * Toolbar V2 — Persistence (localStorage)
   */


  /**
   * @returns {Record<string, unknown>}
   */
  function loadSettings() {
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
  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {}
  }

  /**
   * Toolbar V2 — Toolbar UI styles (.accessify-toolbar-v2-*)
   * WCAG 2.1 AA: contrast ≥4.5:1 for text/UI, focus-visible, touch targets (≥44px), reduced motion.
   */

  function getToolbarStyles() {
    return `
/* ---- Toolbar V2: Trigger (bottom; left for RTL/hebrew, right for LTR/english) ---- */
.accessify-toolbar-v2-trigger {
  position: fixed;
  bottom: 1rem;
  inset-inline-end: 1rem;
  z-index: 10002;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  padding: 12px;
  border: none;
  border-radius: 50%;
  background-color: #2563eb;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  transition: transform 0.3s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}
.accessify-toolbar-v2-trigger[aria-expanded="false"] {
  transform: rotate(180deg);
}
.accessify-toolbar-v2-trigger[aria-expanded="true"] {
  transform: rotate(0deg);
}
.accessify-toolbar-v2-trigger:hover {
  background-color: #1d4ed8;
}
.accessify-toolbar-v2-trigger:focus {
  outline: none;
}
.accessify-toolbar-v2-trigger:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
}
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-icon,
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-trigger-icon-img {
  display: flex;
  align-items: center;
  justify-content: center;
}
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-trigger-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-icon svg {
  width: 24px;
  height: 24px;
}
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-trigger-fallback {
  display: none;
}
.accessify-toolbar-v2-trigger:not(:has(.accessify-toolbar-v2-trigger-icon-img)) .accessify-toolbar-v2-trigger-fallback {
  display: flex;
}

/* ---- Toolbar V2: Panel (bottom, same side as trigger; dir set in JS for inset-inline-end) ---- */
.accessify-toolbar-v2-panel {
  position: fixed;
  bottom: 5rem;
  inset-inline-end: 1rem;
  z-index: 10001;
  width: 260px;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 7rem);
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.accessify-toolbar-v2-panel-body {
  padding: 16px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ---- Toolbar V2: Header ---- */
.accessify-toolbar-v2-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  background-color: #eff6ff;
  border-bottom: 2px solid #e5e7eb;
}
.accessify-toolbar-v2-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon-fallback {
  display: none;
  color: #2563eb;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon-fallback svg {
  width: 20px;
  height: 20px;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon:not(:has(.accessify-toolbar-v2-header-title-icon-img)) .accessify-toolbar-v2-header-title-icon-fallback {
  display: flex;
}
.accessify-toolbar-v2-close {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.accessify-toolbar-v2-close:hover {
  color: #374151;
  background: rgba(0, 0, 0, 0.05);
}
.accessify-toolbar-v2-close:focus {
  outline: none;
}
.accessify-toolbar-v2-close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #2563eb;
}
.accessify-toolbar-v2-close .accessify-toolbar-v2-icon svg {
  width: 20px;
  height: 20px;
}

/* ---- Toolbar V2: Section ---- */
.accessify-toolbar-v2-section {
  margin-bottom: 16px;
}
.accessify-toolbar-v2-section:last-child {
  margin-bottom: 0;
}
.accessify-toolbar-v2-section-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.accessify-toolbar-v2-section-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.accessify-toolbar-v2-section-controls > .accessify-toolbar-v2-btn,
.accessify-toolbar-v2-section-controls > div {
  flex: 1;
  min-width: 0;
}

/* ---- Toolbar V2: Customize (show/hide tools, collapsible) ---- */
.accessify-toolbar-v2-customize {
  margin-bottom: 16px;
}
.accessify-toolbar-v2-customize-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #4b5563;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.accessify-toolbar-v2-customize-header:hover {
  border-color: #2563eb;
  background: #eff6ff;
}
.accessify-toolbar-v2-customize-header:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
.accessify-toolbar-v2-customize-header-label {
  flex: 1;
  text-align: left;
}
.accessify-toolbar-v2-customize-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.accessify-toolbar-v2-customize-open .accessify-toolbar-v2-customize-chevron {
  transform: rotate(180deg);
}
.accessify-toolbar-v2-customize-body {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 12px;
  padding: 0 2px;
}
.accessify-toolbar-v2-customize-body[hidden] {
  display: none;
}
.accessify-toolbar-v2-customize-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
.accessify-toolbar-v2-customize-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
  cursor: pointer;
}
.accessify-toolbar-v2-customize-label-text {
  user-select: none;
}
.accessify-toolbar-v2-section[data-control-id] {
  transition: opacity 0.15s ease;
}

/* ---- Toolbar V2: Buttons (default) ---- */
.accessify-toolbar-v2-btn {
  min-height: 48px;
  padding: 14px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}
.accessify-toolbar-v2-btn:hover:not(:disabled) {
  border-color: #2563eb;
  background-color: #eff6ff;
}
.accessify-toolbar-v2-btn:focus {
  outline: none;
}
.accessify-toolbar-v2-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #2563eb;
}
.accessify-toolbar-v2-btn:disabled {
  border-color: #e5e7eb;
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}
.accessify-toolbar-v2-btn[aria-pressed="true"] {
  border-color: #2563eb;
  background-color: #eff6ff;
  color: #1d4ed8;
}
.accessify-toolbar-v2-btn .accessify-toolbar-v2-icon {
  display: flex;
  flex-shrink: 0;
}
.accessify-toolbar-v2-btn .accessify-toolbar-v2-icon svg {
  width: 20px;
  height: 20px;
}

/* Text size value display */
.accessify-toolbar-v2-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2563eb;
  min-width: 3ch;
  text-align: center;
}

/* Font D badge */
.accessify-toolbar-v2-font-d-badge {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #111827;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 4px;
  flex-shrink: 0;
}

/* Language buttons */
.accessify-toolbar-v2-language-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
}
.accessify-toolbar-v2-language-btn {
  flex: 1;
  min-width: 0;
}

/* Reset button */
.accessify-toolbar-v2-reset {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 2px solid #e5e7eb;
}
.accessify-toolbar-v2-reset .accessify-toolbar-v2-btn {
  width: 100%;
  background: #fef2f2;
  border-color: #fca5a5;
  color: #b91c1c;
}
.accessify-toolbar-v2-reset .accessify-toolbar-v2-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}
.accessify-toolbar-v2-reset .accessify-toolbar-v2-btn:focus-visible {
  box-shadow: 0 0 0 2px #ef4444;
}

/* Cursor highlight circle (centered on pointer) - above toolbar so it stays visible */
.accessify-toolbar-v2-cursor-circle {
  position: fixed;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 4px solid #2563eb;
  background: rgba(37, 99, 235, 0.1);
  pointer-events: none;
  z-index: 10003;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
}

/* Visually hidden live region for screen reader announcements */
.accessify-toolbar-v2-live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .accessify-toolbar-v2-trigger,
  .accessify-toolbar-v2-btn,
  .accessify-toolbar-v2-close {
    transition: none;
  }
  .accessify-toolbar-v2-cursor-circle {
    transition: none;
  }
}
`;
  }

  /**
   * Toolbar V2 — Page effect classes (body/root accessibility)
   * Contrast, text spacing, dyslexia font, link highlight, cursor hide.
   */

  function getPageEffectsStyles() {
    return `
/* ---- Body/Root accessibility classes (page effects) ---- */
/* Contrast applied to content wrapper (not body) so filter does not break toolbar position:fixed */
.contrast-normal {
  /* default */
}
.contrast-high {
  filter: contrast(150%) brightness(1.1);
}
.contrast-high *:not(button):not(a) {
  border-color: #000 !important;
}
.contrast-high button,
.contrast-high a {
  border: 2px solid currentColor !important;
}
.contrast-high {
  font-weight: 500;
}
.contrast-high h1, .contrast-high h2, .contrast-high h3,
.contrast-high h4, .contrast-high h5, .contrast-high h6 {
  font-weight: 700;
}
.contrast-dark {
  background-color: #1a1a1a !important;
  color: #e5e7eb !important;
  min-height: 100vh;
}
.contrast-dark a {
  color: #93c5fd !important;
}
.text-spacing-wide p,
.text-spacing-wide h1, .text-spacing-wide h2, .text-spacing-wide h3,
.text-spacing-wide h4, .text-spacing-wide h5, .text-spacing-wide h6,
.text-spacing-wide li, .text-spacing-wide span, .text-spacing-wide div {
  line-height: 2 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
.text-spacing-wide button,
.text-spacing-wide a {
  padding-top: 0.75em !important;
  padding-bottom: 0.75em !important;
}
.font-dyslexia,
.font-dyslexia * {
  font-family: 'Comic Sans MS', 'OpenDyslexic', Arial, sans-serif !important;
}
.highlight-links a {
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 3px !important;
  font-weight: 600 !important;
  background-color: rgba(255, 255, 0, 0.2) !important;
  padding: 2px 4px !important;
  border-radius: 2px !important;
}
.highlight-links a:hover {
  background-color: rgba(255, 255, 0, 0.4) !important;
}
.highlight-cursor,
.highlight-cursor * {
  cursor: none !important;
}

/* Color adjustments (applied to content wrapper) */
.color-filter-none {
  /* default */
}
.color-filter-grayscale,
.color-filter-grayscale * {
  filter: grayscale(100%) !important;
}
.color-filter-invert,
.color-filter-invert * {
  filter: invert(100%) !important;
}
`;
  }

  /**
   * Toolbar V2 — Injected styles (toolbar UI + body/root accessibility classes)
   * WCAG 2.1 AA: contrast, focus-visible, touch targets, reduced motion.
   */


  const ID$1 = 'accessify-toolbar-v2-styles';

  function injectStyles() {
    if (document.getElementById(ID$1)) return;
    const style = document.createElement('style');
    style.id = ID$1;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function getStyles() {
    return getToolbarStyles() + getPageEffectsStyles();
  }

  /**
   * Toolbar V2 — Internationalization (i18n)
   * Single source for all UI strings. Add new languages by adding a key to TRANSLATIONS.
   */

  /** @type {Record<string, Record<string, string>>} */
  const TRANSLATIONS = {
    en: {
      // Trigger
      triggerAriaLabel: 'Toggle Accessibility Controls',
      triggerTitle: 'Open accessibility controls',

      // Header
      headerTitle: 'Accessibility',
      closeAriaLabel: 'Close',
      closeTitle: 'Close panel',

      // Customize
      customizeHeader: 'Show or hide tools',
      showControl: 'Show {label}',

      // Section labels (uppercase in UI for some)
      sectionTextSize: 'Text size',
      sectionContrast: 'Contrast',
      sectionSpacing: 'Spacing',
      sectionFont: 'Font',
      sectionLinks: 'Links',
      sectionCursor: 'Cursor',
      sectionReset: 'Reset',
      sectionLanguage: 'Language',
      sectionColorAdjustments: 'Color Adjustments',

      // Control labels (for customize checkboxes and section headers)
      controlTextSize: 'Text size',
      controlContrast: 'Contrast',
      controlSpacing: 'Spacing',
      controlFont: 'Font',
      controlLinks: 'Links',
      controlCursor: 'Cursor',
      controlReset: 'Reset',
      controlLanguage: 'Language',
      controlColorAdjustments: 'Color Adjustments',

      // Text size control
      decreaseTextSize: 'Decrease text size',
      increaseTextSize: 'Increase text size',

      // Contrast
      toggleContrast: 'Toggle contrast mode',
      contrastTitle: 'Change contrast (Normal / High / Dark)',
      contrastNormal: 'Normal',
      contrastHigh: 'High',
      contrastDark: 'Dark',
      contrastAriaLabelCurrent: 'Contrast: {mode}',
      announceContrast: 'Contrast set to {mode}',

      // Spacing
      toggleSpacing: 'Toggle text spacing',
      spacingTitle: 'Toggle letter and line spacing',
      spacingNormal: 'Normal',
      spacingWide: 'Wide',
      announceSpacing: 'Text spacing {state}',

      // Font
      toggleFont: 'Toggle dyslexia-friendly font',
      fontTitle: 'Switch to dyslexia-friendly font',
      fontDefault: 'Default',
      fontDyslexia: 'Dyslexia',
      announceFont: 'Dyslexia-friendly font {state}',

      // Links
      toggleLinks: 'Toggle link highlighting',
      linksTitle: 'Highlight links on the page',
      on: 'ON',
      off: 'OFF',
      announceLinks: 'Link highlighting {state}',

      // Cursor
      toggleCursor: 'Toggle cursor highlighting',
      cursorTitle: 'Highlight cursor with a circle',
      announceCursor: 'Cursor highlighting {state}',

      // Reset
      resetAriaLabel: 'Reset all settings',
      resetTitle: 'Restore all settings to default',
      resetLabel: 'Reset',
      announceReset: 'All settings reset',

      // Language
      languageEn: 'English',
      languageHe: 'עברית',

      // Color Adjustments
      colorAdjustmentsTitle: 'Change color filter (for color vision)',
      colorFilterNone: 'None',
      colorFilterGrayscale: 'Grayscale',
      colorFilterInvert: 'Invert',
      colorFilterAriaLabelCurrent: 'Color filter: {mode}',
      announceColorFilter: 'Color filter set to {mode}'
    },
    he: {
      triggerAriaLabel: 'הצג/הסתר פקדי נגישות',
      triggerTitle: 'פתח פקדי נגישות',

      headerTitle: 'נגישות',
      closeAriaLabel: 'סגור',
      closeTitle: 'סגור חלונית',

      customizeHeader: 'הצג או הסתר כלים',
      showControl: 'הצג {label}',

      sectionTextSize: 'גודל טקסט',
      sectionContrast: 'ניגודיות',
      sectionSpacing: 'ריווח',
      sectionFont: 'גופן',
      sectionLinks: 'קישורים',
      sectionCursor: 'סמן',
      sectionReset: 'איפוס',
      sectionLanguage: 'שפה',
      sectionColorAdjustments: 'התאמות צבע',

      controlTextSize: 'גודל טקסט',
      controlContrast: 'ניגודיות',
      controlSpacing: 'ריווח',
      controlFont: 'גופן',
      controlLinks: 'קישורים',
      controlCursor: 'סמן',
      controlReset: 'איפוס',
      controlLanguage: 'שפה',
      controlColorAdjustments: 'התאמות צבע',

      decreaseTextSize: 'הקטן גודל טקסט',
      increaseTextSize: 'הגדל גודל טקסט',

      toggleContrast: 'החלף מצב ניגודיות',
      contrastTitle: 'שינוי ניגודיות (רגיל / גבוה / כהה)',
      contrastNormal: 'רגיל',
      contrastHigh: 'גבוה',
      contrastDark: 'כהה',
      contrastAriaLabelCurrent: 'ניגודיות: {mode}',
      announceContrast: 'ניגודיות הוגדרה ל-{mode}',

      toggleSpacing: 'החלף ריווח טקסט',
      spacingTitle: 'החלף ריווח אותיות ושורות',
      spacingNormal: 'רגיל',
      spacingWide: 'רחב',
      announceSpacing: 'ריווח טקסט {state}',

      toggleFont: 'החלף גופן ידידותי לדיסלקציה',
      fontTitle: 'החלף לגופן ידידותי לדיסלקציה',
      fontDefault: 'ברירת מחדל',
      fontDyslexia: 'דיסלקציה',
      announceFont: 'גופן ידידותי לדיסלקציה {state}',

      toggleLinks: 'החלף הדגשת קישורים',
      linksTitle: 'הדגש קישורים בעמוד',
      on: 'פועל',
      off: 'כבוי',
      announceLinks: 'הדגשת קישורים {state}',

      toggleCursor: 'החלף הדגשת סמן',
      cursorTitle: 'הדגש סמן עם עיגול',
      announceCursor: 'הדגשת סמן {state}',

      resetAriaLabel: 'אפס את כל ההגדרות',
      resetTitle: 'שחזר את כל ההגדרות לברירת מחדל',
      resetLabel: 'איפוס',
      announceReset: 'כל ההגדרות אופסו',

      languageEn: 'English',
      languageHe: 'עברית',

      colorAdjustmentsTitle: 'שינוי מסנן צבע (למען ראיית צבע)',
      colorFilterNone: 'ללא',
      colorFilterGrayscale: 'גווני אפור',
      colorFilterInvert: 'היפוך',
      colorFilterAriaLabelCurrent: 'מסנן צבע: {mode}',
      announceColorFilter: 'מסנן צבע הוגדר ל-{mode}'
    }
  };

  const FALLBACK_LANG = 'en';

  /** @type {string} */
  let currentLanguage = FALLBACK_LANG;

  /** @type {Array<() => void>} */
  const subscribers = [];

  /**
   * Get translation for key in current language. Falls back to English if missing.
   * Use {label} in string for interpolation (e.g. showControl: 'Show {label}').
   * @param {string} key
   * @param {Record<string, string>} [vars] — e.g. { label: 'Text size' }
   * @returns {string}
   */
  function t(key, vars) {
    const lang = TRANSLATIONS[currentLanguage] || TRANSLATIONS[FALLBACK_LANG];
    let s = (lang && lang[key]) || (TRANSLATIONS[FALLBACK_LANG] && TRANSLATIONS[FALLBACK_LANG][key]) || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return s;
  }

  /**
   * @returns {string} Current language code (e.g. 'en', 'he')
   */
  function getLanguage() {
    return currentLanguage;
  }

  /**
   * Set current language and notify subscribers. Does not persist; caller should save settings.
   * @param {string} lang — Language code (e.g. 'en', 'he')
   */
  function setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
      currentLanguage = lang;
      subscribers.forEach((fn) => fn());
    }
  }

  /**
   * Subscribe to language changes (e.g. to refresh UI).
   * @param {() => void} fn
   * @returns {() => void} Unsubscribe function
   */
  function subscribe(fn) {
    subscribers.push(fn);
    return () => {
      const i = subscribers.indexOf(fn);
      if (i !== -1) subscribers.splice(i, 1);
    };
  }

  /**
   * List of supported language codes. Add new languages to TRANSLATIONS and they appear here.
   * @returns {string[]}
   */
  function getSupportedLanguages() {
    return Object.keys(TRANSLATIONS);
  }

  /**
   * Map HTML lang attribute (e.g. "en-US", "he-IL") to a toolbar-supported language code.
   * Used to sync page language with toolbar. Add mappings when adding new languages.
   * @param {string} htmlLang — document.documentElement.lang
   * @returns {string | null} Toolbar language code or null if not supported
   */
  function normalizePageLang(htmlLang) {
    if (!htmlLang || typeof htmlLang !== 'string') return null;
    const lower = htmlLang.trim().toLowerCase();
    const base = lower.split('-')[0];
    const supported = getSupportedLanguages();
    if (supported.includes(lower)) return lower;
    if (supported.includes(base)) return base;
    const map = { en: 'en', he: 'he' };
    return map[base] && supported.includes(map[base]) ? map[base] : null;
  }

  /**
   * Get dir for a toolbar language code (e.g. 'rtl' for Hebrew).
   * @param {string} lang — Toolbar language code
   * @returns {'ltr' | 'rtl'}
   */
  function getDirForLang(lang) {
    return lang === 'he' ? 'rtl' : 'ltr';
  }

  /**
   * Toolbar V2 — Cursor highlight (reading guide circle)
   * Fixed circle that follows the pointer when "Cursor" is ON.
   * pointer-events: none; z-index above toolbar so it stays visible in front.
   */

  class CursorHighlight {
    constructor() {
      this.el = null;
      this.raf = null;
      this.x = 0;
      this.y = 0;
    }

    mount() {
      if (this.el) return;
      this.el = document.createElement('div');
      this.el.className = 'accessify-toolbar-v2-cursor-circle';
      this.el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.el);
      this._boundMove = this._onMove.bind(this);
      window.addEventListener('mousemove', this._boundMove, { passive: true });
    }

    unmount() {
      if (!this.el) return;
      window.removeEventListener('mousemove', this._boundMove);
      if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
      this.el = null;
      if (this.raf) cancelAnimationFrame(this.raf);
    }

    setVisible(visible) {
      if (!this.el) return;
      this.el.style.display = visible ? 'block' : 'none';
    }

    _onMove(e) {
      this.x = e.clientX;
      this.y = e.clientY;
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = null;
        if (this.el) {
          this.el.style.left = this.x + 'px';
          this.el.style.top = this.y + 'px';
        }
      });
    }
  }

  /**
   * Toolbar V2 — Inline SVG icons (no external deps, Lucide-style)
   * 20×20 unless noted. Accessible when used on buttons with aria-label.
   */

  const size20 = ' width="20" height="20" ';
  const size24 = ' width="24" height="24" ';
  const size16 = ' width="16" height="16" ';

  const icons = {
    accessibility: `<svg xmlns="http://www.w3.org/2000/svg" ${size24} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="m15 22 2-6 2 6"/><path d="m7 22-2-6-2 6"/><path d="M12 6v14"/><path d="M8 14h8"/></svg>`,
    typeSmall: `<svg xmlns="http://www.w3.org/2000/svg" ${size16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
    typeLarge: `<svg xmlns="http://www.w3.org/2000/svg" ${size24} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    contrast: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    alignJustify: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    link: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    mousePointer: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3Z"/></svg>`,
    rotateCcw: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
    palette: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.75-.2 2.5-.5"/></svg>`
  };

  /**
   * Create element with innerHTML set to icon SVG.
   * @param {string} svgString
   * @param {string} [className]
   * @returns {HTMLElement}
   */
  function iconElement(svgString, className = '') {
    const wrap = document.createElement('span');
    wrap.className = 'accessify-toolbar-v2-icon' + (className ? ' ' + className : '');
    wrap.innerHTML = svgString;
    wrap.setAttribute('aria-hidden', 'true');
    return wrap;
  }

  /**
   * "D" badge for dyslexia font (not Lucide).
   * @returns {HTMLElement}
   */
  function fontDBadge() {
    const el = document.createElement('span');
    el.className = 'accessify-toolbar-v2-font-d-badge';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = 'D';
    return el;
  }

  /**
   * Toolbar V2 — Floating trigger button (opens/closes panel)
   * Uses the same icon as version 1 (assets/accessify-icon.png) with SVG fallback.
   */


  /** V1 toggle icon URL; same as version 1 dashboard toggle */
  const V1_TRIGGER_ICON_URL = 'assets/accessify-icon.png';
  /** Fallback when local path not found (e.g. when used in another project) */
  const FALLBACK_ICON_URL$1 = 'https://github.com/VladiKonovalov/Accessify/blob/main/assets/accessify-icon.png?raw=true';

  function createTrigger(onToggle, getOpen) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accessify-toolbar-v2-trigger';
    btn.setAttribute('aria-label', t('triggerAriaLabel'));
    btn.title = t('triggerTitle');
    btn.setAttribute('aria-expanded', 'false');

    const img = document.createElement('img');
    img.src = V1_TRIGGER_ICON_URL;
    img.alt = '';
    img.className = 'accessify-toolbar-v2-trigger-icon-img';
    img.setAttribute('aria-hidden', 'true');

    const fallbackIcon = iconElement(icons.accessibility);
    fallbackIcon.classList.add('accessify-toolbar-v2-trigger-fallback');

    let triedFallbackUrl = false;
    img.onerror = () => {
      if (!triedFallbackUrl) {
        triedFallbackUrl = true;
        img.src = FALLBACK_ICON_URL$1;
      } else if (img.parentNode === btn) {
        btn.removeChild(img);
      }
    };

    btn.appendChild(img);
    btn.appendChild(fallbackIcon);

    btn.addEventListener('click', () => {
      onToggle();
      btn.setAttribute('aria-expanded', String(getOpen()));
    });

    return {
      element: btn,
      setExpanded(open) {
        btn.setAttribute('aria-expanded', String(open));
      },
      refreshLabels() {
        btn.setAttribute('aria-label', t('triggerAriaLabel'));
        btn.title = t('triggerTitle');
      }
    };
  }

  /**
   * Toolbar V2 — Panel header: icon + "Accessibility" + close button
   * Uses the same icon as the trigger (assets/accessify-icon.png) with SVG fallback.
   */


  /** Same as trigger; shared icon URL */
  const ICON_URL = 'assets/accessify-icon.png';
  /** Fallback when local path not found (e.g. when used in another project) */
  const FALLBACK_ICON_URL = 'https://github.com/VladiKonovalov/Accessify/blob/main/assets/accessify-icon.png?raw=true';

  function createTitleIcon() {
    const wrap = document.createElement('span');
    wrap.className = 'accessify-toolbar-v2-header-title-icon';

    const img = document.createElement('img');
    img.src = ICON_URL;
    img.alt = '';
    img.className = 'accessify-toolbar-v2-header-title-icon-img';
    img.setAttribute('aria-hidden', 'true');

    const fallbackIcon = iconElement(icons.accessibility);
    fallbackIcon.classList.add('accessify-toolbar-v2-header-title-icon-fallback');

    let triedFallbackUrl = false;
    img.onerror = () => {
      if (!triedFallbackUrl) {
        triedFallbackUrl = true;
        img.src = FALLBACK_ICON_URL;
      } else if (img.parentNode === wrap) {
        wrap.removeChild(img);
      }
    };

    wrap.appendChild(img);
    wrap.appendChild(fallbackIcon);
    return wrap;
  }

  function createHeader(onClose) {
    const header = document.createElement('div');
    header.className = 'accessify-toolbar-v2-header';
    const titleWrap = document.createElement('div');
    titleWrap.className = 'accessify-toolbar-v2-header-title';
    titleWrap.appendChild(createTitleIcon());
    const title = document.createElement('h2');
    title.className = 'accessify-toolbar-v2-header-title-text';
    title.setAttribute('data-i18n-key', 'headerTitle');
    title.textContent = t('headerTitle');
    titleWrap.appendChild(title);
    header.appendChild(titleWrap);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'accessify-toolbar-v2-close';
    closeBtn.setAttribute('aria-label', t('closeAriaLabel'));
    closeBtn.title = t('closeTitle');
    closeBtn.appendChild(iconElement(icons.x));
    closeBtn.addEventListener('click', onClose);
    header.appendChild(closeBtn);

    return {
      element: header,
      refreshLabels() {
        const titleEl = header.querySelector('.accessify-toolbar-v2-header-title-text');
        if (titleEl) titleEl.textContent = t('headerTitle');
        closeBtn.setAttribute('aria-label', t('closeAriaLabel'));
        closeBtn.title = t('closeTitle');
      }
    };
  }

  /**
   * Toolbar V2 — Panel container (header + scrollable body with sections)
   */


  function createPanel(sectionElements, onClose) {
    const panel = document.createElement('div');
    panel.className = 'accessify-toolbar-v2-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'accessify-toolbar-v2-dialog-title');
    panel.setAttribute('aria-modal', 'true');

    const header = createHeader(onClose);
    const headerEl = header.element;
    const titleEl = headerEl.querySelector('.accessify-toolbar-v2-header-title-text');
    if (titleEl) titleEl.id = 'accessify-toolbar-v2-dialog-title';
    panel.appendChild(headerEl);

    const body = document.createElement('div');
    body.className = 'accessify-toolbar-v2-panel-body';
    sectionElements.forEach((el) => {
      if (el && el.nodeType === Node.ELEMENT_NODE) body.appendChild(el);
    });
    panel.appendChild(body);

    return {
      panel,
      refreshHeaderLabels: header.refreshLabels
    };
  }

  /**
   * Toolbar V2 — Section wrapper (label + control area)
   * labelKey is an i18n key (e.g. 'sectionTextSize'); label is translated via t(labelKey).
   */


  function createSection(labelKey, controlElements) {
    const section = document.createElement('div');
    section.className = 'accessify-toolbar-v2-section';
    const label = document.createElement('span');
    label.className = 'accessify-toolbar-v2-section-label';
    label.setAttribute('data-section-label-key', labelKey);
    label.textContent = t(labelKey);
    label.id = 'accessify-toolbar-v2-label-' + labelKey.replace(/\s+/g, '-').toLowerCase();
    const controls = document.createElement('div');
    controls.className = 'accessify-toolbar-v2-section-controls';
    const nodes = Array.isArray(controlElements) ? controlElements : [controlElements];
    nodes.forEach((node) => {
      if (node && node.nodeType === Node.ELEMENT_NODE) controls.appendChild(node);
    });
    section.appendChild(label);
    section.appendChild(controls);
    return section;
  }

  /**
   * Toolbar V2 — Text size: decrease, value %, increase
   */


  function createTextSizeControl(getState, onDecrease, onIncrease) {
    const decreaseBtn = document.createElement('button');
    decreaseBtn.type = 'button';
    decreaseBtn.className = 'accessify-toolbar-v2-btn';
    decreaseBtn.setAttribute('aria-label', t('decreaseTextSize'));
    decreaseBtn.title = t('decreaseTextSize');
    decreaseBtn.appendChild(iconElement(icons.typeSmall));
    const smallA = document.createElement('span');
    smallA.className = 'accessify-toolbar-v2-text-a';
    smallA.textContent = 'A';
    smallA.style.fontSize = '0.75rem';
    smallA.style.fontWeight = '700';
    decreaseBtn.appendChild(smallA);

    const valueSpan = document.createElement('span');
    valueSpan.className = 'accessify-toolbar-v2-value';
    valueSpan.setAttribute('aria-live', 'polite');

    const increaseBtn = document.createElement('button');
    increaseBtn.type = 'button';
    increaseBtn.className = 'accessify-toolbar-v2-btn';
    increaseBtn.setAttribute('aria-label', t('increaseTextSize'));
    increaseBtn.title = t('increaseTextSize');
    increaseBtn.appendChild(iconElement(icons.typeLarge));
    const largeA = document.createElement('span');
    largeA.className = 'accessify-toolbar-v2-text-a';
    largeA.textContent = 'A';
    largeA.style.fontSize = '1rem';
    largeA.style.fontWeight = '700';
    increaseBtn.appendChild(largeA);

    function update() {
      const textSize = getState().textSize;
      valueSpan.textContent = textSize + '%';
      decreaseBtn.disabled = textSize <= TEXT_SIZE_MIN;
      increaseBtn.disabled = textSize >= TEXT_SIZE_MAX;
    }

    function refreshLabels() {
      decreaseBtn.setAttribute('aria-label', t('decreaseTextSize'));
      decreaseBtn.title = t('decreaseTextSize');
      increaseBtn.setAttribute('aria-label', t('increaseTextSize'));
      increaseBtn.title = t('increaseTextSize');
    }

    decreaseBtn.addEventListener('click', () => {
      onDecrease();
      update();
    });
    increaseBtn.addEventListener('click', () => {
      onIncrease();
      update();
    });

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.width = '100%';
    decreaseBtn.style.flex = '1';
    increaseBtn.style.flex = '1';
    const valueWrap = document.createElement('div');
    valueWrap.style.display = 'flex';
    valueWrap.style.flexDirection = 'column';
    valueWrap.style.alignItems = 'center';
    valueWrap.style.padding = '0 8px';
    valueWrap.appendChild(valueSpan);
    row.appendChild(decreaseBtn);
    row.appendChild(valueWrap);
    row.appendChild(increaseBtn);

    update();
    return { section: createSection('sectionTextSize', row), update, refreshLabels };
  }

  /**
   * Toolbar V2 — ARIA live region for announcing setting changes to screen readers.
   * WCAG 2.1: dynamic updates should notify assistive tech.
   */

  const ID = 'accessify-toolbar-v2-live';
  const CLEAR_MS = 600;

  let el = null;

  function getLiveRegion() {
    if (el && el.isConnected) return el;
    el = document.createElement('div');
    el.id = ID;
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.className = 'accessify-toolbar-v2-live';
    document.body.appendChild(el);
    return el;
  }

  /**
   * Announce a message to screen readers. Clears after a short delay so the same message can be re-announced.
   * @param {string} message
   */
  function announce(message) {
    if (!message) return;
    const region = getLiveRegion();
    region.textContent = '';
    requestAnimationFrame(() => {
      region.textContent = message;
      setTimeout(() => {
        region.textContent = '';
      }, CLEAR_MS);
    });
  }

  /**
   * Toolbar V2 — Contrast: cycle Normal → High → Dark → Normal
   */

  const LABEL_KEYS$1 = { normal: 'contrastNormal', high: 'contrastHigh', dark: 'contrastDark' };

  function getIcon(mode) {
    if (mode === 'high') return icons.contrast;
    if (mode === 'dark') return icons.moon;
    return icons.sun;
  }

  function setAriaLabel$1(btn, mode) {
    const modeLabel = t(LABEL_KEYS$1[mode] || 'contrastNormal');
    btn.setAttribute('aria-label', t('contrastAriaLabelCurrent', { mode: modeLabel }));
  }

  function createContrastControl(getState, onCycle) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accessify-toolbar-v2-btn';
    btn.title = t('contrastTitle');
    const iconWrap = iconElement(icons.sun);
    const labelSpan = document.createElement('span');
    btn.appendChild(iconWrap);
    btn.appendChild(labelSpan);

    function update() {
      const mode = getState().contrastMode;
      iconWrap.innerHTML = getIcon(mode);
      labelSpan.textContent = t(LABEL_KEYS$1[mode] || 'contrastNormal');
      setAriaLabel$1(btn, mode);
    }

    function refreshLabels() {
      btn.title = t('contrastTitle');
      update();
    }

    btn.addEventListener('click', () => {
      onCycle();
      update();
      const modeLabel = t(LABEL_KEYS$1[getState().contrastMode] || 'contrastNormal');
      announce(t('announceContrast', { mode: modeLabel }));
    });

    update();
    return { section: createSection('sectionContrast', btn), update, refreshLabels };
  }

  /**
   * Toolbar V2 — Spacing: toggle Normal / Wide
   */


  function createSpacingControl(getState, onToggle) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accessify-toolbar-v2-btn';
    btn.setAttribute('aria-label', t('toggleSpacing'));
    btn.title = t('spacingTitle');
    btn.setAttribute('aria-pressed', 'false');
    btn.appendChild(iconElement(icons.alignJustify));
    const labelSpan = document.createElement('span');
    btn.appendChild(labelSpan);

    function update() {
      const wide = getState().textSpacing === 'wide';
      labelSpan.textContent = wide ? t('spacingWide') : t('spacingNormal');
      btn.setAttribute('aria-pressed', wide ? 'true' : 'false');
    }

    function refreshLabels() {
      btn.setAttribute('aria-label', t('toggleSpacing'));
      btn.title = t('spacingTitle');
      update();
    }

    btn.addEventListener('click', () => {
      onToggle();
      update();
      const wide = getState().textSpacing === 'wide';
      announce(t('announceSpacing', { state: wide ? t('spacingWide') : t('spacingNormal') }));
    });

    update();
    return { section: createSection('sectionSpacing', btn), update, refreshLabels };
  }

  /**
   * Toolbar V2 — Font: toggle Default / Dyslexia (with "D" badge)
   */


  function createFontControl(getState, onToggle) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accessify-toolbar-v2-btn';
    btn.setAttribute('aria-label', t('toggleFont'));
    btn.title = t('fontTitle');
    btn.setAttribute('aria-pressed', 'false');
    btn.appendChild(fontDBadge());
    const labelSpan = document.createElement('span');
    btn.appendChild(labelSpan);

    function update() {
      const dyslexia = getState().fontType === 'dyslexia';
      labelSpan.textContent = dyslexia ? t('fontDyslexia') : t('fontDefault');
      btn.setAttribute('aria-pressed', dyslexia ? 'true' : 'false');
    }

    function refreshLabels() {
      btn.setAttribute('aria-label', t('toggleFont'));
      btn.title = t('fontTitle');
      update();
    }

    btn.addEventListener('click', () => {
      onToggle();
      update();
      const dyslexia = getState().fontType === 'dyslexia';
      announce(t('announceFont', { state: dyslexia ? t('on') : t('off') }));
    });

    update();
    return { section: createSection('sectionFont', btn), update, refreshLabels };
  }

  /**
   * Toolbar V2 — Links: toggle OFF / ON (highlight links)
   */


  function createLinksControl(getState, onToggle) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accessify-toolbar-v2-btn';
    btn.setAttribute('aria-label', t('toggleLinks'));
    btn.title = t('linksTitle');
    btn.setAttribute('aria-pressed', 'false');
    btn.appendChild(iconElement(icons.link));
    const labelSpan = document.createElement('span');
    btn.appendChild(labelSpan);

    function update() {
      const on = getState().highlightLinks;
      labelSpan.textContent = on ? t('on') : t('off');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    function refreshLabels() {
      btn.setAttribute('aria-label', t('toggleLinks'));
      btn.title = t('linksTitle');
      update();
    }

    btn.addEventListener('click', () => {
      onToggle();
      update();
      const on = getState().highlightLinks;
      announce(t('announceLinks', { state: on ? t('on') : t('off') }));
    });

    update();
    return { section: createSection('sectionLinks', btn), update, refreshLabels };
  }

  /**
   * Toolbar V2 — Cursor: toggle OFF / ON (cursor highlight circle)
   */


  function createCursorControl(getState, onToggle) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accessify-toolbar-v2-btn';
    btn.setAttribute('aria-label', t('toggleCursor'));
    btn.title = t('cursorTitle');
    btn.setAttribute('aria-pressed', 'false');
    btn.appendChild(iconElement(icons.mousePointer));
    const labelSpan = document.createElement('span');
    btn.appendChild(labelSpan);

    function update() {
      const on = getState().highlightCursor;
      labelSpan.textContent = on ? t('on') : t('off');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    function refreshLabels() {
      btn.setAttribute('aria-label', t('toggleCursor'));
      btn.title = t('cursorTitle');
      update();
    }

    btn.addEventListener('click', () => {
      onToggle();
      update();
      const on = getState().highlightCursor;
      announce(t('announceCursor', { state: on ? t('on') : t('off') }));
    });

    update();
    return { section: createSection('sectionCursor', btn), update, refreshLabels };
  }

  /**
   * Toolbar V2 — Reset: full-width button to restore defaults
   */


  function createResetControl(onReset) {
    const wrap = document.createElement('div');
    wrap.className = 'accessify-toolbar-v2-section accessify-toolbar-v2-reset';
    wrap.setAttribute('data-control-id', 'reset');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accessify-toolbar-v2-btn';
    btn.setAttribute('aria-label', t('resetAriaLabel'));
    btn.title = t('resetTitle');
    btn.appendChild(iconElement(icons.rotateCcw));
    const labelSpan = document.createElement('span');
    labelSpan.textContent = t('resetLabel');
    btn.appendChild(labelSpan);
    wrap.appendChild(btn);

    function refreshLabels() {
      btn.setAttribute('aria-label', t('resetAriaLabel'));
      btn.title = t('resetTitle');
      labelSpan.textContent = t('resetLabel');
    }

    btn.addEventListener('click', () => {
      onReset();
      announce(t('announceReset'));
    });
    return { section: wrap, update: () => {}, refreshLabels };
  }

  /**
   * Toolbar V2 — Language: switch UI language (e.g. English / Hebrew)
   */


  /**
   * @param {() => Record<string, unknown>} getState
   * @param {{ onLanguageChange?: (lang: string) => void }} handlers — onLanguageChange called after language is set (e.g. to save and refresh)
   */
  function createLanguageControl(getState, handlers = {}) {
    const container = document.createElement('div');
    container.className = 'accessify-toolbar-v2-language-buttons';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', t('sectionLanguage'));

    /** @type {Map<string, HTMLButtonElement>} */
    const buttonsByLang = new Map();

    function render() {
      container.innerHTML = '';
      const current = getLanguage();
      for (const lang of getSupportedLanguages()) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'accessify-toolbar-v2-btn accessify-toolbar-v2-language-btn';
        btn.setAttribute('aria-pressed', lang === current ? 'true' : 'false');
        btn.textContent = lang === 'en' ? t('languageEn') : lang === 'he' ? t('languageHe') : lang.toUpperCase();
        btn.addEventListener('click', () => {
          if (getLanguage() === lang) return;
          setLanguage(lang);
          handlers.onLanguageChange && handlers.onLanguageChange(lang);
          render();
        });
        buttonsByLang.set(lang, btn);
        container.appendChild(btn);
      }
    }

    function update() {
      const current = getLanguage();
      buttonsByLang.forEach((btn, lang) => {
        btn.setAttribute('aria-pressed', lang === current ? 'true' : 'false');
        btn.textContent = lang === 'en' ? t('languageEn') : lang === 'he' ? t('languageHe') : lang.toUpperCase();
      });
    }

    render();
    return { section: createSection('sectionLanguage', container), update };
  }

  /**
   * Toolbar V2 — Color Adjustments: cycle color filters (None → Grayscale → Invert → None)
   */

  const LABEL_KEYS = {
    none: 'colorFilterNone',
    grayscale: 'colorFilterGrayscale',
    invert: 'colorFilterInvert'
  };

  function setAriaLabel(btn, mode) {
    const modeLabel = t(LABEL_KEYS[mode] || 'colorFilterNone');
    btn.setAttribute('aria-label', t('colorFilterAriaLabelCurrent', { mode: modeLabel }));
  }

  function createColorAdjustmentsControl(getState, onCycle) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accessify-toolbar-v2-btn';
    btn.title = t('colorAdjustmentsTitle');
    const iconWrap = iconElement(icons.palette);
    const labelSpan = document.createElement('span');
    btn.appendChild(iconWrap);
    btn.appendChild(labelSpan);

    function update() {
      const mode = getState().colorFilter || 'none';
      labelSpan.textContent = t(LABEL_KEYS[mode] || 'colorFilterNone');
      setAriaLabel(btn, mode);
    }

    function refreshLabels() {
      btn.title = t('colorAdjustmentsTitle');
      update();
    }

    btn.addEventListener('click', () => {
      onCycle();
      update();
      const modeLabel = t(LABEL_KEYS[getState().colorFilter] || 'colorFilterNone');
      announce(t('announceColorFilter', { mode: modeLabel }));
    });

    update();
    return { section: createSection('sectionColorAdjustments', btn), update, refreshLabels };
  }

  /**
   * Toolbar V2 — Single source of truth for controls.
   * Site author chooses which controls are available; user visibility is persisted.
   */


  /** @typedef {{ id: string, labelKey: string, defaultVisible: boolean, customizable: boolean, create: (getState: () => unknown, handlers: Record<string, unknown>) => { section: HTMLElement, update: () => void } }} ControlDef */

  /** @type {ControlDef[]} */
  const REGISTRY = [
    {
      id: 'textSize',
      labelKey: 'controlTextSize',
      defaultVisible: true,
      customizable: true,
      create: (getState, h) => createTextSizeControl(getState, h.onDecrease, h.onIncrease)
    },
    {
      id: 'contrast',
      labelKey: 'controlContrast',
      defaultVisible: true,
      customizable: true,
      create: (getState, h) => createContrastControl(getState, h.onContrastCycle)
    },
    {
      id: 'spacing',
      labelKey: 'controlSpacing',
      defaultVisible: true,
      customizable: true,
      create: (getState, h) => createSpacingControl(getState, h.onSpacingToggle)
    },
    {
      id: 'font',
      labelKey: 'controlFont',
      defaultVisible: true,
      customizable: true,
      create: (getState, h) => createFontControl(getState, h.onFontToggle)
    },
    {
      id: 'links',
      labelKey: 'controlLinks',
      defaultVisible: true,
      customizable: true,
      create: (getState, h) => createLinksControl(getState, h.onLinksToggle)
    },
    {
      id: 'cursor',
      labelKey: 'controlCursor',
      defaultVisible: true,
      customizable: true,
      create: (getState, h) => createCursorControl(getState, h.onCursorToggle)
    },
    {
      id: 'colorAdjustments',
      labelKey: 'controlColorAdjustments',
      defaultVisible: false,
      customizable: true,
      create: (getState, h) => createColorAdjustmentsControl(getState, h.onColorFilterCycle)
    },
    {
      id: 'reset',
      labelKey: 'controlReset',
      defaultVisible: true,
      customizable: false,
      create: (_getState, h) => createResetControl(h.onReset)
    },
    {
      id: 'language',
      labelKey: 'controlLanguage',
      defaultVisible: false,
      customizable: true,
      create: (getState, h) => createLanguageControl(getState, h)
    }
  ];

  const BY_ID = new Map(REGISTRY.map((def) => [def.id, def]));

  /**
   * @returns {string[]} All registered control ids in display order.
   */
  function getControlIds() {
    return REGISTRY.map((d) => d.id);
  }

  /**
   * @param {string} id
   * @returns {ControlDef | undefined}
   */
  function getControl(id) {
    return BY_ID.get(id);
  }

  /**
   * Default visibility for each customizable control (used for new users and merge).
   * @returns {Record<string, boolean>}
   */
  function getDefaultVisibleControls() {
    const out = /** @type {Record<string, boolean>} */ ({});
    for (const def of REGISTRY) {
      if (def.customizable) out[def.id] = def.defaultVisible;
    }
    return out;
  }

  /**
   * Create a control by id.
   * @param {string} id
   * @param {() => Record<string, unknown>} getState
   * @param {Record<string, unknown>} handlers
   * @returns {{ section: HTMLElement, update: () => void } | null}
   */
  function createControl(id, getState, handlers) {
    const def = BY_ID.get(id);
    if (!def) return null;
    return def.create(getState, handlers);
  }

  /**
   * @param {string[]} [availableIds] If provided, only these controls are available; otherwise all.
   * @returns {string[]}
   */
  function resolveAvailableIds(availableIds) {
    const all = getControlIds();
    if (!availableIds || availableIds.length === 0) return all;
    return availableIds.filter((id) => BY_ID.has(id));
  }

  /**
   * Toolbar V2 — Customize: collapsible "Show or hide tools" (minimized by default)
   */


  /**
   * @param {string[]} availableIds — Control ids the site author made available
   * @param {() => Record<string, boolean>} getVisible — Current visibility map
   * @param {(id: string, visible: boolean) => void} onToggle — Called when user toggles a control
   * @returns {{ section: HTMLElement, setVisible: (id: string, visible: boolean) => void, refreshLabels: () => void }}
   */
  function createCustomizeSection(availableIds, getVisible, onToggle) {
    const visible = getVisible();
    const body = document.createElement('div');
    body.className = 'accessify-toolbar-v2-customize-body';
    /** @type {Map<string, HTMLInputElement>} */
    const checkboxesById = new Map();
    /** @type {Map<string, HTMLElement>} */
    const labelSpansById = new Map();
    /** @type {HTMLButtonElement | null} */
    let headerBtn = null;
    /** @type {HTMLElement | null} */
    let headerLabelEl = null;

    for (const id of availableIds) {
      const def = getControl(id);
      if (!def || !def.customizable) continue;

      const label = document.createElement('label');
      label.className = 'accessify-toolbar-v2-customize-label';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'accessify-toolbar-v2-customize-checkbox';
      input.setAttribute('data-aria-label-key', 'showControl');
      input.setAttribute('data-aria-label-vars', JSON.stringify({ label: def.labelKey }));
      input.setAttribute('aria-label', t('showControl', { label: t(def.labelKey) }));
      input.checked = visible[id] !== false;
      checkboxesById.set(id, input);

      const span = document.createElement('span');
      span.className = 'accessify-toolbar-v2-customize-label-text';
      span.setAttribute('data-label-key', def.labelKey);
      span.textContent = t(def.labelKey);
      labelSpansById.set(id, span);

      label.appendChild(input);
      label.appendChild(span);

      input.addEventListener('change', () => {
        const next = !!input.checked;
        onToggle(id, next);
      });

      body.appendChild(label);
    }

    const section = document.createElement('div');
    section.className = 'accessify-toolbar-v2-section accessify-toolbar-v2-customize';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'accessify-toolbar-v2-customize-header';
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', 'accessify-toolbar-v2-customize-body');
    header.setAttribute('aria-label', t('customizeHeader'));
    headerBtn = header;
    const headerLabel = document.createElement('span');
    headerLabel.className = 'accessify-toolbar-v2-customize-header-label';
    headerLabel.textContent = t('customizeHeader');
    headerLabelEl = headerLabel;
    const chevron = iconElement(icons.chevronDown, 'accessify-toolbar-v2-customize-chevron');
    header.appendChild(headerLabel);
    header.appendChild(chevron);

    body.id = 'accessify-toolbar-v2-customize-body';
    body.hidden = true;

    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      const next = !expanded;
      header.setAttribute('aria-expanded', String(next));
      body.hidden = !next;
      section.classList.toggle('accessify-toolbar-v2-customize-open', next);
    });

    section.appendChild(header);
    section.appendChild(body);

    function refreshLabels() {
      headerBtn && headerBtn.setAttribute('aria-label', t('customizeHeader'));
      if (headerLabelEl) headerLabelEl.textContent = t('customizeHeader');
      labelSpansById.forEach((span, id) => {
        const def = getControl(id);
        if (def) span.textContent = t(def.labelKey);
      });
      checkboxesById.forEach((input, id) => {
        const def = getControl(id);
        if (def) input.setAttribute('aria-label', t('showControl', { label: t(def.labelKey) }));
      });
    }

    return {
      section,
      setVisible: (id, visible) => {
        const box = checkboxesById.get(id);
        if (box) box.checked = visible;
      },
      refreshLabels
    };
  }

  /**
   * Toolbar V2 — Main component
   * Composes trigger, panel, controls; manages state, persistence, and DOM application.
   * Site author sets available controls; user visibility is persisted. WCAG 2.1 AA.
   */


  class ToolbarV2 {
    /**
     * @param {{ availableControls?: string[], syncWithPageLanguage?: boolean }} [options]
     * — availableControls: if provided, only these control ids are available; otherwise all.
     * — syncWithPageLanguage: if true, toolbar language syncs with document.documentElement.lang/dir in both directions
     *   (page lang on init/change updates toolbar; toolbar language change updates html lang and dir).
     */
    constructor(options = {}) {
      this.options = options;
      this.syncWithPageLanguage = !!options.syncWithPageLanguage;
      this.settings = { ...defaultSettings };
      this.isOpen = false;
      this.trigger = null;
      this.panel = null;
      this.panelBody = null;
      this.cursorHighlight = new CursorHighlight();
      this.controlUpdates = [];
      this.customizeSetVisible = null;
      this._boundKeydown = this._onKeydown.bind(this);
    }

    /**
     * Initialize: inject styles, load settings, merge visibleControls, apply to DOM, mount UI.
     */
    init() {
      injectStyles();
      this.settings = loadSettings();
      this.settings.visibleControls = { ...getDefaultVisibleControls(), ...this.settings.visibleControls };

      // Always recognize page language first: lang attribute, then dir=rtl, then saved settings
      const pageLang = normalizePageLang(document.documentElement.getAttribute('lang'));
      const pageDir = document.documentElement.getAttribute('dir');
      if (pageLang) {
        setLanguage(pageLang);
        this.settings.language = pageLang;
        saveSettings(this.settings);
      } else if (pageDir === 'rtl') {
        setLanguage('he');
        this.settings.language = 'he';
        saveSettings(this.settings);
      } else if (this.settings.language) {
        setLanguage(this.settings.language);
      } else {
        setLanguage('en');
        this.settings.language = 'en';
      }
      this._initialLanguage = this.settings.language;

      const availableIds = resolveAvailableIds(this.options.availableControls);
      const getState = () => this.settings;

      const onDecrease = () => {
        this.settings.textSize = Math.max(TEXT_SIZE_MIN, this.settings.textSize - TEXT_SIZE_STEP);
        this._persistAndApply();
      };
      const onIncrease = () => {
        this.settings.textSize = Math.min(TEXT_SIZE_MAX, this.settings.textSize + TEXT_SIZE_STEP);
        this._persistAndApply();
      };
      const onContrastCycle = () => {
        const idx = ['normal', 'high', 'dark'].indexOf(this.settings.contrastMode);
        this.settings.contrastMode = ['normal', 'high', 'dark'][(idx + 1) % 3];
        this._persistAndApply();
      };
      const onSpacingToggle = () => {
        this.settings.textSpacing = this.settings.textSpacing === 'wide' ? 'normal' : 'wide';
        this._persistAndApply();
      };
      const onFontToggle = () => {
        this.settings.fontType = this.settings.fontType === 'dyslexia' ? 'default' : 'dyslexia';
        this._persistAndApply();
      };
      const onLinksToggle = () => {
        this.settings.highlightLinks = !this.settings.highlightLinks;
        this._persistAndApply();
      };
      const onCursorToggle = () => {
        this.settings.highlightCursor = !this.settings.highlightCursor;
        this._persistAndApply();
        this.cursorHighlight.setVisible(this.settings.highlightCursor);
      };
      const onColorFilterCycle = () => {
        const modes = ['none', 'grayscale', 'invert'];
        const idx = modes.indexOf(this.settings.colorFilter || 'none');
        this.settings.colorFilter = modes[(idx + 1) % modes.length];
        this._persistAndApply();
      };
      const onReset = () => {
        const initialLang = this._initialLanguage || defaultSettings.language;
        this.settings = { ...defaultSettings, language: initialLang, visibleControls: getDefaultVisibleControls() };
        setLanguage(initialLang);
        if (this.syncWithPageLanguage) {
          document.documentElement.setAttribute('lang', initialLang);
          document.documentElement.setAttribute('dir', getDirForLang(initialLang));
        }
        this._persistAndApply();
        this.cursorHighlight.setVisible(false);
        this._applyVisibleControls();
        this._refreshAllLabels();
        this.controlUpdates.forEach((fn) => fn());
      };

      const onLanguageChange = (lang) => {
        this.settings.language = lang;
        saveSettings(this.settings);
        if (this.syncWithPageLanguage) {
          document.documentElement.setAttribute('lang', lang);
          document.documentElement.setAttribute('dir', getDirForLang(lang));
        }
        this._refreshAllLabels();
      };

      const handlers = {
        textSize: { onDecrease, onIncrease },
        contrast: { onContrastCycle },
        spacing: { onSpacingToggle },
        font: { onFontToggle },
        links: { onLinksToggle },
        cursor: { onCursorToggle },
        reset: { onReset },
        language: { onLanguageChange },
        colorAdjustments: { onColorFilterCycle }
      };

      const customize = createCustomizeSection(
        availableIds,
        () => this.settings.visibleControls || {},
        (id, visible) => {
          if (!this.settings.visibleControls) this.settings.visibleControls = {};
          this.settings.visibleControls[id] = visible;
          saveSettings(this.settings);
          this._applyVisibleControls();
        }
      );
      this.customizeSetVisible = customize.setVisible;

      const sections = [customize.section];
      const updates = [];
      /** @type {Array<() => void>} */
      const refreshLabelFns = [];

      for (const id of availableIds) {
        const def = getControl(id);
        if (!def) continue;
        const control = createControl(id, getState, handlers[id] || {});
        if (!control) continue;
        control.section.setAttribute('data-control-id', id);
        sections.push(control.section);
        if (control.update) updates.push(control.update);
        if (control.refreshLabels) refreshLabelFns.push(control.refreshLabels);
      }

      this.controlUpdates = updates;
      this._refreshLabelFns = refreshLabelFns;
      this._customizeRefreshLabels = customize.refreshLabels;

      this.trigger = createTrigger(() => this.toggle(), () => this.isOpen);
      this._updateTriggerDir();
      const panelResult = createPanel(sections, () => this.close());
      this.panel = panelResult.panel;
      this._refreshHeaderLabels = panelResult.refreshHeaderLabels;
      this.panelBody = this.panel.querySelector('.accessify-toolbar-v2-panel-body');

      this._unsubscribeLanguage = subscribe(() => this._refreshAllLabels());

      const contentWrapper = document.createElement('div');
      contentWrapper.id = 'accessify-toolbar-v2-content-wrapper';
      while (document.body.firstChild) {
        contentWrapper.appendChild(document.body.firstChild);
      }
      document.body.appendChild(contentWrapper);
      document.body.appendChild(this.trigger.element);
      this.panel.style.display = 'none';
      document.body.appendChild(this.panel);
      this._contentWrapper = contentWrapper;

      this._applyVisibleControls();
      this._applySettingsToDocument();

      this.cursorHighlight.mount();
      this.cursorHighlight.setVisible(this.settings.highlightCursor);

      this._refreshAllLabels();

      if (this.syncWithPageLanguage) {
        this._langObserver = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.attributeName === 'lang' || m.attributeName === 'dir') {
              const pageLang = normalizePageLang(document.documentElement.getAttribute('lang'));
              if (pageLang && pageLang !== getLanguage()) {
                setLanguage(pageLang);
                this.settings.language = pageLang;
                saveSettings(this.settings);
                this._refreshAllLabels();
              }
              break;
            }
          }
        });
        this._langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
      }

      document.addEventListener('keydown', this._boundKeydown);
    }

    /**
     * Position trigger by language: Hebrew = left (RTL), English = right (LTR).
     * Uses dir on trigger so CSS inset-inline-end places it correctly.
     */
    _updateTriggerDir() {
      if (this.trigger && this.trigger.element) {
        const dir = getLanguage() === 'he' ? 'rtl' : 'ltr';
        this.trigger.element.setAttribute('dir', dir);
      }
    }

    /**
     * Refresh all UI labels after language change.
     */
    _refreshAllLabels() {
      const lang = getLanguage();
      if (this.panel) {
        this.panel.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
        this.panel.setAttribute('lang', lang);
      }
      this._updateTriggerDir();
      if (this.trigger && this.trigger.refreshLabels) this.trigger.refreshLabels();
      if (this._refreshHeaderLabels) this._refreshHeaderLabels();
      if (this._customizeRefreshLabels) this._customizeRefreshLabels();
      if (this.panel) {
        this.panel.querySelectorAll('[data-section-label-key]').forEach((el) => {
          const key = el.getAttribute('data-section-label-key');
          if (key) el.textContent = t(key);
        });
      }
      (this._refreshLabelFns || []).forEach((fn) => fn());
      this.controlUpdates.forEach((fn) => fn());
    }

    /**
     * Show/hide control sections and sync Customize checkboxes from settings.visibleControls.
     */
    _applyVisibleControls() {
      const visible = this.settings.visibleControls || {};
      if (!this.panelBody) return;
      this.panelBody.querySelectorAll('[data-control-id]').forEach((el) => {
        const id = el.getAttribute('data-control-id');
        const def = id ? getControl(id) : null;
        const show = def && (def.customizable ? visible[id] !== false : true);
        el.style.display = show ? '' : 'none';
      });
      if (this.customizeSetVisible) {
        for (const id of Object.keys(visible)) {
          this.customizeSetVisible(id, visible[id] !== false);
        }
      }
    }

    _applySettingsToDocument() {
      document.documentElement.style.fontSize = this.settings.textSize + '%';
      const body = document.body;
      const wrapper = this._contentWrapper;
      if (wrapper) {
        wrapper.classList.remove('contrast-normal', 'contrast-high', 'contrast-dark');
        wrapper.classList.add('contrast-' + (this.settings.contrastMode || 'normal'));
      } else {
        body.classList.remove('contrast-normal', 'contrast-high', 'contrast-dark');
        body.classList.add('contrast-' + (this.settings.contrastMode || 'normal'));
      }
      if (this.settings.textSpacing === 'wide') body.classList.add('text-spacing-wide');
      else body.classList.remove('text-spacing-wide');
      if (this.settings.fontType === 'dyslexia') body.classList.add('font-dyslexia');
      else body.classList.remove('font-dyslexia');
      if (this.settings.highlightLinks) body.classList.add('highlight-links');
      else body.classList.remove('highlight-links');
      if (this.settings.highlightCursor) body.classList.add('highlight-cursor');
      else body.classList.remove('highlight-cursor');
      const wrapperOrBody = wrapper || body;
      const colorFilter = ['none', 'grayscale', 'invert'].includes(this.settings.colorFilter) ? this.settings.colorFilter : 'none';
      wrapperOrBody.classList.remove('color-filter-none', 'color-filter-grayscale', 'color-filter-invert');
      wrapperOrBody.classList.add('color-filter-' + colorFilter);
    }

    _persistAndApply() {
      const scrollX = window.scrollX ?? document.documentElement.scrollLeft;
      const scrollY = window.scrollY ?? document.documentElement.scrollTop;
      saveSettings(this.settings);
      this._applySettingsToDocument();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(scrollX, scrollY);
        });
      });
    }

    _onKeydown(e) {
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    }

    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.panel.style.display = '';
      this.trigger.setExpanded(true);
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.panel.style.display = 'none';
      this.trigger.setExpanded(false);
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    /**
     * Destroy: remove DOM, listeners, cursor highlight.
     */
    destroy() {
      if (this._unsubscribeLanguage) this._unsubscribeLanguage();
      if (this._langObserver) {
        this._langObserver.disconnect();
        this._langObserver = null;
      }
      document.removeEventListener('keydown', this._boundKeydown);
      if (this.trigger && this.trigger.element.parentNode) this.trigger.element.parentNode.removeChild(this.trigger.element);
      if (this.panel && this.panel.parentNode) this.panel.parentNode.removeChild(this.panel);
      this.cursorHighlight.unmount();
      document.documentElement.style.fontSize = '';
      document.body.classList.remove('text-spacing-wide', 'font-dyslexia', 'highlight-links', 'highlight-cursor', 'color-filter-none', 'color-filter-grayscale', 'color-filter-invert');
      if (this._contentWrapper && this._contentWrapper.parentNode) {
        const parent = this._contentWrapper.parentNode;
        while (this._contentWrapper.firstChild) {
          parent.insertBefore(this._contentWrapper.firstChild, this._contentWrapper);
        }
        parent.removeChild(this._contentWrapper);
      }
    }

    /**
     * Get current settings (for integration with existing Accessify).
     */
    getSettings() {
      return { ...this.settings };
    }
  }

  /**
   * Accessify - Web Accessibility Toolkit (Toolbar V2)
   *
   * Exposes the Figma-based accessibility toolbar supporting WCAG 2.1 AA,
   * RTL, and multilingual (e.g. English, Hebrew).
   *
   * Usage:
   *   var toolbar = new Accessify.ToolbarV2();
   *   toolbar.init();
   */


  // Namespace for UMD/global so scripts can use new Accessify.ToolbarV2()
  const Accessify = { ToolbarV2 };

  if (typeof window !== 'undefined') {
    window.Accessify = Accessify;
  }

  exports.ToolbarV2 = ToolbarV2;
  exports.default = Accessify;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=accessify.js.map
