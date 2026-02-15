/**
 * Toolbar V2 — ARIA live region for announcing setting changes to screen readers.
 * WCAG 2.1: dynamic updates should notify assistive tech.
 */

const ID = 'accessify-toolbar-v2-live';
const CLEAR_MS = 600;

let el = null;

function getLiveRegion() {
  if (el && el.isConnected) return el;
  el = document.createElement('div');
  el.id = ID;
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.className = 'accessify-toolbar-v2-live';
  document.body.appendChild(el);
  return el;
}

/**
 * Announce a message to screen readers. Clears after a short delay so the same message can be re-announced.
 * @param {string} message
 */
export function announce(message) {
  if (!message) return;
  const region = getLiveRegion();
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
    setTimeout(() => {
      region.textContent = '';
    }, CLEAR_MS);
  });
}
