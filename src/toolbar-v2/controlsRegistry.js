/**
 * Toolbar V2 — Single source of truth for controls.
 * Site author chooses which controls are available; user visibility is persisted.
 */

import { createTextSizeControl } from './TextSizeControl.js';
import { createContrastControl } from './ContrastControl.js';
import { createSpacingControl } from './SpacingControl.js';
import { createFontControl } from './FontControl.js';
import { createLinksControl } from './LinksControl.js';
import { createCursorControl } from './CursorControl.js';
import { createResetControl } from './ResetControl.js';
import { createLanguageControl } from './LanguageControl.js';
import { createColorAdjustmentsControl } from './ColorAdjustmentsControl.js';

/** @typedef {{ id: string, labelKey: string, defaultVisible: boolean, customizable: boolean, create: (getState: () => unknown, handlers: Record<string, unknown>) => { section: HTMLElement, update: () => void } }} ControlDef */

/** @type {ControlDef[]} */
const REGISTRY = [
  {
    id: 'textSize',
    labelKey: 'controlTextSize',
    defaultVisible: true,
    customizable: true,
    create: (getState, h) => createTextSizeControl(getState, h.onDecrease, h.onIncrease)
  },
  {
    id: 'contrast',
    labelKey: 'controlContrast',
    defaultVisible: true,
    customizable: true,
    create: (getState, h) => createContrastControl(getState, h.onContrastCycle)
  },
  {
    id: 'spacing',
    labelKey: 'controlSpacing',
    defaultVisible: true,
    customizable: true,
    create: (getState, h) => createSpacingControl(getState, h.onSpacingToggle)
  },
  {
    id: 'font',
    labelKey: 'controlFont',
    defaultVisible: true,
    customizable: true,
    create: (getState, h) => createFontControl(getState, h.onFontToggle)
  },
  {
    id: 'links',
    labelKey: 'controlLinks',
    defaultVisible: true,
    customizable: true,
    create: (getState, h) => createLinksControl(getState, h.onLinksToggle)
  },
  {
    id: 'cursor',
    labelKey: 'controlCursor',
    defaultVisible: true,
    customizable: true,
    create: (getState, h) => createCursorControl(getState, h.onCursorToggle)
  },
  {
    id: 'colorAdjustments',
    labelKey: 'controlColorAdjustments',
    defaultVisible: false,
    customizable: true,
    create: (getState, h) => createColorAdjustmentsControl(getState, h.onColorFilterCycle)
  },
  {
    id: 'reset',
    labelKey: 'controlReset',
    defaultVisible: true,
    customizable: false,
    create: (_getState, h) => createResetControl(h.onReset)
  },
  {
    id: 'language',
    labelKey: 'controlLanguage',
    defaultVisible: false,
    customizable: true,
    create: (getState, h) => createLanguageControl(getState, h)
  }
];

const BY_ID = new Map(REGISTRY.map((def) => [def.id, def]));

/**
 * @returns {string[]} All registered control ids in display order.
 */
export function getControlIds() {
  return REGISTRY.map((d) => d.id);
}

/**
 * @param {string} id
 * @returns {ControlDef | undefined}
 */
export function getControl(id) {
  return BY_ID.get(id);
}

/**
 * Default visibility for each customizable control (used for new users and merge).
 * @returns {Record<string, boolean>}
 */
export function getDefaultVisibleControls() {
  const out = /** @type {Record<string, boolean>} */ ({});
  for (const def of REGISTRY) {
    if (def.customizable) out[def.id] = def.defaultVisible;
  }
  return out;
}

/**
 * Create a control by id.
 * @param {string} id
 * @param {() => Record<string, unknown>} getState
 * @param {Record<string, unknown>} handlers
 * @returns {{ section: HTMLElement, update: () => void } | null}
 */
export function createControl(id, getState, handlers) {
  const def = BY_ID.get(id);
  if (!def) return null;
  return def.create(getState, handlers);
}

/**
 * @param {string[]} [availableIds] If provided, only these controls are available; otherwise all.
 * @returns {string[]}
 */
export function resolveAvailableIds(availableIds) {
  const all = getControlIds();
  if (!availableIds || availableIds.length === 0) return all;
  return availableIds.filter((id) => BY_ID.has(id));
}
