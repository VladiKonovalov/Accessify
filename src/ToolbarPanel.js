/**
 * Toolbar V2 — Panel container (header + scrollable body with sections)
 */

import { createHeader } from './ToolbarHeader.js';

export function createPanel(sectionElements, onClose) {
  const panel = document.createElement('div');
  panel.className = 'accessify-toolbar-v2-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'accessify-toolbar-v2-dialog-title');
  panel.setAttribute('aria-modal', 'true');

  const header = createHeader(onClose);
  const headerEl = header.element;
  const titleEl = headerEl.querySelector('.accessify-toolbar-v2-header-title-text');
  if (titleEl) titleEl.id = 'accessify-toolbar-v2-dialog-title';
  panel.appendChild(headerEl);

  const body = document.createElement('div');
  body.className = 'accessify-toolbar-v2-panel-body';
  sectionElements.forEach((el) => {
    if (el && el.nodeType === Node.ELEMENT_NODE) body.appendChild(el);
  });

  const footer = document.createElement('div');
  footer.className = 'accessify-toolbar-v2-footer';
  const footerLink = document.createElement('a');
  footerLink.href = 'https://github.com/VladiKonovalov/Accessify';
  footerLink.target = '_blank';
  footerLink.rel = 'noopener noreferrer';
  footerLink.textContent = 'Powered by Accessify';
  footerLink.setAttribute('aria-label', 'Accessify on GitHub (opens in new tab)');
  footer.appendChild(footerLink);
  body.appendChild(footer);

  panel.appendChild(body);

  return {
    panel,
    refreshHeaderLabels: header.refreshLabels
  };
}
