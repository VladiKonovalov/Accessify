/**
 * Toolbar V2 — Floating trigger button (opens/closes panel)
 * Uses the same icon as version 1 (assets/accessify-icon.png) with SVG fallback.
 */

import { icons, iconElement } from './icons.js';
import { t } from './i18n.js';

/** V1 toggle icon URL; same as version 1 dashboard toggle */
const V1_TRIGGER_ICON_URL = 'assets/accessify-icon.png';
/** Fallback when local path not found (e.g. when used in another project) */
const FALLBACK_ICON_URL = 'https://github.com/VladiKonovalov/Accessify/blob/main/assets/accessify-icon.png?raw=true';

export function createTrigger(onToggle, getOpen) {
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
      img.src = FALLBACK_ICON_URL;
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
