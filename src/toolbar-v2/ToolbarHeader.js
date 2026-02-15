/**
 * Toolbar V2 — Panel header: icon + "Accessibility" + close button
 * Uses the same icon as the trigger (assets/accessify-icon.png) with SVG fallback.
 */

import { icons, iconElement } from './icons.js';
import { t } from './i18n.js';

/** Same as trigger; shared icon URL */
const ICON_URL = 'assets/accessify-icon.png';

function createTitleIcon() {
  const wrap = document.createElement('span');
  wrap.className = 'accessify-toolbar-v2-header-title-icon';

  const img = document.createElement('img');
  img.src = ICON_URL;
  img.alt = '';
  img.className = 'accessify-toolbar-v2-header-title-icon-img';
  img.setAttribute('aria-hidden', 'true');

  const fallbackIcon = iconElement(icons.accessibility);
  fallbackIcon.classList.add('accessify-toolbar-v2-header-title-icon-fallback');

  img.onerror = () => {
    if (img.parentNode === wrap) wrap.removeChild(img);
  };

  wrap.appendChild(img);
  wrap.appendChild(fallbackIcon);
  return wrap;
}

export function createHeader(onClose) {
  const header = document.createElement('div');
  header.className = 'accessify-toolbar-v2-header';
  const titleWrap = document.createElement('div');
  titleWrap.className = 'accessify-toolbar-v2-header-title';
  titleWrap.appendChild(createTitleIcon());
  const title = document.createElement('h2');
  title.className = 'accessify-toolbar-v2-header-title-text';
  title.setAttribute('data-i18n-key', 'headerTitle');
  title.textContent = t('headerTitle');
  titleWrap.appendChild(title);
  header.appendChild(titleWrap);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'accessify-toolbar-v2-close';
  closeBtn.setAttribute('aria-label', t('closeAriaLabel'));
  closeBtn.title = t('closeTitle');
  closeBtn.appendChild(iconElement(icons.x));
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);

  return {
    element: header,
    refreshLabels() {
      const titleEl = header.querySelector('.accessify-toolbar-v2-header-title-text');
      if (titleEl) titleEl.textContent = t('headerTitle');
      closeBtn.setAttribute('aria-label', t('closeAriaLabel'));
      closeBtn.title = t('closeTitle');
    }
  };
}
