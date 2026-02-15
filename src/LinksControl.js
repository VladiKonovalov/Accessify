/**
 * Toolbar V2 — Links: toggle OFF / ON (highlight links)
 */

import { icons, iconElement } from './icons.js';
import { createSection } from './ToolbarSection.js';
import { t } from './i18n.js';
import { announce } from './LiveAnnouncer.js';

export function createLinksControl(getState, onToggle) {
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
