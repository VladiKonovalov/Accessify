/**
 * Configuration Manager for Accessify
 * Handles feature flags, settings, and configuration management
 */

export class ConfigManager {
  constructor(options = {}) {
    this.config = this._mergeWithDefaults(options);
    this.featureFlags = new Set();
    this._initializeFeatureFlags();
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    return this._getNestedValue(this.config, key) ?? defaultValue;
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    this._setNestedValue(this.config, key, value);
    return this;
  }

  /**
   * Update configuration
   */
  update(newConfig) {
    if (typeof newConfig !== 'object' || newConfig === null) {
      throw new Error('Configuration must be an object');
    }

    this.config = this._deepMerge(this.config, newConfig);
    this._updateFeatureFlags();
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature) {
    return this.featureFlags.has(feature);
  }

  /**
   * Enable feature
   */
  enableFeature(feature) {
    this.featureFlags.add(feature);
    this._updateFeatureConfig(feature, true);
  }

  /**
   * Disable feature
   */
  disableFeature(feature) {
    this.featureFlags.delete(feature);
    this._updateFeatureConfig(feature, false);
  }

  /**
   * Toggle feature
   */
  toggleFeature(feature) {
    if (this.isFeatureEnabled(feature)) {
      this.disableFeature(feature);
    } else {
      this.enableFeature(feature);
    }
  }

  /**
   * Get enabled features
   */
  getEnabledFeatures() {
    return Array.from(this.featureFlags);
  }

  /**
   * Get disabled features
   */
  getDisabledFeatures() {
    const allFeatures = this._getAllFeatures();
    return allFeatures.filter(feature => !this.featureFlags.has(feature));
  }

  /**
   * Reset to default configuration
   */
  reset() {
    this.config = this._getDefaultConfig();
    this._initializeFeatureFlags();
  }

