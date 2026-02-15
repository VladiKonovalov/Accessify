/**
 * Tests for Accessify Toolbar V2
 */

import Accessify, { ToolbarV2 } from '../src/index.js';

describe('Accessify', () => {
  describe('exports', () => {
    test('should export ToolbarV2', () => {
      expect(ToolbarV2).toBeDefined();
      expect(typeof ToolbarV2).toBe('function');
    });

    test('should expose ToolbarV2 on default export', () => {
      expect(Accessify.ToolbarV2).toBe(ToolbarV2);
    });

    test('should assign to window in browser environment', () => {
      expect(typeof window !== 'undefined').toBe(true);
      if (typeof window !== 'undefined') {
        expect(window.Accessify).toBeDefined();
        expect(window.Accessify.ToolbarV2).toBe(ToolbarV2);
      }
    });
  });
});

describe('ToolbarV2', () => {
  let toolbar;

  afterEach(() => {
    if (toolbar) {
      try {
        toolbar.destroy();
      } catch (e) {
        // ignore
      }
      toolbar = null;
    }
  });

  describe('constructor', () => {
    test('should create ToolbarV2 instance', () => {
      toolbar = new ToolbarV2();
      expect(toolbar).toBeInstanceOf(ToolbarV2);
    });

    test('should accept options', () => {
      toolbar = new ToolbarV2({
        availableControls: ['textSize', 'contrast'],
        syncWithPageLanguage: true
      });
      expect(toolbar.options.availableControls).toEqual(['textSize', 'contrast']);
      expect(toolbar.syncWithPageLanguage).toBe(true);
    });
  });

  describe('getSettings', () => {
    test('should return settings object before init', () => {
      toolbar = new ToolbarV2();
      const settings = toolbar.getSettings();
      expect(settings).toBeDefined();
      expect(typeof settings).toBe('object');
      expect(settings).toHaveProperty('textSize');
      expect(settings).toHaveProperty('contrastMode');
      expect(settings).toHaveProperty('textSpacing');
      expect(settings).toHaveProperty('fontType');
      expect(settings).toHaveProperty('highlightLinks');
      expect(settings).toHaveProperty('highlightCursor');
      expect(settings).toHaveProperty('language');
    });

    test('should return a copy of settings', () => {
      toolbar = new ToolbarV2();
      const s1 = toolbar.getSettings();
      const s2 = toolbar.getSettings();
      expect(s1).not.toBe(s2);
      expect(s1).toEqual(s2);
    });
  });

  describe('init', () => {
    test('should initialize without throwing', () => {
      toolbar = new ToolbarV2();
      expect(() => toolbar.init()).not.toThrow();
    });

    test('should mount trigger and panel to DOM', () => {
      toolbar = new ToolbarV2();
      toolbar.init();
      expect(toolbar.trigger).toBeDefined();
      expect(toolbar.trigger.element).toBeDefined();
      expect(toolbar.panel).toBeDefined();
      expect(document.body.contains(toolbar.trigger.element)).toBe(true);
      expect(document.body.contains(toolbar.panel)).toBe(true);
    });
  });

  describe('destroy', () => {
    test('should remove trigger and panel from DOM', () => {
      toolbar = new ToolbarV2();
      toolbar.init();
      const triggerEl = toolbar.trigger.element;
      const panelEl = toolbar.panel;
      toolbar.destroy();
      expect(document.body.contains(triggerEl)).toBe(false);
      expect(document.body.contains(panelEl)).toBe(false);
    });

    test('should not throw when destroy called without init', () => {
      toolbar = new ToolbarV2();
      expect(() => toolbar.destroy()).not.toThrow();
    });
  });

  describe('open / close / toggle', () => {
    test('should open and close panel', () => {
      toolbar = new ToolbarV2();
      toolbar.init();
      expect(toolbar.isOpen).toBe(false);
      toolbar.open();
      expect(toolbar.isOpen).toBe(true);
      toolbar.close();
      expect(toolbar.isOpen).toBe(false);
    });

    test('should toggle panel state', () => {
      toolbar = new ToolbarV2();
      toolbar.init();
      expect(toolbar.isOpen).toBe(false);
      toolbar.toggle();
      expect(toolbar.isOpen).toBe(true);
      toolbar.toggle();
      expect(toolbar.isOpen).toBe(false);
    });
  });
});
