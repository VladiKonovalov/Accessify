/**
 * Toolbar V2 — Injected styles (toolbar UI + body/root accessibility classes)
 * WCAG 2.1 AA: contrast, focus-visible, touch targets, reduced motion.
 */

import { getToolbarStyles } from './stylesToolbar.js';
import { getPageEffectsStyles } from './stylesPageEffects.js';

const ID = 'accessify-toolbar-v2-styles';

export function injectStyles() {
  if (document.getElementById(ID)) return;
  const style = document.createElement('style');
  style.id = ID;
  style.textContent = getStyles();
  document.head.appendChild(style);
}

function getStyles() {
  return getToolbarStyles() + getPageEffectsStyles();
}
