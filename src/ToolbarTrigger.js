/**
 * Toolbar V2 — Floating trigger button (opens/closes panel)
 * Uses embedded icon (base64 data URL) with SVG fallback.
 */

import { icons, iconElement } from './icons.js';
import { t } from './i18n.js';
import { ACCESSIFY_ICON_DATA_URL } from './iconDataUrl.js';

export function createTrigger(onToggle, getOpen) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'accessify-toolbar-v2-trigger';
  btn.setAttribute('aria-label', t('triggerAriaLabel'));
  btn.title = t('triggerTitle');
  btn.setAttribute('aria-expanded', 'false');

  const img = document.createElement('img');
  img.src = ACCESSIFY_ICON_DATA_URL;
  img.alt = '';
  img.className = 'accessify-toolbar-v2-trigger-icon-img';
  img.setAttribute('aria-hidden', 'true');

  const fallbackIcon = iconElement(icons.accessibility);
  fallbackIcon.classList.add('accessify-toolbar-v2-trigger-fallback');

  img.onerror = () => {
    if (img.parentNode === btn) btn.removeChild(img);
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
