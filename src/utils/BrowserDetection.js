/**
 * Browser Detection utility for Accessify
 * Provides browser compatibility checking and feature detection
 */

export class BrowserDetection {
  constructor() {
    this.userAgent = navigator.userAgent;
    this.browser = this._detectBrowser();
    this.version = this._detectVersion();
    this.features = this._detectFeatures();
    this.isSupported = this._checkSupport();
  }

  /**
   * Detect browser type
   */
  _detectBrowser() {
    const ua = this.userAgent.toLowerCase();
    
    if (ua.includes('chrome') && !ua.includes('edg')) {
      return 'chrome';
    } else if (ua.includes('firefox')) {
      return 'firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'safari';
    } else if (ua.includes('edg')) {
      return 'edge';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      return 'opera';
    } else {
      return 'unknown';
    }
  }

  /**
   * Detect browser version
   */
  _detectVersion() {
    const ua = this.userAgent;
    let version = 'unknown';
    
    switch (this.browser) {
      case 'chrome':
        // Try multiple patterns for Chrome
        const chromeMatch = ua.match(/chrome\/(\d+)/i) || ua.match(/chromium\/(\d+)/i);
        version = chromeMatch ? parseInt(chromeMatch[1]) : 'unknown';
        break;
        
      case 'firefox':
        const firefoxMatch = ua.match(/firefox\/(\d+)/i);
        version = firefoxMatch ? parseInt(firefoxMatch[1]) : 'unknown';
        break;
        
      case 'safari':
        // Safari version detection is tricky
        const safariMatch = ua.match(/version\/(\d+)/i) || ua.match(/safari\/(\d+)/i);
        version = safariMatch ? parseInt(safariMatch[1]) : 'unknown';
        break;
        
      case 'edge':
        // Try both old and new Edge patterns
        const edgeMatch = ua.match(/edg\/(\d+)/i) || ua.match(/edge\/(\d+)/i);
        version = edgeMatch ? parseInt(edgeMatch[1]) : 'unknown';
        break;
        
      case 'opera':
        const operaMatch = ua.match(/(?:opera|opr)\/(\d+)/i);
        version = operaMatch ? parseInt(operaMatch[1]) : 'unknown';
        break;
    }
    
    // If still unknown, try a generic approach
    if (version === 'unknown') {
      const genericMatch = ua.match(/(\d+\.\d+)/);
      if (genericMatch) {
        version = parseInt(genericMatch[1].split('.')[0]);
      }
    }
    
    return version;
  }