  /**
   * Validate configuration
   */
  validate() {
    const errors = [];
    
    // Validate required fields
    const required = ['version', 'language', 'direction'];
    required.forEach(field => {
      if (!this.config[field]) {
        errors.push(`Missing required configuration: ${field}`);
      }
    });

    // Validate language
    const supportedLanguages = ['en', 'he', 'ar', 'es', 'fr', 'de'];
    if (!supportedLanguages.includes(this.config.language)) {
      errors.push(`Unsupported language: ${this.config.language}`);
    }

    // Validate direction
    if (!['ltr', 'rtl'].includes(this.config.direction)) {
      errors.push(`Invalid direction: ${this.config.direction}`);
    }

    // Validate zoom range
    if (this.config.visual.textSize.min < 0.5 || this.config.visual.textSize.max > 3.0) {
      errors.push('Text size range must be between 0.5 and 3.0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Merge with default configuration
   */
  _mergeWithDefaults(options) {
    const defaults = this._getDefaultConfig();
    return this._deepMerge(defaults, options);
  }

  /**
   * Get default configuration
   */
  _getDefaultConfig() {
    return {
      version: '1.0.0',
      language: 'en',
      direction: 'ltr',
      theme: 'default',
      debug: false,
      
      // Visual accessibility
      visual: {
        textSize: {
          enabled: true,
          current: 1.0,
          min: 0.5,
          max: 3.0,
          step: 0.1
        },
        contrast: {
          enabled: true,
          current: 'normal',
          modes: ['normal', 'high', 'inverted', 'grayscale']
        },
        brightness: {
          enabled: true,
          current: 1.0,
          min: 0.3,
          max: 2.0,
          step: 0.1
        },
        themes: {
          enabled: true,
          current: 'default',
          available: ['default', 'dark', 'light', 'colorblind-friendly']
        },
        cursors: {
          enabled: true,
          current: 'default',
          available: ['default', 'large', 'high-contrast']
        },
        focusIndicators: {
          enabled: true,
          style: 'outline',
          color: '#0066cc',
          thickness: '2px'
        }
      },

      // Navigation accessibility
      navigation: {
        keyboard: {
          enabled: true,
          shortcuts: {
            enabled: true,
            skipToContent: 'Alt+S',
            toggleMenu: 'Alt+M',
            increaseTextSize: 'Alt+Plus',
            decreaseTextSize: 'Alt+Minus',
            toggleContrast: 'Alt+C',
            toggleHighContrast: 'Alt+H'
          }
        },
        focus: {
          enabled: true,
          trap: true,
          visible: true,
          order: 'logical'
        },
        skipLinks: {
          enabled: true,
          visible: true
        }
      },

      // Reading accessibility
      reading: {
        textToSpeech: {
          enabled: true,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          voice: 'auto'
        },
        fonts: {
          enabled: true,
          dyslexia: true,
          current: 'default',
          available: ['default', 'opendyslexic', 'lexend', 'atkinson']
        },
        spacing: {
          enabled: true,
          lineHeight: 1.5,
          letterSpacing: 'normal',
          wordSpacing: 'normal'
        },
        guides: {
          enabled: true,
          readingRuler: true,
          textHighlighting: true
        }
      },

      // Motor accessibility
      motor: {
        targets: {
          enabled: true,
          minSize: 44, // pixels
          padding: 8
        },
        gestures: {
          enabled: true,
          alternatives: true
        },
        voice: {
          enabled: true,
          commands: true
        },
        motion: {
          enabled: true,
          reduced: false
        },
        delays: {
          enabled: true,
          interaction: 0,
          hover: 0
        }
      },

      // Multilingual support
      multilingual: {
        enabled: true,
        autoDetect: true,
        fallback: 'en',
        rtl: {
          enabled: true,
          autoDetect: true
        }
      },

      // Plugins
      plugins: {
        enabled: true,
        autoLoad: true,
        builtIn: ['textToSpeech', 'voiceCommands', 'switchNavigation']
      },

      // Testing and compliance
      testing: {
        enabled: false,
        axe: true,
        lighthouse: true,
        manual: true
      }
    };
  }

  /**
   * Initialize feature flags from configuration
   */
  _initializeFeatureFlags() {
    this.featureFlags.clear();
    
    // Add features based on configuration
    if (this.config.visual.textSize.enabled) this.featureFlags.add('textSizeAdjustment');
    if (this.config.visual.contrast.enabled) this.featureFlags.add('highContrast');
    if (this.config.visual.themes.enabled) this.featureFlags.add('colorThemes');
    if (this.config.visual.cursors.enabled) this.featureFlags.add('customCursors');
    if (this.config.visual.focusIndicators.enabled) this.featureFlags.add('focusIndicators');
    
    if (this.config.navigation.keyboard.enabled) this.featureFlags.add('keyboardNavigation');
    if (this.config.navigation.focus.enabled) this.featureFlags.add('focusManagement');
    if (this.config.navigation.skipLinks.enabled) this.featureFlags.add('skipLinks');
    
    if (this.config.reading.textToSpeech.enabled) this.featureFlags.add('textToSpeech');
    if (this.config.reading.fonts.enabled) this.featureFlags.add('dyslexiaFonts');
    if (this.config.reading.spacing.enabled) this.featureFlags.add('textSpacing');
    if (this.config.reading.guides.enabled) this.featureFlags.add('readingGuides');
    
    if (this.config.motor.targets.enabled) this.featureFlags.add('largeTargets');
    if (this.config.motor.gestures.enabled) this.featureFlags.add('gestureAlternatives');
    if (this.config.motor.voice.enabled) this.featureFlags.add('voiceCommands');
    if (this.config.motor.motion.enabled) this.featureFlags.add('motionControl');
    
    if (this.config.multilingual.enabled) this.featureFlags.add('multilingual');
    if (this.config.multilingual.rtl.enabled) this.featureFlags.add('rtlSupport');
    
    if (this.config.plugins.enabled) this.featureFlags.add('plugins');
  }

  /**
   * Update feature flags when configuration changes
   */
  _updateFeatureFlags() {
    this._initializeFeatureFlags();
  }

  /**
   * Update feature configuration
   */
  _updateFeatureConfig(feature, enabled) {
    const featureMap = {
      textSizeAdjustment: 'visual.textSize.enabled',
      highContrast: 'visual.contrast.enabled',
      colorThemes: 'visual.themes.enabled',
      customCursors: 'visual.cursors.enabled',
      focusIndicators: 'visual.focusIndicators.enabled',
      keyboardNavigation: 'navigation.keyboard.enabled',
      focusManagement: 'navigation.focus.enabled',
      skipLinks: 'navigation.skipLinks.enabled',
      textToSpeech: 'reading.textToSpeech.enabled',
      dyslexiaFonts: 'reading.fonts.enabled',
      textSpacing: 'reading.spacing.enabled',
      readingGuides: 'reading.guides.enabled',
      largeTargets: 'motor.targets.enabled',
      gestureAlternatives: 'motor.gestures.enabled',
      voiceCommands: 'motor.voice.enabled',
      motionControl: 'motor.motion.enabled',
      multilingual: 'multilingual.enabled',
      rtlSupport: 'multilingual.rtl.enabled',
      plugins: 'plugins.enabled'
    };

    const configPath = featureMap[feature];
    if (configPath) {
      this._setNestedValue(this.config, configPath, enabled);
    }
  }

  /**
   * Get all available features
   */
  _getAllFeatures() {
    return [
      'textSizeAdjustment',
      'highContrast',
      'colorThemes',
      'customCursors',
      'focusIndicators',
      'keyboardNavigation',
      'focusManagement',
      'skipLinks',
      'textToSpeech',
      'dyslexiaFonts',
      'textSpacing',
      'readingGuides',
      'largeTargets',
      'gestureAlternatives',
      'voiceCommands',
      'motionControl',
      'multilingual',
      'rtlSupport',
      'plugins'
    ];
  }

  /**
   * Deep merge objects
   */
  _deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this._deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Get nested value from object
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object
   */
  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }
}
