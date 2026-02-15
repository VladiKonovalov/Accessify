/**
 * Toolbar V2 — Font: toggle Default / Dyslexia (with "D" badge)
 */

import { fontDBadge } from './icons.js';
import { createSection } from './ToolbarSection.js';
import { t } from './i18n.js';
import { announce } from './LiveAnnouncer.js';

export function createFontControl(getState, onToggle) {
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
