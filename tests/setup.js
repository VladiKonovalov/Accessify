/**
 * Test setup file for Accessify
 */

// Mock browser APIs that might not be available in test environment
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  speaking: false,
  paused: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
};

global.SpeechRecognition = class SpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.maxAlternatives = 1;
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
  }
  
  start() {
    if (this.onstart) this.onstart();
  }
  
  stop() {
    if (this.onend) this.onend();
  }
};

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock CSS.supports
global.CSS = {
  supports: jest.fn((property, value) => {
    // Mock common CSS feature support
    const supportedFeatures = [
      'display: grid',
      'display: flex',
      '--custom-property',
      'transform: translateX(10px)',
      'transition: all 0.3s',
      'animation: fadeIn 1s',
      ':focus-visible',
      '(prefers-reduced-motion: reduce)',
      '(prefers-contrast: high)',
      '(prefers-color-scheme: dark)'
    ];
    
    const testString = `${property}: ${value}`;
    return supportedFeatures.some(feature => testString.includes(feature));
  })
};

// Mock window.matchMedia
global.matchMedia = jest.fn(query => ({
  matches: query.includes('prefers-reduced-motion: reduce'),
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock document methods
global.document = {
  ...document,
  createElement: jest.fn((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      className: '',
      id: '',
      style: {},
      textContent: '',
      innerHTML: '',
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      focus: jest.fn(),
      click: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      getBoundingClientRect: jest.fn(() => ({
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        bottom: 100,
        right: 100
      }))
    };
    
    // Add parentNode property
    Object.defineProperty(element, 'parentNode', {
      value: null,
      writable: true
    });
    
    return element;
  }),
  head: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    insertBefore: jest.fn(),
    firstChild: null
  },
  documentElement: {
    lang: 'en',
    dir: 'ltr',
    style: {}
  },
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

// Mock window methods
global.window = {
  ...window,
  location: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  history: {
    length: 1,
    back: jest.fn(),
    forward: jest.fn()
  },
  scrollBy: jest.fn(),
  scrollIntoView: jest.fn(),
  getSelection: jest.fn(() => ({
    toString: jest.fn(() => ''),
    removeAllRanges: jest.fn(),
    getRangeAt: jest.fn(() => ({
      getBoundingClientRect: jest.fn(() => ({
        top: 0,
        left: 0,
        width: 100,
        height: 20
      }))
    }))
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  matchMedia: global.matchMedia
};

// Mock MutationObserver
global.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
};

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn()
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 16));
global.cancelAnimationFrame = jest.fn();

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn(callback => setTimeout(callback, 0));
global.cancelIdleCallback = jest.fn();

// Mock crypto API
global.crypto = {
  getRandomValues: jest.fn(arr => arr),
  subtle: {}
};

// Mock Intl API
global.Intl = {
  DateTimeFormat: jest.fn(),
  NumberFormat: jest.fn()
};

// Mock fetch API
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve('')
}));

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
  }
  
  send() {}
  close() {}
};

// Mock FileReader
global.FileReader = class FileReader {
  constructor() {
    this.readyState = 0;
    this.result = null;
    this.onload = null;
    this.onerror = null;
  }
  
  readAsText() {}
  readAsDataURL() {}
};

// Mock File API
global.File = class File {
  constructor(chunks, filename, options) {
    this.name = filename;
    this.size = chunks.reduce((size, chunk) => size + chunk.length, 0);
    this.type = options.type || '';
  }
};

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn()
};

// Mock service worker
global.navigator.serviceWorker = {
  register: jest.fn(),
  unregister: jest.fn(),
  getRegistration: jest.fn(),
  getRegistrations: jest.fn()
};

// Mock gamepad API
global.navigator.getGamepads = jest.fn(() => []);

// Mock touch events
global.ontouchstart = null;
global.onpointerdown = null;

// Mock WebGL
global.WebGLRenderingContext = class WebGLRenderingContext {};
global.WebGL2RenderingContext = class WebGL2RenderingContext {};

// Mock Canvas
global.HTMLCanvasElement = class HTMLCanvasElement {};
global.SVGElement = class SVGElement {};

// Mock AudioContext
global.AudioContext = class AudioContext {};
global.webkitAudioContext = global.AudioContext;

// Mock Web Audio API
global.AudioContext = class AudioContext {
  createGain() {
    return {
      gain: { value: 1 },
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }
  
  createOscillator() {
    return {
      frequency: { value: 440 },
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };
  }
  
  createAnalyser() {
    return {
      frequencyBinCount: 1024,
      getByteFrequencyData: jest.fn(),
      getByteTimeDomainData: jest.fn()
    };
  }
};

// Mock WebGL
global.WebGLRenderingContext = class WebGLRenderingContext {
  static VERTEX_SHADER = 35633;
  static FRAGMENT_SHADER = 35632;
  static COMPILE_STATUS = 35713;
  static LINK_STATUS = 35714;
  
  createShader() {
    return {};
  }
  
  createProgram() {
    return {};
  }
  
  getShaderParameter() {
    return true;
  }
  
  getProgramParameter() {
    return true;
  }
};

global.WebGL2RenderingContext = global.WebGLRenderingContext;

// Mock HTMLCanvasElement
global.HTMLCanvasElement = class HTMLCanvasElement {
  getContext() {
    return new global.WebGLRenderingContext();
  }
  
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      width: 300,
      height: 150,
      bottom: 150,
      right: 300
    };
  }
};

// Mock SVGElement
global.SVGElement = class SVGElement {
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      bottom: 100,
      right: 100
    };
  }
};

// Mock axe-core for testing
global.axe = {
  run: jest.fn(() => Promise.resolve({
    violations: [],
    passes: [],
    incomplete: []
  }))
};

// Mock lighthouse for testing
global.lighthouse = {
  run: jest.fn(() => Promise.resolve({
    lhr: {
      categories: {
        accessibility: {
          score: 1
        }
      }
    }
  }))
};

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset DOM
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  
  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});