  /**
   * Detect browser features
   */
  _detectFeatures() {
    return {
      // ES6+ features
      arrowFunctions: typeof (() => {}) === 'function',
      classes: typeof class {} === 'function',
      modules: 'import' in window || typeof window.import === 'function',
      promises: typeof Promise !== 'undefined',
      asyncAwait: (async () => {})() instanceof Promise,
      
      // Web APIs
      speechSynthesis: 'speechSynthesis' in window,
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
      webGL: 'WebGLRenderingContext' in window,
      webGL2: 'WebGL2RenderingContext' in window,
      canvas: 'HTMLCanvasElement' in window,
      svg: 'SVGElement' in window,
      
      // CSS features
      cssGrid: CSS.supports('display', 'grid'),
      cssFlexbox: CSS.supports('display', 'flex'),
      cssCustomProperties: CSS.supports('--custom-property', 'value'),
      cssTransforms: CSS.supports('transform', 'translateX(10px)'),
      cssTransitions: CSS.supports('transition', 'all 0.3s'),
      cssAnimations: CSS.supports('animation', 'fadeIn 1s'),
      
      // Accessibility features
      aria: 'ariaHidden' in document.createElement('div'),
      focusVisible: CSS.supports(':focus-visible'),
      reducedMotion: CSS.supports('(prefers-reduced-motion: reduce)'),
      highContrast: CSS.supports('(prefers-contrast: high)'),
      colorScheme: CSS.supports('(prefers-color-scheme: dark)'),
      
      // Input features
      touch: 'ontouchstart' in window,
      pointer: 'onpointerdown' in window,
      gamepad: 'getGamepads' in navigator,
      
      // Storage
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      indexedDB: 'indexedDB' in window,
      
      // Network
      fetch: 'fetch' in window,
      webSocket: 'WebSocket' in window,
      
      // File API
      fileReader: 'FileReader' in window,
      fileAPI: 'File' in window,
      
      // Performance
      performance: 'performance' in window,
      requestAnimationFrame: 'requestAnimationFrame' in window,
      requestIdleCallback: 'requestIdleCallback' in window,
      
      // Security
      crypto: 'crypto' in window,
      subtle: 'subtle' in (window.crypto || {}),
      
      // Internationalization
      intl: 'Intl' in window,
      intlDateTimeFormat: 'DateTimeFormat' in (window.Intl || {}),
      intlNumberFormat: 'NumberFormat' in (window.Intl || {}),
      
      // RTL support
      rtl: this._checkRTLSupport(),
      
      // Mobile detection
      mobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent),
      tablet: /ipad|android(?!.*mobile)/i.test(this.userAgent)
    };
  }

  /**
   * Check RTL support
   */
  _checkRTLSupport() {
    const testElement = document.createElement('div');
    testElement.style.direction = 'rtl';
    testElement.style.unicodeBidi = 'bidi-override';
    testElement.textContent = 'א';
    document.body.appendChild(testElement);
    
    const hasRTL = testElement.offsetLeft > 0;
    document.body.removeChild(testElement);
    
    return hasRTL;
  }

  /**
   * Check if browser is supported
   */
  _checkSupport() {
    const minVersions = {
      chrome: 60,
      firefox: 55,
      safari: 12,
      edge: 79,
      opera: 47
    };
    
    // Debug logging
    console.log('Browser Detection:', {
      browser: this.browser,
      version: this.version,
      userAgent: this.userAgent
    });
    
    // For development, be more lenient
    if (this.browser === 'unknown') {
      console.warn('Unknown browser detected, allowing for development');
      return true; // Allow unknown browsers for development
    }
    
    const minVersion = minVersions[this.browser];
    if (!minVersion) {
      console.warn(`No minimum version defined for ${this.browser}, allowing for development`);
      return true; // Allow browsers without defined minimums
    }
    
    if (this.version === 'unknown') {
      console.warn('Unknown version detected, allowing for development');
      return true; // Allow unknown versions for development
    }
    
    const isSupported = this.version >= minVersion;
    if (!isSupported) {
      console.warn(`Browser version ${this.version} is below minimum ${minVersion} for ${this.browser}`);
    }
    
    return isSupported;
  }

  /**
   * Get browser information
   */
  getInfo() {
    return {
      browser: this.browser,
      version: this.version,
      userAgent: this.userAgent,
      isSupported: this.isSupported,
      features: this.features,
      isMobile: this.features.mobile,
      isTablet: this.features.tablet,
      isDesktop: !this.features.mobile && !this.features.tablet
    };
  }

  /**
   * Check if specific feature is supported
   */
  hasFeature(feature) {
    return this.features[feature] === true;
  }

  /**
   * Get unsupported features
   */
  getUnsupportedFeatures() {
    const requiredFeatures = [
      'arrowFunctions',
      'classes',
      'promises',
      'speechSynthesis',
      'cssGrid',
      'cssFlexbox',
      'cssCustomProperties',
      'aria',
      'localStorage',
      'fetch',
      'performance',
      'requestAnimationFrame',
      'intl'
    ];
    
    return requiredFeatures.filter(feature => !this.features[feature]);
  }

  /**
   * Get browser capabilities score
   */
  getCapabilitiesScore() {
    const allFeatures = Object.keys(this.features);
    const supportedFeatures = allFeatures.filter(feature => this.features[feature]);
    
    return Math.round((supportedFeatures.length / allFeatures.length) * 100);
  }

  /**
   * Check if browser supports accessibility features
   */
  getAccessibilitySupport() {
    return {
      speechSynthesis: this.features.speechSynthesis,
      speechRecognition: this.features.speechRecognition,
      aria: this.features.aria,
      focusVisible: this.features.focusVisible,
      reducedMotion: this.features.reducedMotion,
      highContrast: this.features.highContrast,
      colorScheme: this.features.colorScheme,
      rtl: this.features.rtl,
      touch: this.features.touch,
      pointer: this.features.pointer
    };
  }

  /**
   * Get recommended features for this browser
   */
  getRecommendedFeatures() {
    const recommendations = [];
    
    if (this.features.speechSynthesis) {
      recommendations.push('textToSpeech');
    }
    
    if (this.features.speechRecognition) {
      recommendations.push('voiceCommands');
    }
    
    if (this.features.touch) {
      recommendations.push('touchNavigation', 'gestureAlternatives');
    }
    
    if (this.features.pointer) {
      recommendations.push('pointerEvents');
    }
    
    if (this.features.reducedMotion) {
      recommendations.push('reducedMotion');
    }
    
    if (this.features.highContrast) {
      recommendations.push('highContrast');
    }
    
    if (this.features.rtl) {
      recommendations.push('rtlSupport');
    }
    
    return recommendations;
  }

  /**
   * Get browser-specific optimizations
   */
  getOptimizations() {
    const optimizations = {
      chrome: {
        useWebGL: this.features.webGL2,
        useWebAudio: this.features.webAudio,
        useServiceWorker: 'serviceWorker' in navigator
      },
      firefox: {
        useWebGL: this.features.webGL,
        useWebAudio: this.features.webAudio,
        useIndexedDB: this.features.indexedDB
      },
      safari: {
        useWebGL: this.features.webGL,
        useWebAudio: this.features.webAudio,
        useLocalStorage: this.features.localStorage
      },
      edge: {
        useWebGL: this.features.webGL2,
        useWebAudio: this.features.webAudio,
        useServiceWorker: 'serviceWorker' in navigator
      }
    };
    
    return optimizations[this.browser] || {};
  }
}
