/**
 * Toolbar V2 — Main component
 * Composes trigger, panel, controls; manages state, persistence, and DOM application.
 * Site author sets available controls; user visibility is persisted. WCAG 2.1 AA.
 */

import { defaultSettings, TEXT_SIZE_MIN, TEXT_SIZE_MAX, TEXT_SIZE_STEP } from './constants.js';
import { loadSettings, saveSettings } from './storage.js';
import { injectStyles } from './styles.js';
import { setLanguage, subscribe, getLanguage, t, normalizePageLang, getDirForLang } from './i18n.js';
import { CursorHighlight } from './CursorHighlight.js';
import { createTrigger } from './ToolbarTrigger.js';
import { createPanel } from './ToolbarPanel.js';
import {
  getControlIds,
  getControl,
  getDefaultVisibleControls,
  createControl,
  resolveAvailableIds
} from './controlsRegistry.js';
import { createCustomizeSection } from './CustomizeSection.js';

export class ToolbarV2 {
  /**
   * @param {{ availableControls?: string[], syncWithPageLanguage?: boolean }} [options]
   * — availableControls: if provided, only these control ids are available; otherwise all.
   * — syncWithPageLanguage: if true, toolbar language syncs with document.documentElement.lang/dir in both directions
   *   (page lang on init/change updates toolbar; toolbar language change updates html lang and dir).
   */
  constructor(options = {}) {
    this.options = options;
    this.syncWithPageLanguage = !!options.syncWithPageLanguage;
    this.settings = { ...defaultSettings };
    this.isOpen = false;
    this.trigger = null;
    this.panel = null;
    this.panelBody = null;
    this.cursorHighlight = new CursorHighlight();
    this.controlUpdates = [];
    this.customizeSetVisible = null;
    this._boundKeydown = this._onKeydown.bind(this);
  }

