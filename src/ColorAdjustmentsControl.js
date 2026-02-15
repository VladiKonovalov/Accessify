/**
 * Toolbar V2 — Color Adjustments: cycle color filters (None → Grayscale → Invert → None)
 */

import { icons, iconElement } from './icons.js';
import { createSection } from './ToolbarSection.js';
import { t } from './i18n.js';
import { announce } from './LiveAnnouncer.js';

const MODES = ['none', 'grayscale', 'invert'];
const LABEL_KEYS = {
  none: 'colorFilterNone',
  grayscale: 'colorFilterGrayscale',
  invert: 'colorFilterInvert'
};

function setAriaLabel(btn, mode) {
  const modeLabel = t(LABEL_KEYS[mode] || 'colorFilterNone');
  btn.setAttribute('aria-label', t('colorFilterAriaLabelCurrent', { mode: modeLabel }));
}

export function createColorAdjustmentsControl(getState, onCycle) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'accessify-toolbar-v2-btn';
  btn.title = t('colorAdjustmentsTitle');
  const iconWrap = iconElement(icons.palette);
  const labelSpan = document.createElement('span');
  btn.appendChild(iconWrap);
  btn.appendChild(labelSpan);

  function update() {
    const mode = getState().colorFilter || 'none';
    labelSpan.textContent = t(LABEL_KEYS[mode] || 'colorFilterNone');
    setAriaLabel(btn, mode);
  }

  function refreshLabels() {
    btn.title = t('colorAdjustmentsTitle');
    update();
  }

  btn.addEventListener('click', () => {
    onCycle();
    update();
    const modeLabel = t(LABEL_KEYS[getState().colorFilter] || 'colorFilterNone');
    announce(t('announceColorFilter', { mode: modeLabel }));
  });

  update();
  return { section: createSection('sectionColorAdjustments', btn), update, refreshLabels };
}
