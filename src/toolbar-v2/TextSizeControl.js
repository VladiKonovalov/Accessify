/**
 * Toolbar V2 — Text size: decrease, value %, increase
 */

import { icons, iconElement } from './icons.js';
import { TEXT_SIZE_MIN, TEXT_SIZE_MAX, TEXT_SIZE_STEP } from './constants.js';
import { createSection } from './ToolbarSection.js';
import { t } from './i18n.js';

export function createTextSizeControl(getState, onDecrease, onIncrease) {
  const decreaseBtn = document.createElement('button');
  decreaseBtn.type = 'button';
  decreaseBtn.className = 'accessify-toolbar-v2-btn';
  decreaseBtn.setAttribute('aria-label', t('decreaseTextSize'));
  decreaseBtn.title = t('decreaseTextSize');
  decreaseBtn.appendChild(iconElement(icons.typeSmall));
  const smallA = document.createElement('span');
  smallA.className = 'accessify-toolbar-v2-text-a';
  smallA.textContent = 'A';
  smallA.style.fontSize = '0.75rem';
  smallA.style.fontWeight = '700';
  decreaseBtn.appendChild(smallA);

  const valueSpan = document.createElement('span');
  valueSpan.className = 'accessify-toolbar-v2-value';
  valueSpan.setAttribute('aria-live', 'polite');

  const increaseBtn = document.createElement('button');
  increaseBtn.type = 'button';
  increaseBtn.className = 'accessify-toolbar-v2-btn';
  increaseBtn.setAttribute('aria-label', t('increaseTextSize'));
  increaseBtn.title = t('increaseTextSize');
  increaseBtn.appendChild(iconElement(icons.typeLarge));
  const largeA = document.createElement('span');
  largeA.className = 'accessify-toolbar-v2-text-a';
  largeA.textContent = 'A';
  largeA.style.fontSize = '1rem';
  largeA.style.fontWeight = '700';
  increaseBtn.appendChild(largeA);

  function update() {
    const textSize = getState().textSize;
    valueSpan.textContent = textSize + '%';
    decreaseBtn.disabled = textSize <= TEXT_SIZE_MIN;
    increaseBtn.disabled = textSize >= TEXT_SIZE_MAX;
  }

  function refreshLabels() {
    decreaseBtn.setAttribute('aria-label', t('decreaseTextSize'));
    decreaseBtn.title = t('decreaseTextSize');
    increaseBtn.setAttribute('aria-label', t('increaseTextSize'));
    increaseBtn.title = t('increaseTextSize');
  }

  decreaseBtn.addEventListener('click', () => {
    onDecrease();
    update();
  });
  increaseBtn.addEventListener('click', () => {
    onIncrease();
    update();
  });

  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.gap = '8px';
  row.style.width = '100%';
  decreaseBtn.style.flex = '1';
  increaseBtn.style.flex = '1';
  const valueWrap = document.createElement('div');
  valueWrap.style.display = 'flex';
  valueWrap.style.flexDirection = 'column';
  valueWrap.style.alignItems = 'center';
  valueWrap.style.padding = '0 8px';
  valueWrap.appendChild(valueSpan);
  row.appendChild(decreaseBtn);
  row.appendChild(valueWrap);
  row.appendChild(increaseBtn);

  update();
  return { section: createSection('sectionTextSize', row), update, refreshLabels };
}
