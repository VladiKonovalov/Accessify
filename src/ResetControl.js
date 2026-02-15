/**
 * Toolbar V2 — Reset: full-width button to restore defaults
 */

import { icons, iconElement } from './icons.js';
import { t } from './i18n.js';
import { announce } from './LiveAnnouncer.js';

export function createResetControl(onReset) {
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
