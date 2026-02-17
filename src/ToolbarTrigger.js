/**
 * Toolbar V2 — Floating trigger button (opens/closes panel)
 * Uses embedded icon (base64 data URL) with ♿ emoji fallback when icon fails to load.
 */

import { t } from './i18n.js';
import { ACCESSIFY_ICON_DATA_URL } from './iconDataUrl.js';

const TRIGGER_FALLBACK_EMOJI = '\u267F'; // ♿ Wheelchair Symbol (accessibility)

function showFallback(btn, img) {
  if (img && img.parentNode === btn) btn.removeChild(img);
}

export function createTrigger(onToggle, getOpen) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'accessify-toolbar-v2-trigger';
  btn.setAttribute('aria-label', t('triggerAriaLabel'));
  btn.title = t('triggerTitle');
  btn.setAttribute('aria-expanded', 'false');

  const fallbackSpan = document.createElement('span');
  fallbackSpan.className = 'accessify-toolbar-v2-trigger-fallback';
  fallbackSpan.setAttribute('aria-hidden', 'true');
  fallbackSpan.textContent = TRIGGER_FALLBACK_EMOJI;

  if (ACCESSIFY_ICON_DATA_URL) {
    const img = document.createElement('img');
    img.src = ACCESSIFY_ICON_DATA_URL;
    img.alt = '';
    img.className = 'accessify-toolbar-v2-trigger-icon-img';
    img.setAttribute('aria-hidden', 'true');
    img.onerror = () => showFallback(btn, img);
    img.onload = () => {
      if (img.naturalWidth === 0) showFallback(btn, img);
    };
    btn.appendChild(img);
  }
  btn.appendChild(fallbackSpan);

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
