/**
 * Toolbar V2 — Section wrapper (label + control area)
 * labelKey is an i18n key (e.g. 'sectionTextSize'); label is translated via t(labelKey).
 */

import { t } from './i18n.js';

export function createSection(labelKey, controlElements) {
  const section = document.createElement('div');
  section.className = 'accessify-toolbar-v2-section';
  const label = document.createElement('span');
  label.className = 'accessify-toolbar-v2-section-label';
  label.setAttribute('data-section-label-key', labelKey);
  label.textContent = t(labelKey);
  label.id = 'accessify-toolbar-v2-label-' + labelKey.replace(/\s+/g, '-').toLowerCase();
  const controls = document.createElement('div');
  controls.className = 'accessify-toolbar-v2-section-controls';
  const nodes = Array.isArray(controlElements) ? controlElements : [controlElements];
  nodes.forEach((node) => {
    if (node && node.nodeType === Node.ELEMENT_NODE) controls.appendChild(node);
  });
  section.appendChild(label);
  section.appendChild(controls);
  return section;
}
