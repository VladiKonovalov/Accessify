/**
 * Toolbar V2 — Inline SVG icons (no external deps, Lucide-style)
 * 20×20 unless noted. Accessible when used on buttons with aria-label.
 */

const size20 = ' width="20" height="20" ';
const size24 = ' width="24" height="24" ';
const size16 = ' width="16" height="16" ';

export const icons = {
  accessibility: `<svg xmlns="http://www.w3.org/2000/svg" ${size24} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="m15 22 2-6 2 6"/><path d="m7 22-2-6-2 6"/><path d="M12 6v14"/><path d="M8 14h8"/></svg>`,
  typeSmall: `<svg xmlns="http://www.w3.org/2000/svg" ${size16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  typeLarge: `<svg xmlns="http://www.w3.org/2000/svg" ${size24} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  contrast: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  alignJustify: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  link: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  mousePointer: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3Z"/></svg>`,
  rotateCcw: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
  palette: `<svg xmlns="http://www.w3.org/2000/svg" ${size20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.75-.2 2.5-.5"/></svg>`
};

/**
 * Create element with innerHTML set to icon SVG.
 * @param {string} svgString
 * @param {string} [className]
 * @returns {HTMLElement}
 */
export function iconElement(svgString, className = '') {
  const wrap = document.createElement('span');
  wrap.className = 'accessify-toolbar-v2-icon' + (className ? ' ' + className : '');
  wrap.innerHTML = svgString;
  wrap.setAttribute('aria-hidden', 'true');
  return wrap;
}

/**
 * "D" badge for dyslexia font (not Lucide).
 * @returns {HTMLElement}
 */
export function fontDBadge() {
  const el = document.createElement('span');
  el.className = 'accessify-toolbar-v2-font-d-badge';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = 'D';
  return el;
}
