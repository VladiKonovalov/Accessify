/**
 * Toolbar V2 — Language: switch UI language (e.g. English / Hebrew)
 */

import { createSection } from './ToolbarSection.js';
import { t, getLanguage, setLanguage, getSupportedLanguages } from './i18n.js';

/**
 * @param {() => Record<string, unknown>} getState
 * @param {{ onLanguageChange?: (lang: string) => void }} handlers — onLanguageChange called after language is set (e.g. to save and refresh)
 */
export function createLanguageControl(getState, handlers = {}) {
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