  /**
   * Initialize: inject styles, load settings, merge visibleControls, apply to DOM, mount UI.
   */
  init() {
    injectStyles();
    this.settings = loadSettings();
    this.settings.visibleControls = { ...getDefaultVisibleControls(), ...this.settings.visibleControls };

    // Always recognize page language first: lang attribute, then dir=rtl, then saved settings
    const pageLang = normalizePageLang(document.documentElement.getAttribute('lang'));
    const pageDir = document.documentElement.getAttribute('dir');
    if (pageLang) {
      setLanguage(pageLang);
      this.settings.language = pageLang;
      saveSettings(this.settings);
    } else if (pageDir === 'rtl') {
      setLanguage('he');
      this.settings.language = 'he';
      saveSettings(this.settings);
    } else if (this.settings.language) {
      setLanguage(this.settings.language);
    } else {
      setLanguage('en');
      this.settings.language = 'en';
    }
    this._initialLanguage = this.settings.language;

    const availableIds = resolveAvailableIds(this.options.availableControls);
    const getState = () => this.settings;

    const onDecrease = () => {
      this.settings.textSize = Math.max(TEXT_SIZE_MIN, this.settings.textSize - TEXT_SIZE_STEP);
      this._persistAndApply();
    };
    const onIncrease = () => {
      this.settings.textSize = Math.min(TEXT_SIZE_MAX, this.settings.textSize + TEXT_SIZE_STEP);
      this._persistAndApply();
    };
    const onContrastCycle = () => {
      const idx = ['normal', 'high', 'dark'].indexOf(this.settings.contrastMode);
      this.settings.contrastMode = ['normal', 'high', 'dark'][(idx + 1) % 3];
      this._persistAndApply();
    };
    const onSpacingToggle = () => {
      this.settings.textSpacing = this.settings.textSpacing === 'wide' ? 'normal' : 'wide';
      this._persistAndApply();
    };
    const onFontToggle = () => {
      this.settings.fontType = this.settings.fontType === 'dyslexia' ? 'default' : 'dyslexia';
      this._persistAndApply();
    };
    const onLinksToggle = () => {
      this.settings.highlightLinks = !this.settings.highlightLinks;
      this._persistAndApply();
    };
    const onCursorToggle = () => {
      this.settings.highlightCursor = !this.settings.highlightCursor;
      this._persistAndApply();
      this.cursorHighlight.setVisible(this.settings.highlightCursor);
    };
    const onColorFilterCycle = () => {
      const modes = ['none', 'grayscale', 'invert'];
      const idx = modes.indexOf(this.settings.colorFilter || 'none');
      this.settings.colorFilter = modes[(idx + 1) % modes.length];
      this._persistAndApply();
    };
    const onReset = () => {
      const initialLang = this._initialLanguage || defaultSettings.language;
      this.settings = { ...defaultSettings, language: initialLang, visibleControls: getDefaultVisibleControls() };
      setLanguage(initialLang);
      if (this.syncWithPageLanguage) {
        document.documentElement.setAttribute('lang', initialLang);
        document.documentElement.setAttribute('dir', getDirForLang(initialLang));
      }
      this._persistAndApply();
      this.cursorHighlight.setVisible(false);
      this._applyVisibleControls();
      this._refreshAllLabels();
      this.controlUpdates.forEach((fn) => fn());
    };

    const onLanguageChange = (lang) => {
      this.settings.language = lang;
      saveSettings(this.settings);
      if (this.syncWithPageLanguage) {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', getDirForLang(lang));
      }
      this._refreshAllLabels();
    };

    const handlers = {
      textSize: { onDecrease, onIncrease },
      contrast: { onContrastCycle },
      spacing: { onSpacingToggle },
      font: { onFontToggle },
      links: { onLinksToggle },
      cursor: { onCursorToggle },
      reset: { onReset },
      language: { onLanguageChange },
      colorAdjustments: { onColorFilterCycle }
    };

    const customize = createCustomizeSection(
      availableIds,
      () => this.settings.visibleControls || {},
      (id, visible) => {
        if (!this.settings.visibleControls) this.settings.visibleControls = {};
        this.settings.visibleControls[id] = visible;
        saveSettings(this.settings);
        this._applyVisibleControls();
      }
    );
    this.customizeSetVisible = customize.setVisible;

    const sections = [customize.section];
    const updates = [];
    /** @type {Array<() => void>} */
    const refreshLabelFns = [];

    for (const id of availableIds) {
      const def = getControl(id);
      if (!def) continue;
      const control = createControl(id, getState, handlers[id] || {});
      if (!control) continue;
      control.section.setAttribute('data-control-id', id);
      sections.push(control.section);
      if (control.update) updates.push(control.update);
      if (control.refreshLabels) refreshLabelFns.push(control.refreshLabels);
    }

    this.controlUpdates = updates;
    this._refreshLabelFns = refreshLabelFns;
    this._customizeRefreshLabels = customize.refreshLabels;

    this.trigger = createTrigger(() => this.toggle(), () => this.isOpen);
    this._updateTriggerDir();
    const panelResult = createPanel(sections, () => this.close());
    this.panel = panelResult.panel;
    this._refreshHeaderLabels = panelResult.refreshHeaderLabels;
    this.panelBody = this.panel.querySelector('.accessify-toolbar-v2-panel-body');

    this._unsubscribeLanguage = subscribe(() => this._refreshAllLabels());

    const contentWrapper = document.createElement('div');
    contentWrapper.id = 'accessify-toolbar-v2-content-wrapper';
    while (document.body.firstChild) {
      contentWrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(contentWrapper);
    document.body.appendChild(this.trigger.element);
    this.panel.style.display = 'none';
    document.body.appendChild(this.panel);
    this._contentWrapper = contentWrapper;

    this._applyVisibleControls();
    this._applySettingsToDocument();

    this.cursorHighlight.mount();
    this.cursorHighlight.setVisible(this.settings.highlightCursor);

    this._refreshAllLabels();

    if (this.syncWithPageLanguage) {
      this._langObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.attributeName === 'lang' || m.attributeName === 'dir') {
            const pageLang = normalizePageLang(document.documentElement.getAttribute('lang'));
            if (pageLang && pageLang !== getLanguage()) {
              setLanguage(pageLang);
              this.settings.language = pageLang;
              saveSettings(this.settings);
              this._refreshAllLabels();
            }
            break;
          }
        }
      });
      this._langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
    }

    document.addEventListener('keydown', this._boundKeydown);
  }

  /**
   * Position trigger by language: Hebrew = left (RTL), English = right (LTR).
   * Uses dir on trigger so CSS inset-inline-end places it correctly.
   */
  _updateTriggerDir() {
    if (this.trigger && this.trigger.element) {
      const dir = getLanguage() === 'he' ? 'rtl' : 'ltr';
      this.trigger.element.setAttribute('dir', dir);
    }
  }

  /**
   * Refresh all UI labels after language change.
   */
  _refreshAllLabels() {
    const lang = getLanguage();
    if (this.panel) {
      this.panel.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
      this.panel.setAttribute('lang', lang);
    }
    this._updateTriggerDir();
    if (this.trigger && this.trigger.refreshLabels) this.trigger.refreshLabels();
    if (this._refreshHeaderLabels) this._refreshHeaderLabels();
    if (this._customizeRefreshLabels) this._customizeRefreshLabels();
    if (this.panel) {
      this.panel.querySelectorAll('[data-section-label-key]').forEach((el) => {
        const key = el.getAttribute('data-section-label-key');
        if (key) el.textContent = t(key);
      });
    }
    (this._refreshLabelFns || []).forEach((fn) => fn());
    this.controlUpdates.forEach((fn) => fn());
  }

  /**
   * Show/hide control sections and sync Customize checkboxes from settings.visibleControls.
   */
  _applyVisibleControls() {
    const visible = this.settings.visibleControls || {};
    if (!this.panelBody) return;
    this.panelBody.querySelectorAll('[data-control-id]').forEach((el) => {
      const id = el.getAttribute('data-control-id');
      const def = id ? getControl(id) : null;
      const show = def && (def.customizable ? visible[id] !== false : true);
      el.style.display = show ? '' : 'none';
    });
    if (this.customizeSetVisible) {
      for (const id of Object.keys(visible)) {
        this.customizeSetVisible(id, visible[id] !== false);
      }
    }
  }

  _applySettingsToDocument() {
    document.documentElement.style.fontSize = this.settings.textSize + '%';
    const body = document.body;
    const wrapper = this._contentWrapper;
    if (wrapper) {
      wrapper.classList.remove('contrast-normal', 'contrast-high', 'contrast-dark');
      wrapper.classList.add('contrast-' + (this.settings.contrastMode || 'normal'));
    } else {
      body.classList.remove('contrast-normal', 'contrast-high', 'contrast-dark');
      body.classList.add('contrast-' + (this.settings.contrastMode || 'normal'));
    }
    if (this.settings.textSpacing === 'wide') body.classList.add('text-spacing-wide');
    else body.classList.remove('text-spacing-wide');
    if (this.settings.fontType === 'dyslexia') body.classList.add('font-dyslexia');
    else body.classList.remove('font-dyslexia');
    if (this.settings.highlightLinks) body.classList.add('highlight-links');
    else body.classList.remove('highlight-links');
    if (this.settings.highlightCursor) body.classList.add('highlight-cursor');
    else body.classList.remove('highlight-cursor');
    const wrapperOrBody = wrapper || body;
    const colorFilter = ['none', 'grayscale', 'invert'].includes(this.settings.colorFilter) ? this.settings.colorFilter : 'none';
    wrapperOrBody.classList.remove('color-filter-none', 'color-filter-grayscale', 'color-filter-invert');
    wrapperOrBody.classList.add('color-filter-' + colorFilter);
  }

  _persistAndApply() {
    const scrollX = window.scrollX ?? document.documentElement.scrollLeft;
    const scrollY = window.scrollY ?? document.documentElement.scrollTop;
    saveSettings(this.settings);
    this._applySettingsToDocument();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    });
  }

  _onKeydown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      e.preventDefault();
      this.close();
    }
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.panel.style.display = '';
    this.trigger.setExpanded(true);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.panel.style.display = 'none';
    this.trigger.setExpanded(false);
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  /**
   * Destroy: remove DOM, listeners, cursor highlight.
   */
  destroy() {
    if (this._unsubscribeLanguage) this._unsubscribeLanguage();
    if (this._langObserver) {
      this._langObserver.disconnect();
      this._langObserver = null;
    }
    document.removeEventListener('keydown', this._boundKeydown);
    if (this.trigger && this.trigger.element.parentNode) this.trigger.element.parentNode.removeChild(this.trigger.element);
    if (this.panel && this.panel.parentNode) this.panel.parentNode.removeChild(this.panel);
    this.cursorHighlight.unmount();
    document.documentElement.style.fontSize = '';
    document.body.classList.remove('text-spacing-wide', 'font-dyslexia', 'highlight-links', 'highlight-cursor', 'color-filter-none', 'color-filter-grayscale', 'color-filter-invert');
    if (this._contentWrapper && this._contentWrapper.parentNode) {
      const parent = this._contentWrapper.parentNode;
      while (this._contentWrapper.firstChild) {
        parent.insertBefore(this._contentWrapper.firstChild, this._contentWrapper);
      }
      parent.removeChild(this._contentWrapper);
    }
  }

  /**
   * Get current settings (for integration with existing Accessify).
   */
  getSettings() {
    return { ...this.settings };
  }
}
