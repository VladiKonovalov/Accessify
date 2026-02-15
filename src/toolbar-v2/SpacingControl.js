/**
 * Toolbar V2 — Spacing: toggle Normal / Wide
 */

import { icons, iconElement } from './icons.js';
import { createSection } from './ToolbarSection.js';
import { t } from './i18n.js';
import { announce } from './LiveAnnouncer.js';

export function createSpacingControl(getState, onToggle) {
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
