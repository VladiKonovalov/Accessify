/**
 * Tests for text-size strategy (root rem vs content zoom for px-locked pages).
 */

import {
  TEXT_SIZE_STRATEGY_ROOT,
  TEXT_SIZE_STRATEGY_ZOOM,
  resolveTextSizeStrategy,
  detectTextSizeStrategy,
  applyTextSize,
  clearTextSize
} from '../src/textSizeStrategy.js';
import { ToolbarV2 } from '../src/ToolbarV2.js';

/**
 * @param {{ remWorks?: boolean, pageMode?: 'px' | 'rem' }} opts
 */
function mockFontMetrics({ remWorks = true, pageMode = 'px' } = {}) {
  return jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
    const raw = document.documentElement.style.fontSize;
    const pct = raw ? parseFloat(raw) : 100;
    const scale = Number.isFinite(pct) ? pct / 100 : 1;

    if (el && el.getAttribute && el.getAttribute('data-accessify-rem-probe') !== null) {
      return { fontSize: remWorks ? `${16 * scale}px` : '16px' };
    }

    if (pageMode === 'rem') {
      return { fontSize: `${16 * scale}px` };
    }

    // px-locked page text: ignore html font-size
    if (el && el.style && el.style.fontSize) {
      return { fontSize: el.style.fontSize };
    }
    return { fontSize: '14px' };
  });
}

describe('textSizeStrategy', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.style.fontSize = '';
    if (jest.isMockFunction(window.getComputedStyle)) {
      window.getComputedStyle.mockRestore();
    }
  });

  describe('resolveTextSizeStrategy', () => {
    test('explicit option wins over detection', () => {
      expect(resolveTextSizeStrategy({ textSizeStrategy: 'contentZoom' })).toBe(
        TEXT_SIZE_STRATEGY_ZOOM
      );
      expect(resolveTextSizeStrategy({ textSizeStrategy: 'rootFontSize' })).toBe(
        TEXT_SIZE_STRATEGY_ROOT
      );
    });

    test('falls back to rootFontSize when rem probing is unsupported', () => {
      mockFontMetrics({ remWorks: false, pageMode: 'px' });
      document.body.innerHTML = '<p style="font-size:14px">Locked</p>';
      expect(detectTextSizeStrategy(document.body)).toBe(TEXT_SIZE_STRATEGY_ROOT);
    });
  });

  describe('detectTextSizeStrategy', () => {
    test('chooses contentZoom when page text is locked to px', () => {
      mockFontMetrics({ remWorks: true, pageMode: 'px' });
      document.body.innerHTML = `
        <label style="font-size:14px">Email</label>
        <p style="font-size:13px">Helper copy</p>
        <button style="font-size:15px">Submit</button>
        <a style="font-size:16px" href="#">Link</a>
      `;
      expect(detectTextSizeStrategy(document.body)).toBe(TEXT_SIZE_STRATEGY_ZOOM);
    });

    test('chooses rootFontSize when page text follows rem', () => {
      mockFontMetrics({ remWorks: true, pageMode: 'rem' });
      document.body.innerHTML = `
        <p>Paragraph</p>
        <label>Label</label>
        <a href="#">Link</a>
        <button>Go</button>
      `;
      expect(detectTextSizeStrategy(document.body)).toBe(TEXT_SIZE_STRATEGY_ROOT);
    });
  });

  describe('applyTextSize', () => {
    let wrapper;

    beforeEach(() => {
      document.documentElement.style.fontSize = '';
      wrapper = document.createElement('div');
      document.body.appendChild(wrapper);
    });

    afterEach(() => {
      clearTextSize(wrapper);
      if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    });

    test('rootFontSize sets html font-size and clears wrapper zoom', () => {
      wrapper.style.zoom = '1.5';
      applyTextSize({ textSize: 120, strategy: TEXT_SIZE_STRATEGY_ROOT, contentWrapper: wrapper });
      expect(document.documentElement.style.fontSize).toBe('120%');
      expect(wrapper.style.zoom).toBe('');
    });

    test('contentZoom zooms wrapper and clears html font-size', () => {
      document.documentElement.style.fontSize = '120%';
      applyTextSize({ textSize: 150, strategy: TEXT_SIZE_STRATEGY_ZOOM, contentWrapper: wrapper });
      expect(document.documentElement.style.fontSize).toBe('');
      expect(wrapper.style.zoom).toBe('1.5');
    });

    test('contentZoom at 100% clears zoom', () => {
      applyTextSize({ textSize: 100, strategy: TEXT_SIZE_STRATEGY_ZOOM, contentWrapper: wrapper });
      expect(wrapper.style.zoom).toBe('');
    });
  });
});

describe('ToolbarV2 textSizeStrategy integration', () => {
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
    document.documentElement.style.fontSize = '';
    document.body.innerHTML = '';
    if (jest.isMockFunction(window.getComputedStyle)) {
      window.getComputedStyle.mockRestore();
    }
  });

  test('default strategy uses root font-size when rem probe is unsupported', () => {
    mockFontMetrics({ remWorks: false, pageMode: 'px' });
    document.body.innerHTML = '<p style="font-size:14px">Page</p>';
    toolbar = new ToolbarV2();
    toolbar.init();
    toolbar.settings.textSize = 130;
    toolbar._applySettingsToDocument();
    expect(toolbar.textSizeStrategy).toBe(TEXT_SIZE_STRATEGY_ROOT);
    expect(document.documentElement.style.fontSize).toBe('130%');
    expect(toolbar._contentWrapper.style.zoom).toBe('');
  });

  test('contentZoom option leaves html font-size alone and zooms wrapper', () => {
    toolbar = new ToolbarV2({ textSizeStrategy: 'contentZoom' });
    toolbar.init();
    toolbar.settings.textSize = 140;
    toolbar._applySettingsToDocument();
    expect(document.documentElement.style.fontSize).toBe('');
    expect(toolbar._contentWrapper.style.zoom).toBe('1.4');
  });

  test('auto-detects contentZoom for px-locked page content', () => {
    mockFontMetrics({ remWorks: true, pageMode: 'px' });
    document.body.innerHTML = `
      <main>
        <label style="font-size:14px">Search</label>
        <p style="font-size:13px">Jobs list</p>
        <button style="font-size:15px">Apply</button>
      </main>
    `;

    toolbar = new ToolbarV2();
    toolbar.init();
    expect(toolbar.textSizeStrategy).toBe(TEXT_SIZE_STRATEGY_ZOOM);

    toolbar.settings.textSize = 150;
    toolbar._applySettingsToDocument();
    expect(document.documentElement.style.fontSize).toBe('');
    expect(toolbar._contentWrapper.style.zoom).toBe('1.5');
  });
});
