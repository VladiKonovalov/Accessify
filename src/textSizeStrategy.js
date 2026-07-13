/**
 * Text-size application strategies.
 *
 * Default (`rootFontSize`): set html { font-size: N% } so rem-based page text scales.
 * `contentZoom`: zoom the content wrapper instead — used when page typography is mostly
 * hard-coded in px (root rem changes then only shrink/grow Accessify's rem-based chrome).
 *
 * Strategy is auto-detected by probing whether page text responds to html font-size.
 */

export const TEXT_SIZE_STRATEGY_ROOT = 'rootFontSize';
export const TEXT_SIZE_STRATEGY_ZOOM = 'contentZoom';

const SAMPLE_SELECTOR =
  'p, label, li, td, th, button, a, h1, h2, h3, h4, span, input, textarea, div.muted, .muted';
const MAX_SAMPLES = 16;
/** If fewer than this share of samples react to root rem, use content zoom. */
const ROOT_RESPONSE_THRESHOLD = 0.5;

/**
 * True when the environment recalculates rem after html font-size changes
 * (real browsers). False in jsdom / broken CSSOM — fall back to rootFontSize.
 * @returns {boolean}
 */
export function environmentSupportsRemProbe() {
  if (typeof document === 'undefined') return false;
  const probe = document.createElement('div');
  probe.setAttribute('data-accessify-rem-probe', '');
  probe.style.cssText = 'font-size:1rem;position:absolute;visibility:hidden;pointer-events:none;';
  document.documentElement.appendChild(probe);
  const html = document.documentElement;
  const prev = html.style.fontSize;
  try {
    html.style.fontSize = '';
    const base = getComputedStyle(probe).fontSize;
    html.style.fontSize = '200%';
    const scaled = getComputedStyle(probe).fontSize;
    return Boolean(base && scaled && base !== scaled);
  } finally {
    html.style.fontSize = prev;
    if (probe.parentNode) probe.parentNode.removeChild(probe);
  }
}

/**
 * @param {ParentNode | null | undefined} contentRoot
 * @returns {Element[]}
 */
function collectTextSamples(contentRoot) {
  const root = contentRoot || (typeof document !== 'undefined' ? document.body : null);
  if (!root || !root.querySelectorAll) return [];

  const nodes = root.querySelectorAll(SAMPLE_SELECTOR);
  const samples = [];
  for (let i = 0; i < nodes.length && samples.length < MAX_SAMPLES; i++) {
    const el = nodes[i];
    if (el.closest && el.closest('.accessify-toolbar-v2-panel, .accessify-toolbar-v2-trigger, [data-accessify-rem-probe]')) {
      continue;
    }
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') {
      samples.push(el);
      continue;
    }
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 2) continue;
    samples.push(el);
  }
  return samples;
}

/**
 * Detect whether page content scales with html font-size.
 * @param {ParentNode | null | undefined} contentRoot
 * @returns {'rootFontSize' | 'contentZoom'}
 */
export function detectTextSizeStrategy(contentRoot) {
  if (typeof document === 'undefined') return TEXT_SIZE_STRATEGY_ROOT;
  if (!environmentSupportsRemProbe()) return TEXT_SIZE_STRATEGY_ROOT;

  const samples = collectTextSamples(contentRoot);
  if (samples.length === 0) return TEXT_SIZE_STRATEGY_ROOT;

  const html = document.documentElement;
  const prev = html.style.fontSize;
  const before = samples.map((el) => getComputedStyle(el).fontSize);
  try {
    html.style.fontSize = '150%';
    let changed = 0;
    for (let i = 0; i < samples.length; i++) {
      if (getComputedStyle(samples[i]).fontSize !== before[i]) changed++;
    }
    return changed / samples.length < ROOT_RESPONSE_THRESHOLD
      ? TEXT_SIZE_STRATEGY_ZOOM
      : TEXT_SIZE_STRATEGY_ROOT;
  } finally {
    html.style.fontSize = prev;
  }
}

/**
 * @param {{ textSizeStrategy?: string }} [options]
 * @param {ParentNode | null | undefined} [contentRoot]
 * @returns {'rootFontSize' | 'contentZoom'}
 */
export function resolveTextSizeStrategy(options = {}, contentRoot) {
  const explicit = options.textSizeStrategy;
  if (explicit === TEXT_SIZE_STRATEGY_ZOOM || explicit === TEXT_SIZE_STRATEGY_ROOT) {
    return explicit;
  }
  return detectTextSizeStrategy(contentRoot);
}

/**
 * Apply text size without affecting the toolbar (mounted outside the wrapper).
 * @param {{ textSize: number, strategy: string, contentWrapper?: HTMLElement | null }} opts
 */
export function applyTextSize({ textSize, strategy, contentWrapper }) {
  const html = document.documentElement;
  if (strategy === TEXT_SIZE_STRATEGY_ZOOM) {
    html.style.fontSize = '';
    if (contentWrapper) {
      contentWrapper.style.zoom = textSize === 100 ? '' : String(textSize / 100);
    }
    return;
  }
  if (contentWrapper) {
    contentWrapper.style.zoom = '';
  }
  html.style.fontSize = textSize + '%';
}

/**
 * Clear any text-size side effects (destroy / reset path).
 * @param {HTMLElement | null | undefined} contentWrapper
 */
export function clearTextSize(contentWrapper) {
  document.documentElement.style.fontSize = '';
  if (contentWrapper) {
    contentWrapper.style.zoom = '';
  }
}
