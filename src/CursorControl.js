/**
 * Toolbar V2 — Cursor: toggle OFF / ON (cursor highlight circle)
 */

import { icons, iconElement } from './icons.js';
import { createSection } from './ToolbarSection.js';
import { t } from './i18n.js';
import { announce } from './LiveAnnouncer.js';

export function createCursorControl(getState, onToggle) {
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
