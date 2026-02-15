/**
 * Toolbar V2 — Customize: collapsible "Show or hide tools" (minimized by default)
 */

import { getControl } from './controlsRegistry.js';
import { icons, iconElement } from './icons.js';
import { t } from './i18n.js';

/**
 * @param {string[]} availableIds — Control ids the site author made available
 * @param {() => Record<string, boolean>} getVisible — Current visibility map
 * @param {(id: string, visible: boolean) => void} onToggle — Called when user toggles a control
 * @returns {{ section: HTMLElement, setVisible: (id: string, visible: boolean) => void, refreshLabels: () => void }}
 */
export function createCustomizeSection(availableIds, getVisible, onToggle) {
  const visible = getVisible();
  const body = document.createElement('div');
  body.className = 'accessify-toolbar-v2-customize-body';
  /** @type {Map<string, HTMLInputElement>} */
  const checkboxesById = new Map();
  /** @type {Map<string, HTMLElement>} */
  const labelSpansById = new Map();
  /** @type {HTMLButtonElement | null} */
  let headerBtn = null;
  /** @type {HTMLElement | null} */
  let headerLabelEl = null;

  for (const id of availableIds) {
    const def = getControl(id);
    if (!def || !def.customizable) continue;

    const label = document.createElement('label');
    label.className = 'accessify-toolbar-v2-customize-label';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'accessify-toolbar-v2-customize-checkbox';
    input.setAttribute('data-aria-label-key', 'showControl');
    input.setAttribute('data-aria-label-vars', JSON.stringify({ label: def.labelKey }));
    input.setAttribute('aria-label', t('showControl', { label: t(def.labelKey) }));
    input.checked = visible[id] !== false;
    checkboxesById.set(id, input);

    const span = document.createElement('span');
    span.className = 'accessify-toolbar-v2-customize-label-text';
    span.setAttribute('data-label-key', def.labelKey);
    span.textContent = t(def.labelKey);
    labelSpansById.set(id, span);

    label.appendChild(input);
    label.appendChild(span);

    input.addEventListener('change', () => {
      const next = !!input.checked;
      onToggle(id, next);
    });

    body.appendChild(label);
  }

  const section = document.createElement('div');
  section.className = 'accessify-toolbar-v2-section accessify-toolbar-v2-customize';

  const header = document.createElement('button');
  header.type = 'button';
  header.className = 'accessify-toolbar-v2-customize-header';
  header.setAttribute('aria-expanded', 'false');
  header.setAttribute('aria-controls', 'accessify-toolbar-v2-customize-body');
  header.setAttribute('aria-label', t('customizeHeader'));
  headerBtn = header;
  const headerLabel = document.createElement('span');
  headerLabel.className = 'accessify-toolbar-v2-customize-header-label';
  headerLabel.textContent = t('customizeHeader');
  headerLabelEl = headerLabel;
  const chevron = iconElement(icons.chevronDown, 'accessify-toolbar-v2-customize-chevron');
  header.appendChild(headerLabel);
  header.appendChild(chevron);

  body.id = 'accessify-toolbar-v2-customize-body';
  body.hidden = true;

  header.addEventListener('click', () => {
    const expanded = header.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    header.setAttribute('aria-expanded', String(next));
    body.hidden = !next;
    section.classList.toggle('accessify-toolbar-v2-customize-open', next);
  });

  section.appendChild(header);
  section.appendChild(body);

  function refreshLabels() {
    headerBtn && headerBtn.setAttribute('aria-label', t('customizeHeader'));
    if (headerLabelEl) headerLabelEl.textContent = t('customizeHeader');
    labelSpansById.forEach((span, id) => {
      const def = getControl(id);
      if (def) span.textContent = t(def.labelKey);
    });
    checkboxesById.forEach((input, id) => {
      const def = getControl(id);
      if (def) input.setAttribute('aria-label', t('showControl', { label: t(def.labelKey) }));
    });
  }

  return {
    section,
    setVisible: (id, visible) => {
      const box = checkboxesById.get(id);
      if (box) box.checked = visible;
    },
    refreshLabels
  };
}
