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
export function t(key, vars) {
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
export function getLanguage() {
  return currentLanguage;
}

/**
 * Set current language and notify subscribers. Does not persist; caller should save settings.
 * @param {string} lang — Language code (e.g. 'en', 'he')
 */
export function setLanguage(lang) {
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
export function subscribe(fn) {
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
export function getSupportedLanguages() {
  return Object.keys(TRANSLATIONS);
}

/**
 * Map HTML lang attribute (e.g. "en-US", "he-IL") to a toolbar-supported language code.
 * Used to sync page language with toolbar. Add mappings when adding new languages.
 * @param {string} htmlLang — document.documentElement.lang
 * @returns {string | null} Toolbar language code or null if not supported
 */
export function normalizePageLang(htmlLang) {
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
export function getDirForLang(lang) {
  return lang === 'he' ? 'rtl' : 'ltr';
}

export { TRANSLATIONS };
