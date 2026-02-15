/**
 * Toolbar V2 — Contrast: cycle Normal → High → Dark → Normal
 */

import { icons, iconElement } from './icons.js';
import { createSection } from './ToolbarSection.js';
import { t } from './i18n.js';
import { announce } from './LiveAnnouncer.js';

const MODES = ['normal', 'high', 'dark'];
const LABEL_KEYS = { normal: 'contrastNormal', high: 'contrastHigh', dark: 'contrastDark' };

function getIcon(mode) {
  if (mode === 'high') return icons.contrast;
  if (mode === 'dark') return icons.moon;
  return icons.sun;
}

function setAriaLabel(btn, mode) {
  const modeLabel = t(LABEL_KEYS[mode] || 'contrastNormal');
  btn.setAttribute('aria-label', t('contrastAriaLabelCurrent', { mode: modeLabel }));
}

export function createContrastControl(getState, onCycle) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'accessify-toolbar-v2-btn';
  btn.title = t('contrastTitle');
  const iconWrap = iconElement(icons.sun);
  const labelSpan = document.createElement('span');
  btn.appendChild(iconWrap);
  btn.appendChild(labelSpan);

  function update() {
    const mode = getState().contrastMode;
    iconWrap.innerHTML = getIcon(mode);
    labelSpan.textContent = t(LABEL_KEYS[mode] || 'contrastNormal');
    setAriaLabel(btn, mode);
  }

  function refreshLabels() {
    btn.title = t('contrastTitle');
    update();
  }

  btn.addEventListener('click', () => {
    onCycle();
    update();
    const modeLabel = t(LABEL_KEYS[getState().contrastMode] || 'contrastNormal');
    announce(t('announceContrast', { mode: modeLabel }));
  });

  update();
  return { section: createSection('sectionContrast', btn), update, refreshLabels };
}
