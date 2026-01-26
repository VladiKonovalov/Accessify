'use strict';

/**
 * Event Emitter for Accessify
 * Provides a simple event system for component communication
 */

class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    this.events.get(event).push(callback);
    return this;
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.events.has(event)) {
      return this;
    }

    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.events.delete(event);
    }

    return this;
  }

  /**
   * Emit event
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return this;
    }

    const callbacks = this.events.get(event);
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });

    return this;
  }

  /**
   * Add one-time event listener
   */
  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };

    return this.on(event, onceCallback);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * Get all event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event) {
    if (!this.events.has(event)) {
      return 0;
    }
    return this.events.get(event).length;
  }

  /**
   * Check if event has listeners
   */
  hasListeners(event) {
    return this.listenerCount(event) > 0;
  }
}

/**
 * State Manager for Accessify
 * Provides immutable state management with change tracking
 */

class StateManager {
  constructor() {
    this.state = new Map();
    this.history = [];
    this.maxHistorySize = 50;
    this.listeners = new Map();
  }

  /**
   * Get current state
   */
  getState() {
    return Object.fromEntries(this.state);
  }

  /**
   * Get specific state value
   */
  get(key) {
    return this.state.get(key);
  }

  /**
   * Set state value
   */
  set(key, value) {
    const oldValue = this.state.get(key);
    
    // Only update if value has changed
    if (oldValue !== value) {
      this._addToHistory(key, oldValue, value);
      this.state.set(key, value);
      this._notifyListeners(key, value, oldValue);
    }
    
    return this;
  }

  /**
   * Set multiple state values
   */
  setState(newState) {
    if (typeof newState !== 'object' || newState === null) {
      throw new Error('State must be an object');
    }

    const changes = {};
    let hasChanges = false;

    // Update existing keys
    for (const [key, value] of Object.entries(newState)) {
      const oldValue = this.state.get(key);
      if (oldValue !== value) {
        changes[key] = { old: oldValue, new: value };
        this._addToHistory(key, oldValue, value);
        this.state.set(key, value);
        hasChanges = true;
      }
    }

    // Notify listeners if there were changes
    if (hasChanges) {
      this._notifyListeners('*', changes, null);
    }

    return this;
  }

  /**
   * Delete state key
   */
  delete(key) {
    const oldValue = this.state.get(key);
    if (this.state.has(key)) {
      this._addToHistory(key, oldValue, undefined);
      this.state.delete(key);
      this._notifyListeners(key, undefined, oldValue);
    }
    return this;
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.state.has(key);
  }

  /**
   * Clear all state
   */
  clear() {
    const oldState = this.getState();
    this._addToHistory('*', oldState, {});
    this.state.clear();
    this._notifyListeners('*', {}, oldState);
    return this;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    this.listeners.get(key).push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(key, callback);
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(key, callback) {
    if (!this.listeners.has(key)) {
      return;
    }

    const callbacks = this.listeners.get(key);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.listeners.delete(key);
    }
  }

  /**
   * Get state history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Undo last change
   */
  undo() {
    if (this.history.length === 0) {
      return false;
    }

    const lastChange = this.history.pop();
    
    if (lastChange.key === '*') {
      // Full state change
      this.state.clear();
      if (lastChange.oldValue) {
        this.setState(lastChange.oldValue);
      }
    } else {
      // Single key change
      if (lastChange.oldValue === undefined) {
        this.state.delete(lastChange.key);
      } else {
        this.state.set(lastChange.key, lastChange.oldValue);
      }
    }

    return true;
  }

  /**
   * Add change to history
   */
  _addToHistory(key, oldValue, newValue) {
    this.history.push({
      key,
      oldValue,
      newValue,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Notify listeners of state changes
   */
  _notifyListeners(key, newValue, oldValue) {
    // Notify specific key listeners
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key);
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error(`Error in state listener for "${key}":`, error);
        }
      });
    }

    // Notify wildcard listeners
    if (this.listeners.has('*')) {
      const callbacks = this.listeners.get('*');
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error('Error in wildcard state listener:', error);
        }
      });
    }
  }

  /**
   * Create a selector function for derived state
   */
  createSelector(selector) {
    if (typeof selector !== 'function') {
      throw new Error('Selector must be a function');
    }

    let lastResult = null;
    let lastState = null;

    return () => {
      const currentState = this.getState();
      
      // Check if state has changed
      if (currentState !== lastState) {
        lastState = currentState;
        lastResult = selector(currentState);
      }
      
      return lastResult;
    };
  }

  /**
   * Get state size
   */
  size() {
    return this.state.size;
  }

  /**
   * Get all keys
   */
  keys() {
    return Array.from(this.state.keys());
  }

  /**
   * Get all values
   */
  values() {
    return Array.from(this.state.values());
  }

  /**
   * Get all entries
   */
  entries() {
    return Array.from(this.state.entries());
  }
}

/**
 * Configuration Manager for Accessify
 * Handles feature flags, settings, and configuration management
 */

class ConfigManager {
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
          available: ['default', 'large', 'extra-large', 'high-contrast', 'crosshair', 'pointer-large', 'text-large']
        },
        focusIndicators: {
          enabled: true,
          style: 'standard',
          color: '#0066cc',
          thickness: 2
        },
        linkUnderlining: {
          enabled: true,
          style: 'none',
          color: '#0066cc',
          thickness: 2,
          offset: 2
        },
        colorFilters: {
          enabled: true,
          current: 'none',
          available: ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia', 'high-contrast', 'invert', 'sepia', 'blue-light']
        },
        saturation: {
          enabled: true,
          min: 0.0,
          max: 2.0,
          step: 0.1,
          current: 1.0
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

      // Reading guide
      readingGuide: {
        enabled: true,
        readingRuler: {
          enabled: true,
          height: 60,
          color: '#ff0000',
          opacity: 0.1
        },
        textHighlighting: {
          enabled: true,
          color: 'rgba(255, 255, 0, 0.3)'
        },
        textMasking: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.8)'
        }
      },

      // Screen reader optimization
      screenReader: {
        enabled: true,
        announcements: {
          enabled: true,
          types: ['polite', 'assertive', 'status', 'log']
        },
        ariaEnhancements: {
          enabled: true,
          autoEnhance: true
        },
        liveRegions: {
          enabled: true,
          polite: true,
          assertive: true,
          status: true,
          log: true
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

/**
 * Plugin Manager for Accessify
 * Handles plugin registration, loading, and lifecycle management
 */

class PluginManager {
  constructor(accessify) {
    this.accessify = accessify;
    this.plugins = new Map();
    this.initializedPlugins = new Set();
    this.pluginConfigs = new Map();
  }

  /**
   * Register a plugin
   */
  register(name, pluginClass, config = {}) {
    if (typeof pluginClass !== 'function') {
      throw new Error('Plugin must be a class or constructor function');
    }

    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already registered`);
      return this;
    }

    this.plugins.set(name, pluginClass);
    this.pluginConfigs.set(name, config);
    
    console.log(`Plugin "${name}" registered successfully`);
    return this;
  }

  /**
   * Unregister a plugin
   */
  unregister(name) {
    if (this.plugins.has(name)) {
      // Destroy if initialized
      if (this.initializedPlugins.has(name)) {
        this.destroy(name);
      }
      
      this.plugins.delete(name);
      this.pluginConfigs.delete(name);
      console.log(`Plugin "${name}" unregistered`);
    }
    return this;
  }

  /**
   * Initialize all registered plugins
   */
  async init() {
    const enabledPlugins = this.accessify.configManager.get('plugins.builtIn', []);
    
    for (const pluginName of enabledPlugins) {
      if (this.plugins.has(pluginName)) {
        await this.initPlugin(pluginName);
      }
    }
  }

  /**
   * Initialize a specific plugin
   */
  async initPlugin(name) {
    if (!this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    if (this.initializedPlugins.has(name)) {
      console.warn(`Plugin "${name}" is already initialized`);
      return this;
    }

    try {
      const PluginClass = this.plugins.get(name);
      const config = this.pluginConfigs.get(name);
      
      // Create plugin instance
      const plugin = new PluginClass(this.accessify, config);
      
      // Initialize plugin
      if (typeof plugin.init === 'function') {
        await plugin.init();
      }
      
      // Store initialized plugin
      this.plugins.set(name, plugin);
      this.initializedPlugins.add(name);
      
      this.accessify.emit('pluginInitialized', { name, plugin });
      console.log(`Plugin "${name}" initialized successfully`);
      
    } catch (error) {
      console.error(`Failed to initialize plugin "${name}":`, error);
      throw error;
    }
  }

  /**
   * Destroy all initialized plugins
   */
  destroy() {
    for (const name of this.initializedPlugins) {
      this.destroyPlugin(name);
    }
  }

  /**
   * Destroy a specific plugin
   */
  destroyPlugin(name) {
    if (!this.initializedPlugins.has(name)) {
      return;
    }

    try {
      const plugin = this.plugins.get(name);
      
      if (plugin && typeof plugin.destroy === 'function') {
        plugin.destroy();
      }
      
      this.initializedPlugins.delete(name);
      this.accessify.emit('pluginDestroyed', { name });
      console.log(`Plugin "${name}" destroyed`);
      
    } catch (error) {
      console.error(`Failed to destroy plugin "${name}":`, error);
    }
  }

  /**
   * Get plugin instance
   */
  getPlugin(name) {
    if (!this.initializedPlugins.has(name)) {
      return null;
    }
    return this.plugins.get(name);
  }

  /**
   * Check if plugin is initialized
   */
  isInitialized(name) {
    return this.initializedPlugins.has(name);
  }

  /**
   * Get all registered plugins
   */
  getRegisteredPlugins() {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get all initialized plugins
   */
  getInitializedPlugins() {
    return Array.from(this.initializedPlugins);
  }

  /**
   * Update plugin configuration
   */
  updatePluginConfig(name, newConfig) {
    if (!this.pluginConfigs.has(name)) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    const currentConfig = this.pluginConfigs.get(name);
    const updatedConfig = { ...currentConfig, ...newConfig };
    this.pluginConfigs.set(name, updatedConfig);

    // Update plugin if initialized
    if (this.initializedPlugins.has(name)) {
      const plugin = this.plugins.get(name);
      if (plugin && typeof plugin.updateConfig === 'function') {
        plugin.updateConfig(updatedConfig);
      }
    }

    this.accessify.emit('pluginConfigUpdated', { name, config: updatedConfig });
  }

  /**
   * Enable plugin
   */
  enablePlugin(name) {
    const builtInPlugins = this.accessify.configManager.get('plugins.builtIn', []);
    if (!builtInPlugins.includes(name)) {
      builtInPlugins.push(name);
      this.accessify.configManager.set('plugins.builtIn', builtInPlugins);
    }
  }

  /**
   * Disable plugin
   */
  disablePlugin(name) {
    const builtInPlugins = this.accessify.configManager.get('plugins.builtIn', []);
    const index = builtInPlugins.indexOf(name);
    if (index > -1) {
      builtInPlugins.splice(index, 1);
      this.accessify.configManager.set('plugins.builtIn', builtInPlugins);
      
      // Destroy if initialized
      if (this.initializedPlugins.has(name)) {
        this.destroyPlugin(name);
      }
    }
  }

  /**
   * Load external plugin
   */
  async loadExternalPlugin(url, name, config = {}) {
    try {
      // Dynamic import of external plugin
      const module = await import(url);
      const PluginClass = module.default || module[name];
      
      if (!PluginClass) {
        throw new Error(`Plugin class not found in module: ${url}`);
      }
      
      this.register(name, PluginClass, config);
      await this.initPlugin(name);
      
      return this.getPlugin(name);
      
    } catch (error) {
      console.error(`Failed to load external plugin from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get plugin status
   */
  getPluginStatus() {
    const status = {};
    
    for (const name of this.plugins.keys()) {
      status[name] = {
        registered: true,
        initialized: this.initializedPlugins.has(name),
        config: this.pluginConfigs.get(name)
      };
    }
    
    return status;
  }

  /**
   * Validate plugin
   */
  validatePlugin(pluginClass) {
    const errors = [];
    
    if (typeof pluginClass !== 'function') {
      errors.push('Plugin must be a class or constructor function');
    }
    
    // Check for required methods
    const requiredMethods = ['init', 'destroy'];
    requiredMethods.forEach(method => {
      if (typeof pluginClass.prototype[method] !== 'function') {
        errors.push(`Plugin must implement ${method}() method`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create plugin API
   */
  createPluginAPI(pluginName) {
    return {
      name: pluginName,
      accessify: this.accessify,
      config: this.pluginConfigs.get(pluginName),
      
      // Event system
      on: (event, callback) => this.accessify.on(event, callback),
      off: (event, callback) => this.accessify.off(event, callback),
      emit: (event, ...args) => this.accessify.emit(event, ...args),
      
      // State management
      getState: () => this.accessify.getState(),
      setState: (state) => this.accessify.setState(state),
      
      // Configuration
      getConfig: (key, defaultValue) => this.accessify.configManager.get(key, defaultValue),
      setConfig: (key, value) => this.accessify.configManager.set(key, value),
      
      // Utilities
      log: (message, ...args) => console.log(`[${pluginName}]`, message, ...args),
      warn: (message, ...args) => console.warn(`[${pluginName}]`, message, ...args),
      error: (message, ...args) => console.error(`[${pluginName}]`, message, ...args)
    };
  }
}

/**
 * Browser Detection utility for Accessify
 * Provides browser compatibility checking and feature detection
 */

class BrowserDetection {
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

/**
 * Error Handler for Accessify
 * Provides centralized error handling and logging
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.errorTypes = {
      INITIALIZATION: 'initialization',
      RUNTIME: 'runtime',
      CONFIGURATION: 'configuration',
      PLUGIN: 'plugin',
      COMPONENT: 'component',
      NETWORK: 'network',
      PERMISSION: 'permission',
      COMPATIBILITY: 'compatibility'
    };
  }

  /**
   * Handle error
   */
  handle(error, context = '', type = this.errorTypes.RUNTIME) {
    const errorInfo = this._createErrorInfo(error, context, type);
    
    // Add to errors array
    this.addError(errorInfo);
    
    // Log error
    this._logError(errorInfo);
    
    // Emit error event if available
    if (typeof window !== 'undefined' && window.Accessify && window.Accessify.prototype) {
      // Try to emit on the global instance if it exists
      if (window.accessifyInstance && typeof window.accessifyInstance.emit === 'function') {
        window.accessifyInstance.emit('error', errorInfo);
      }
    }
    
    return errorInfo;
  }

  /**
   * Add error to collection
   */
  addError(errorInfo) {
    this.errors.push(errorInfo);
    
    // Limit error collection size
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  /**
   * Create error info object
   */
  _createErrorInfo(error, context, type) {
    return {
      id: this._generateErrorId(),
      timestamp: new Date().toISOString(),
      type,
      context,
      message: error.message || String(error),
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: this._determineSeverity(error, type),
      recoverable: this._isRecoverable(error, type)
    };
  }

  /**
   * Generate unique error ID
   */
  _generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determine error severity
   */
  _determineSeverity(error, type) {
    const severityMap = {
      [this.errorTypes.INITIALIZATION]: 'high',
      [this.errorTypes.CONFIGURATION]: 'medium',
      [this.errorTypes.PLUGIN]: 'medium',
      [this.errorTypes.COMPONENT]: 'medium',
      [this.errorTypes.NETWORK]: 'low',
      [this.errorTypes.PERMISSION]: 'high',
      [this.errorTypes.COMPATIBILITY]: 'high',
      [this.errorTypes.RUNTIME]: 'medium'
    };
    
    return severityMap[type] || 'medium';
  }

  /**
   * Check if error is recoverable
   */
  _isRecoverable(error, type) {
    const recoverableTypes = [
      this.errorTypes.NETWORK,
      this.errorTypes.PLUGIN,
      this.errorTypes.COMPONENT
    ];
    
    return recoverableTypes.includes(type);
  }

  /**
   * Log error
   */
  _logError(errorInfo) {
    const logLevel = this._getLogLevel(errorInfo.severity);
    const logMessage = this._formatLogMessage(errorInfo);
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, errorInfo);
        break;
      case 'warn':
        console.warn(logMessage, errorInfo);
        break;
      case 'info':
        console.info(logMessage, errorInfo);
        break;
      default:
        console.log(logMessage, errorInfo);
    }
  }

  /**
   * Get log level based on severity
   */
  _getLogLevel(severity) {
    const levelMap = {
      high: 'error',
      medium: 'warn',
      low: 'info'
    };
    
    return levelMap[severity] || 'log';
  }

  /**
   * Format log message
   */
  _formatLogMessage(errorInfo) {
    return `[Accessify ${errorInfo.type.toUpperCase()}] ${errorInfo.context}: ${errorInfo.message}`;
  }

  /**
   * Get all errors
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type) {
    return this.errors.filter(error => error.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity) {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      bySeverity: {},
      recent: this.getRecentErrors(5).length
    };
    
    // Count by type
    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });
    
    // Count by severity
    this.errors.forEach(error => {
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Check if there are critical errors
   */
  hasCriticalErrors() {
    return this.errors.some(error => error.severity === 'high');
  }

  /**
   * Get critical errors
   */
  getCriticalErrors() {
    return this.errors.filter(error => error.severity === 'high');
  }

  /**
   * Create error report
   */
  createErrorReport() {
    const stats = this.getErrorStats();
    const criticalErrors = this.getCriticalErrors();
    
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stats,
      criticalErrors,
      allErrors: this.errors,
      recommendations: this._getErrorRecommendations()
    };
  }

  /**
   * Get error recommendations
   */
  _getErrorRecommendations() {
    const recommendations = [];
    const stats = this.getErrorStats();
    
    if (stats.byType[this.errorTypes.COMPATIBILITY] > 0) {
      recommendations.push('Consider updating your browser or using a supported browser');
    }
    
    if (stats.byType[this.errorTypes.PERMISSION] > 0) {
      recommendations.push('Check browser permissions for microphone, camera, and storage access');
    }
    
    if (stats.byType[this.errorTypes.NETWORK] > 0) {
      recommendations.push('Check your internet connection and try again');
    }
    
    if (stats.byType[this.errorTypes.PLUGIN] > 0) {
      recommendations.push('Some accessibility plugins may not be working correctly');
    }
    
    return recommendations;
  }

  /**
   * Wrap function with error handling
   */
  wrapFunction(fn, context = '', type = this.errorTypes.RUNTIME) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, context, type);
        throw error;
      }
    };
  }

  /**
   * Wrap async function with error handling
   */
  wrapAsyncFunction(fn, context = '', type = this.errorTypes.RUNTIME) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, context, type);
        throw error;
      }
    };
  }

  /**
   * Create error boundary for components
   */
  createErrorBoundary(componentName) {
    return {
      catch: (error, context = '') => {
        this.handle(error, `${componentName}: ${context}`, this.errorTypes.COMPONENT);
      },
      
      wrap: (fn) => {
        return this.wrapFunction(fn, componentName, this.errorTypes.COMPONENT);
      },
      
      wrapAsync: (fn) => {
        return this.wrapAsyncFunction(fn, componentName, this.errorTypes.COMPONENT);
      }
    };
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    // Unhandled errors
    window.addEventListener('error', (event) => {
      this.handle(event.error, 'Global error', this.errorTypes.RUNTIME);
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handle(event.reason, 'Unhandled promise rejection', this.errorTypes.RUNTIME);
    });
    
    // Console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Check if it's an Accessify-related error
      const message = args.join(' ');
      if (message.includes('Accessify') || message.includes('accessibility')) {
        this.handle(new Error(message), 'Console error', this.errorTypes.RUNTIME);
      }
    };
  }

  /**
   * Remove global error handlers
   */
  removeGlobalHandlers() {
    // Note: This is a simplified version. In a real implementation,
    // you'd need to store references to the original handlers
    console.warn('Global error handlers cannot be easily removed. Consider restarting the page.');
  }
}

/**
 * Visual Accessibility Component
 * Handles text size, contrast, themes, cursors, and focus indicators
 */

class VisualAccessibility {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.currentStyles = new Map();
    this.styleElement = null;
    this.originalStyles = new Map();
  }

  /**
   * Initialize visual accessibility features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Create style element for dynamic styles
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'accessify-visual-styles';
      document.head.appendChild(this.styleElement);

      // Store original styles
      this._storeOriginalStyles();

      // Apply initial configuration
      await this._applyInitialConfiguration();

      // Set up event listeners
      this._setupEventListeners();

      // Initialize alt text generation
      this._initializeAltTextGeneration();

      this.isInitialized = true;
      this.accessify.emit('visualAccessibilityInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Visual accessibility initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy visual accessibility features
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Remove event listeners
      this._removeEventListeners();

      // Restore original styles
      this._restoreOriginalStyles();

      // Remove style element
      if (this.styleElement && this.styleElement.parentNode) {
        this.styleElement.parentNode.removeChild(this.styleElement);
      }

      // Clear current styles
      this.currentStyles.clear();

      this.isInitialized = false;
      this.accessify.emit('visualAccessibilityDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Visual accessibility destruction', 'component');
    }
  }

  /**
   * Set text size
   */
  setTextSize(size) {
    const config = this.accessify.configManager.get('visual.textSize');
    const clampedSize = Math.max(config.min, Math.min(config.max, size));
    
    this.accessify.configManager.set('visual.textSize.current', clampedSize);
    this._applyTextSize(clampedSize);
    
    this.accessify.emit('textSizeChanged', clampedSize);
  }

  /**
   * Increase text size
   */
  increaseTextSize() {
    const config = this.accessify.configManager.get('visual.textSize');
    const current = config.current;
    const newSize = Math.min(config.max, current + config.step);
    this.setTextSize(newSize);
  }

  /**
   * Decrease text size
   */
  decreaseTextSize() {
    const config = this.accessify.configManager.get('visual.textSize');
    const current = config.current;
    const newSize = Math.max(config.min, current - config.step);
    this.setTextSize(newSize);
  }

  /**
   * Reset text size
   */
  resetTextSize() {
    this.setTextSize(1.0);
  }

  /**
   * Set contrast mode
   */
  setContrastMode(mode) {
    const availableModes = this.accessify.configManager.get('visual.contrast.modes');
    
    if (!availableModes.includes(mode)) {
      throw new Error(`Invalid contrast mode: ${mode}`);
    }

    this.accessify.configManager.set('visual.contrast.current', mode);
    this._applyContrastMode(mode);
    
    this.accessify.emit('contrastModeChanged', mode);
  }

  /**
   * Toggle contrast mode
   */
  toggleContrastMode() {
    const current = this.accessify.configManager.get('visual.contrast.current');
    const modes = this.accessify.configManager.get('visual.contrast.modes');
    const currentIndex = modes.indexOf(current);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setContrastMode(modes[nextIndex]);
  }

  /**
   * Set brightness level
   */
  setBrightness(level) {
    const config = this.accessify.configManager.get('visual.brightness');
    const clampedLevel = Math.max(config.min, Math.min(config.max, level));
    
    this.accessify.configManager.set('visual.brightness.current', clampedLevel);
    this._applyBrightness(clampedLevel);
    
    this.accessify.emit('brightnessChanged', clampedLevel);
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    const availableThemes = this.accessify.configManager.get('visual.themes.available');
    
    if (!availableThemes.includes(theme)) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    this.accessify.configManager.set('visual.themes.current', theme);
    this._applyTheme(theme);
    
    this.accessify.emit('themeChanged', theme);
  }

  /**
   * Set color filter
   */
  setColorFilter(filter) {
    const availableFilters = this.accessify.configManager.get('visual.colorFilters.available');
    
    if (!availableFilters.includes(filter)) {
      throw new Error(`Invalid color filter: ${filter}`);
    }

    this.accessify.configManager.set('visual.colorFilters.current', filter);
    this._applyColorFilter(filter);
    
    this.accessify.emit('colorFilterChanged', filter);
  }

  /**
   * Apply color filter
   */
  _applyColorFilter(filter) {
    let css = '';
    
    switch (filter) {
      case 'protanopia':
        css = `
          * {
            filter: url(#protanopia) !important;
          }
        `;
        break;
        
      case 'deuteranopia':
        css = `
          * {
            filter: url(#deuteranopia) !important;
          }
        `;
        break;
        
      case 'tritanopia':
        css = `
          * {
            filter: url(#tritanopia) !important;
          }
        `;
        break;
        
      case 'achromatopsia':
        css = `
          * {
            filter: grayscale(100%) !important;
          }
        `;
        break;
        
      case 'high-contrast':
        css = `
          * {
            filter: contrast(200%) brightness(150%) !important;
          }
        `;
        break;
        
      case 'invert':
        css = `
          * {
            filter: invert(100%) !important;
          }
        `;
        break;
        
      case 'sepia':
        css = `
          * {
            filter: sepia(100%) !important;
          }
        `;
        break;
        
      case 'blue-light':
        css = `
          * {
            filter: hue-rotate(180deg) saturate(150%) !important;
          }
        `;
        break;
        
      default: // 'none'
        css = `
          * {
            filter: none !important;
          }
        `;
        break;
    }
    
    this._addStyle('color-filter', css);
  }

  /**
   * Set saturation level
   */
  setSaturation(level) {
    const config = this.accessify.configManager.get('visual.saturation');
    const clampedLevel = Math.max(config.min, Math.min(config.max, level));
    
    this.accessify.configManager.set('visual.saturation.current', clampedLevel);
    this._applySaturation(clampedLevel);
    
    this.accessify.emit('saturationChanged', clampedLevel);
  }

  /**
   * Apply saturation
   */
  _applySaturation(level) {
    const css = `
      * {
        filter: saturate(${level}) !important;
      }
    `;
    
    this._addStyle('saturation', css);
  }

  /**
   * Set cursor type
   */
  setCursor(cursorType) {
    const availableCursors = this.accessify.configManager.get('visual.cursors.available');
    
    if (!availableCursors.includes(cursorType)) {
      throw new Error(`Invalid cursor type: ${cursorType}`);
    }

    this.accessify.configManager.set('visual.cursors.current', cursorType);
    this._applyCursor(cursorType);
    
    this.accessify.emit('cursorChanged', cursorType);
  }

  /**
   * Set focus indicator style
   */
  setFocusIndicator(style) {
    const config = this.accessify.configManager.get('visual.focusIndicators');
    this.accessify.configManager.set('visual.focusIndicators.style', style);
    this._applyFocusIndicators(config);
    
    this.accessify.emit('focusIndicatorChanged', style);
  }

  /**
   * Set link underlining style
   */
  setLinkUnderlining(style) {
    const config = this.accessify.configManager.get('visual.linkUnderlining');
    this.accessify.configManager.set('visual.linkUnderlining.style', style);
    this._applyLinkUnderlining(config);
    
    this.accessify.emit('linkUnderliningChanged', style);
  }

  /**
   * Apply link underlining
   */
  _applyLinkUnderlining(config) {
    let css = '';
    
    switch (config.style) {
      case 'always':
        css = `
          a {
            text-decoration: underline !important;
            text-decoration-thickness: ${config.thickness}px !important;
            text-underline-offset: ${config.offset}px !important;
            text-decoration-color: ${config.color} !important;
          }
          
          a:hover {
            text-decoration-thickness: ${config.thickness * 1.5}px !important;
          }
        `;
        break;
        
      case 'hover':
        css = `
          a {
            text-decoration: none !important;
          }
          
          a:hover {
            text-decoration: underline !important;
            text-decoration-thickness: ${config.thickness}px !important;
            text-underline-offset: ${config.offset}px !important;
            text-decoration-color: ${config.color} !important;
          }
        `;
        break;
        
      case 'enhanced':
        css = `
          a {
            text-decoration: underline !important;
            text-decoration-thickness: ${config.thickness}px !important;
            text-underline-offset: ${config.offset}px !important;
            text-decoration-color: ${config.color} !important;
            border-bottom: 1px solid transparent !important;
            transition: all 0.2s ease !important;
          }
          
          a:hover {
            text-decoration-thickness: ${config.thickness * 2}px !important;
            border-bottom-color: ${config.color} !important;
            background-color: rgba(255, 255, 0, 0.1) !important;
          }
        `;
        break;
        
      case 'double':
        css = `
          a {
            text-decoration: underline !important;
            text-decoration-style: double !important;
            text-decoration-thickness: ${config.thickness}px !important;
            text-underline-offset: ${config.offset}px !important;
            text-decoration-color: ${config.color} !important;
          }
        `;
        break;
        
      default: // 'none'
        css = `
          a {
            text-decoration: none !important;
          }
        `;
        break;
    }
    
    this._addStyle('link-underlining', css);
  }

  /**
   * Apply text size
   */
  _applyTextSize(size) {
    const css = `
      html {
        font-size: ${size * 16}px !important;
      }
      
      body {
        font-size: ${size}rem !important;
      }
      
      * {
        font-size: inherit !important;
      }
    `;
    
    this._addStyle('text-size', css);
  }

  /**
   * Apply contrast mode
   */
  _applyContrastMode(mode) {
    let css = '';
    
    switch (mode) {
      case 'high':
        css = `
          * {
            background-color: white !important;
            color: black !important;
            border-color: black !important;
          }
          
          a {
            color: #0000EE !important;
          }
          
          a:visited {
            color: #551A8B !important;
          }
        `;
        break;
        
      case 'inverted':
        css = `
          * {
            background-color: black !important;
            color: white !important;
            border-color: white !important;
          }
          
          a {
            color: #00FFFF !important;
          }
          
          a:visited {
            color: #FF00FF !important;
          }
        `;
        break;
        
      case 'grayscale':
        css = `
          * {
            filter: grayscale(100%) !important;
          }
        `;
        break;
        
      case 'normal':
      default:
        css = `
          * {
            filter: none !important;
          }
        `;
        break;
    }
    
    this._addStyle('contrast-mode', css);
  }

  /**
   * Apply brightness
   */
  _applyBrightness(level) {
    const css = `
      * {
        filter: brightness(${level}) !important;
      }
    `;
    
    this._addStyle('brightness', css);
  }

  /**
   * Apply theme
   */
  _applyTheme(theme) {
    let css = '';
    
    switch (theme) {
      case 'dark':
        css = `
          * {
            background-color: #1a1a1a !important;
            color: #ffffff !important;
            border-color: #333333 !important;
          }
          
          a {
            color: #66b3ff !important;
          }
          
          input, textarea, select {
            background-color: #2a2a2a !important;
            color: #ffffff !important;
            border-color: #444444 !important;
          }
        `;
        break;
        
      case 'light':
        css = `
          * {
            background-color: #ffffff !important;
            color: #000000 !important;
            border-color: #cccccc !important;
          }
          
          a {
            color: #0066cc !important;
          }
          
          input, textarea, select {
            background-color: #f8f8f8 !important;
            color: #000000 !important;
            border-color: #dddddd !important;
          }
        `;
        break;
        
      case 'colorblind-friendly':
        css = `
          * {
            background-color: #f8f8f8 !important;
            color: #2c2c2c !important;
            border-color: #666666 !important;
          }
          
          a {
            color: #0066cc !important;
          }
          
          .error, .danger {
            color: #d73027 !important;
          }
          
          .warning {
            color: #f46d43 !important;
          }
          
          .success {
            color: #1a9641 !important;
          }
        `;
        break;
        
      case 'default':
      default:
        css = `
          * {
            background-color: inherit !important;
            color: inherit !important;
            border-color: inherit !important;
          }
        `;
        break;
    }
    
    this._addStyle('theme', css);
  }

  /**
   * Apply cursor
   */
  _applyCursor(cursorType) {
    let css = '';
    
    switch (cursorType) {
      case 'large':
        css = `
          * {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="black"/></svg>'), auto !important;
          }
        `;
        break;
        
      case 'extra-large':
        css = `
          * {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="black"/></svg>'), auto !important;
          }
        `;
        break;
        
      case 'high-contrast':
        css = `
          * {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="white" stroke="black" stroke-width="2"/></svg>'), auto !important;
          }
        `;
        break;
        
      case 'crosshair':
        css = `
          * {
            cursor: crosshair !important;
          }
        `;
        break;
        
      case 'pointer-large':
        css = `
          * {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M2 2 L2 22 L8 16 L14 22 L14 2 Z" fill="black"/></svg>'), auto !important;
          }
        `;
        break;
        
      case 'text-large':
        css = `
          * {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><line x1="12" y1="2" x2="12" y2="30" stroke="black" stroke-width="3"/></svg>'), auto !important;
          }
        `;
        break;
        
      case 'default':
      default:
        css = `
          * {
            cursor: default !important;
          }
        `;
        break;
    }
    
    this._addStyle('cursor', css);
  }

  /**
   * Apply focus indicators
   */
  _applyFocusIndicators(config) {
    let css = '';
    
    // Enhanced focus indicators with multiple styles
    switch (config.style) {
      case 'highlight':
        css = `
          *:focus,
          *:focus-visible {
            outline: ${config.thickness}px solid ${config.color} !important;
            outline-offset: 2px !important;
            background-color: rgba(255, 255, 0, 0.2) !important;
            box-shadow: 0 0 0 ${config.thickness}px ${config.color}, 0 0 10px rgba(255, 255, 0, 0.5) !important;
            border-radius: 3px !important;
          }
        `;
        break;
        
      case 'glow':
        css = `
          *:focus,
          *:focus-visible {
            outline: none !important;
            box-shadow: 0 0 0 ${config.thickness}px ${config.color}, 0 0 20px ${config.color} !important;
            border-radius: 3px !important;
          }
        `;
        break;
        
      case 'thick':
        css = `
          *:focus,
          *:focus-visible {
            outline: ${config.thickness * 2}px solid ${config.color} !important;
            outline-offset: 3px !important;
            border-radius: 3px !important;
          }
        `;
        break;
        
      case 'dotted':
        css = `
          *:focus,
          *:focus-visible {
            outline: ${config.thickness}px dotted ${config.color} !important;
            outline-offset: 2px !important;
            border-radius: 3px !important;
          }
        `;
        break;
        
      default: // 'standard'
        css = `
          *:focus,
          *:focus-visible {
            outline: ${config.thickness}px solid ${config.color} !important;
            outline-offset: 2px !important;
          }
        `;
        break;
    }
    
    // Enhanced focus for specific elements
    css += `
      button:focus,
      input:focus,
      textarea:focus,
      select:focus,
      a:focus,
      [role="button"]:focus,
      [tabindex]:focus {
        ${css.includes('outline: none') ? '' : 'outline: ' + config.thickness + 'px solid ' + config.color + ' !important;'}
        ${css.includes('outline: none') ? '' : 'outline-offset: 2px !important;'}
        border-radius: 3px !important;
      }
      
      /* Focus enhancement for better visibility */
      .accessify-focus-enhanced *:focus,
      .accessify-focus-enhanced *:focus-visible {
        transform: scale(1.02) !important;
        transition: all 0.2s ease !important;
        z-index: 9999 !important;
      }
    `;
    
    this._addStyle('focus-indicators', css);
  }

  /**
   * Add style to the style element
   */
  _addStyle(name, css) {
    this.currentStyles.set(name, css);
    this._updateStyleElement();
  }

  /**
   * Remove style from the style element
   */
  _removeStyle(name) {
    this.currentStyles.delete(name);
    this._updateStyleElement();
  }

  /**
   * Update the style element with all current styles
   */
  _updateStyleElement() {
    if (!this.styleElement) {
      return;
    }

    const allStyles = Array.from(this.currentStyles.values()).join('\n');
    this.styleElement.textContent = allStyles;
  }

  /**
   * Store original styles
   */
  _storeOriginalStyles() {
    // Store original font size
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    this.originalStyles.set('html-font-size', htmlElement.style.fontSize);
    this.originalStyles.set('body-font-size', bodyElement.style.fontSize);
    
    // Store original cursor
    this.originalStyles.set('cursor', document.body.style.cursor);
  }

  /**
   * Restore original styles
   */
  _restoreOriginalStyles() {
    // Restore original font size
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    htmlElement.style.fontSize = this.originalStyles.get('html-font-size') || '';
    bodyElement.style.fontSize = this.originalStyles.get('body-font-size') || '';
    
    // Restore original cursor
    document.body.style.cursor = this.originalStyles.get('cursor') || '';
  }

  /**
   * Apply initial configuration
   */
  async _applyInitialConfiguration() {
    const config = this.accessify.configManager.get('visual');
    
    // Apply text size
    if (config.textSize.enabled) {
      this._applyTextSize(config.textSize.current);
    }
    
    // Apply contrast mode
    if (config.contrast.enabled) {
      this._applyContrastMode(config.contrast.current);
    }
    
    // Apply brightness
    if (config.brightness.enabled) {
      this._applyBrightness(config.brightness.current);
    }
    
    // Apply theme
    if (config.themes.enabled) {
      this._applyTheme(config.themes.current);
    }
    
    // Apply cursor
    if (config.cursors.enabled) {
      this._applyCursor(config.cursors.current);
    }
    
    // Apply focus indicators
    if (config.focusIndicators.enabled) {
      this._applyFocusIndicators(config.focusIndicators);
    }
  }

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Listen for configuration changes
    this.accessify.on('configUpdated', (newConfig) => {
      if (newConfig.visual) {
        this._applyInitialConfiguration();
      }
    });
    
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.altKey) {
        switch (event.key) {
          case '+':
          case '=':
            event.preventDefault();
            this.increaseTextSize();
            break;
          case '-':
            event.preventDefault();
            this.decreaseTextSize();
            break;
          case 'c':
            event.preventDefault();
            this.toggleContrastMode();
            break;
        }
      }
    });
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    // Remove keyboard event listeners
    document.removeEventListener('keydown', this._handleKeydown);
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    const config = this.accessify.configManager.get('visual');
    const enabledFeatures = [];
    
    if (config.textSize.enabled) enabledFeatures.push('textSizeAdjustment');
    if (config.contrast.enabled) enabledFeatures.push('highContrast');
    if (config.themes.enabled) enabledFeatures.push('colorThemes');
    if (config.cursors.enabled) enabledFeatures.push('customCursors');
    if (config.focusIndicators.enabled) enabledFeatures.push('focusIndicators');
    
    return {
      wcag: {
        level: 'AA',
        compliant: enabledFeatures.length >= 3,
        score: Math.round((enabledFeatures.length / 5) * 100)
      },
      israeliStandard: {
        compliant: enabledFeatures.includes('textSizeAdjustment') && 
                   enabledFeatures.includes('highContrast'),
        score: Math.round((enabledFeatures.length / 5) * 100)
      },
      features: enabledFeatures
    };
  }

  /**
   * Get current visual settings
   */
  getCurrentSettings() {
    return {
      textSize: this.accessify.configManager.get('visual.textSize.current'),
      contrast: this.accessify.configManager.get('visual.contrast.current'),
      brightness: this.accessify.configManager.get('visual.brightness.current'),
      theme: this.accessify.configManager.get('visual.themes.current'),
      cursor: this.accessify.configManager.get('visual.cursors.current'),
      focusIndicators: this.accessify.configManager.get('visual.focusIndicators')
    };
  }

  /**
   * Reset all visual settings to default
   */
  reset() {
    this.resetTextSize();
    this.setContrastMode('normal');
    this.setBrightness(1.0);
    this.setTheme('default');
    this.setCursor('default');
    
    this.accessify.emit('visualSettingsReset');
  }

  /**
   * Initialize automatic alt text generation
   */
  _initializeAltTextGeneration() {
    try {
      // Check if alt text generation is enabled
      const config = this.accessify.configManager.get('visual.altTextGeneration', { enabled: true });
      
      if (config.enabled) {
        this._generateAltTextForImages();
        this._observeNewImages();
        this.currentStyles.set('altTextGeneration', true);
        this.accessify.emit('altTextGenerationEnabled');
      }
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Alt text generation initialization', 'component');
    }
  }

  /**
   * Generate alt text for existing images
   */
  _generateAltTextForImages() {
    const images = document.querySelectorAll('img:not([alt])');
    
    images.forEach(img => {
      this._generateAltTextForImage(img);
    });
  }

  /**
   * Generate alt text for a specific image
   */
  _generateAltTextForImage(img) {
    try {
      // Skip if already has alt text
      if (img.getAttribute('alt') !== null) {
        return;
      }

      // Generate alt text based on image properties
      let altText = '';

      // Use filename if available
      const src = img.src || img.getAttribute('src');
      if (src) {
        const filename = src.split('/').pop().split('.')[0];
        altText = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      // Use title attribute if available
      if (img.title) {
        altText = img.title;
      }

      // Use aria-label if available
      if (img.getAttribute('aria-label')) {
        altText = img.getAttribute('aria-label');
      }

      // Use data-alt if available
      if (img.getAttribute('data-alt')) {
        altText = img.getAttribute('data-alt');
      }

      // Fallback to generic description
      if (!altText) {
        altText = 'Image';
      }

      // Set the alt text
      img.setAttribute('alt', altText);
      img.setAttribute('data-accessify-generated', 'true');

      this.accessify.emit('altTextGenerated', { img, altText });
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Alt text generation for image', 'component');
    }
  }

  /**
   * Observe for new images and generate alt text
   */
  _observeNewImages() {
    if (typeof MutationObserver !== 'undefined') {
      this.imageObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is an image
              if (node.tagName === 'IMG') {
                this._generateAltTextForImage(node);
              }
              
              // Check for images within the added node
              const images = node.querySelectorAll && node.querySelectorAll('img');
              if (images) {
                images.forEach(img => this._generateAltTextForImage(img));
              }
            }
          });
        });
      });

      this.imageObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Validate color contrast ratio
   */
  validateColorContrast(foreground, background) {
    try {
      // Convert colors to RGB
      const fgRgb = this._hexToRgb(foreground);
      const bgRgb = this._hexToRgb(background);
      
      if (!fgRgb || !bgRgb) {
        return { ratio: 0, level: 'fail', message: 'Invalid color format' };
      }

      // Calculate relative luminance
      const fgLuminance = this._getRelativeLuminance(fgRgb);
      const bgLuminance = this._getRelativeLuminance(bgRgb);

      // Calculate contrast ratio
      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);
      const ratio = (lighter + 0.05) / (darker + 0.05);

      // Determine compliance level
      let level, message;
      if (ratio >= 7) {
        level = 'AAA';
        message = 'Excellent contrast (AAA)';
      } else if (ratio >= 4.5) {
        level = 'AA';
        message = 'Good contrast (AA)';
      } else if (ratio >= 3) {
        level = 'AA Large';
        message = 'Acceptable for large text (AA Large)';
      } else {
        level = 'fail';
        message = 'Insufficient contrast';
      }

      return { ratio: Math.round(ratio * 100) / 100, level, message };
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Color contrast validation', 'component');
      return { ratio: 0, level: 'error', message: 'Error calculating contrast' };
    }
  }

  /**
   * Convert hex color to RGB
   */
  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calculate relative luminance
   */
  _getRelativeLuminance(rgb) {
    const { r, g, b } = rgb;
    
    // Convert to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    // Apply gamma correction
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Detect reduced motion preferences
   */
  detectReducedMotion() {
    try {
      if (window.matchMedia) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        return prefersReducedMotion.matches;
      }
      return false;
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Reduced motion detection', 'component');
      return false;
    }
  }

  /**
   * Apply reduced motion settings
   */
  applyReducedMotion() {
    const prefersReducedMotion = this.detectReducedMotion();
    
    if (prefersReducedMotion) {
      this.styleElement.textContent += `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      this.currentStyles.set('reducedMotion', true);
      this.accessify.emit('reducedMotionApplied');
    }
  }

  /**
   * Stop all animations
   */
  stopAnimations() {
    const css = `
      *, *::before, *::after {
        animation-play-state: paused !important;
        transition: none !important;
        transform: none !important;
      }
      
      /* Pause specific animation types */
      .accessify-paused * {
        animation-play-state: paused !important;
      }
      
      /* Stop scrolling animations */
      html {
        scroll-behavior: auto !important;
      }
      
      /* Stop video animations if any */
      video, iframe {
        animation-play-state: paused !important;
      }
      
      /* Stop gif animations */
      img[src$=".gif"] {
        animation-play-state: paused !important;
      }
    `;
    
    this._addStyle('stop-animations', css);
    this.accessify.emit('animationsStopped');
  }

  /**
   * Resume animations
   */
  resumeAnimations() {
    this._removeStyle('stop-animations');
    this.accessify.emit('animationsResumed');
  }

  /**
   * Toggle animations
   */
  toggleAnimations() {
    if (this.currentStyles.has('stop-animations')) {
      this.resumeAnimations();
    } else {
      this.stopAnimations();
    }
  }
}

/**
 * Navigation Accessibility Component
 * Handles keyboard navigation, focus management, and skip links
 */

class NavigationAccessibility {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.focusTrap = null;
    this.skipLinks = [];
    this.keyboardShortcuts = new Map();
    this.focusHistory = [];
    this.tabOrder = [];
  }

  /**
   * Initialize navigation accessibility features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Set up keyboard navigation
      this._setupKeyboardNavigation();
      
      // Create skip links
      this._createSkipLinks();
      
      // Set up focus management
      this._setupFocusManagement();
      
      // Set up keyboard shortcuts
      this._setupKeyboardShortcuts();
      
      // Set up tab order optimization
      this._setupTabOrder();

      this.isInitialized = true;
      this.accessify.emit('navigationAccessibilityInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Navigation accessibility initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy navigation accessibility features
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Remove event listeners
      this._removeEventListeners();
      
      // Remove skip links
      this._removeSkipLinks();
      
      // Clear focus trap
      this._clearFocusTrap();

      this.isInitialized = false;
      this.accessify.emit('navigationAccessibilityDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Navigation accessibility destruction', 'component');
    }
  }

  /**
   * Set up keyboard navigation
   */
  _setupKeyboardNavigation() {
    // Add keyboard event listeners
    document.addEventListener('keydown', this._handleKeydown.bind(this));
    document.addEventListener('keyup', this._handleKeyup.bind(this));
    
    // Add focus event listeners
    document.addEventListener('focusin', this._handleFocusIn.bind(this));
    document.addEventListener('focusout', this._handleFocusOut.bind(this));
  }

  /**
   * Handle keydown events
   */
  _handleKeydown(event) {
    const config = this.accessify.configManager.get('navigation.keyboard.shortcuts');
    
    if (!config.enabled) {
      return;
    }

    // Check for keyboard shortcuts
    const shortcut = this._getShortcutKey(event);
    if (this.keyboardShortcuts.has(shortcut)) {
      event.preventDefault();
      this.keyboardShortcuts.get(shortcut)();
      return;
    }

    // Handle special navigation keys
    switch (event.key) {
      case 'Tab':
        this._handleTabNavigation(event);
        break;
      case 'Escape':
        this._handleEscapeKey(event);
        break;
      case 'Enter':
      case ' ':
        this._handleActivationKey(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this._handleArrowKeys(event);
        break;
    }
  }

  /**
   * Handle keyup events
   */
  _handleKeyup(event) {
    // Handle keyup events if needed
  }

  /**
   * Handle focus in events
   */
  _handleFocusIn(event) {
    // Add to focus history
    this.focusHistory.push(event.target);
    
    // Limit focus history size
    if (this.focusHistory.length > 10) {
      this.focusHistory.shift();
    }
    
    // Emit focus event
    this.accessify.emit('focusIn', event.target);
  }

  /**
   * Handle focus out events
   */
  _handleFocusOut(event) {
    this.accessify.emit('focusOut', event.target);
  }

  /**
   * Handle tab navigation
   */
  _handleTabNavigation(event) {
    const config = this.accessify.configManager.get('navigation.focus');
    
    if (!config.enabled) {
      return;
    }

    // Check if we're in a focus trap
    if (this.focusTrap) {
      this._handleFocusTrap(event);
    }
    
    // Optimize tab order if enabled
    if (config.order === 'logical') {
      this._optimizeTabOrder(event);
    }
  }

  /**
   * Handle escape key
   */
  _handleEscapeKey(event) {
    // Close any open modals or menus
    this._closeOpenElements();
    
    // Return focus to previous element
    this._returnFocus();
  }

  /**
   * Handle activation keys (Enter, Space)
   */
  _handleActivationKey(event) {
    const target = event.target;
    
    // Handle different element types
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      // Button activation is handled by default
      return;
    }
    
    if (target.tagName === 'A' && target.getAttribute('href')) {
      // Link activation is handled by default
      return;
    }
    
    // Handle custom interactive elements
    if (target.getAttribute('tabindex') === '0') {
      target.click();
    }
  }

  /**
   * Handle arrow keys
   */
  _handleArrowKeys(event) {
    const target = event.target;
    
    // Handle arrow key navigation for custom components
    if (target.getAttribute('role') === 'menu' || 
        target.getAttribute('role') === 'menubar' ||
        target.getAttribute('role') === 'tablist') {
      this._handleArrowKeyNavigation(event);
    }
  }

  /**
   * Handle arrow key navigation
   */
  _handleArrowKeyNavigation(event) {
    const target = event.target;
    const role = target.getAttribute('role');
    const items = target.querySelectorAll(`[role="${role === 'tablist' ? 'tab' : 'menuitem'}"], button, a`);
    const currentIndex = Array.from(items).indexOf(target);
    
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
    }
    
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  }

  /**
   * Create skip links
   */
  _createSkipLinks() {
    const config = this.accessify.configManager.get('navigation.skipLinks');
    
    if (!config.enabled) {
      return;
    }

    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'accessify-skip-links';
    skipLinksContainer.setAttribute('aria-label', 'Skip navigation links');
    
    // Create skip to content link
    const skipToContent = document.createElement('a');
    skipToContent.href = '#main-content';
    skipToContent.textContent = 'Skip to main content';
    skipToContent.className = 'accessify-skip-link';
    skipToContent.addEventListener('click', this._handleSkipLink.bind(this));
    
    // Create skip to navigation link
    const skipToNav = document.createElement('a');
    skipToNav.href = '#main-navigation';
    skipToNav.textContent = 'Skip to navigation';
    skipToNav.className = 'accessify-skip-link';
    skipToNav.addEventListener('click', this._handleSkipLink.bind(this));
    
    skipLinksContainer.appendChild(skipToContent);
    skipLinksContainer.appendChild(skipToNav);
    
    // Add to page
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
    
    // Store references
    this.skipLinks.push(skipToContent, skipToNav);
    
    // Add CSS for skip links
    this._addSkipLinksCSS();
  }

  /**
   * Handle skip link clicks
   */
  _handleSkipLink(event) {
    event.preventDefault();
    
    const targetId = event.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Add CSS for skip links
   */
  _addSkipLinksCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-skip-links {
        position: absolute;
        top: -100px;
        left: 0;
        z-index: 10000;
      }
      
      .accessify-skip-link {
        position: absolute;
        top: 0;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 0 0 4px 0;
        font-weight: bold;
        transition: top 0.3s ease;
      }
      
      .accessify-skip-link:focus {
        top: 0;
        outline: 2px solid #fff;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove skip links
   */
  _removeSkipLinks() {
    this.skipLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
    this.skipLinks = [];
  }

  /**
   * Set up focus management
   */
  _setupFocusManagement() {
    const config = this.accessify.configManager.get('navigation.focus');
    
    if (!config.enabled) {
      return;
    }

    // Set up focus trap for modals
    this._setupFocusTrap();
    
    // Set up focus restoration
    this._setupFocusRestoration();
  }

  /**
   * Set up focus trap
   */
  _setupFocusTrap() {
    // This will be implemented when modals are detected
  }

  /**
   * Handle focus trap
   */
  _handleFocusTrap(event) {
    if (!this.focusTrap) {
      return;
    }

    const trapElements = this.focusTrap.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (trapElements.length === 0) {
      return;
    }

    const firstElement = trapElements[0];
    const lastElement = trapElements[trapElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Set focus trap
   */
  setFocusTrap(element) {
    this.focusTrap = element;
    this.accessify.emit('focusTrapSet', element);
  }

  /**
   * Clear focus trap
   */
  _clearFocusTrap() {
    this.focusTrap = null;
    this.accessify.emit('focusTrapCleared');
  }

  /**
   * Set up focus restoration
   */
  _setupFocusRestoration() {
    // Store focus when page loads
    window.addEventListener('beforeunload', () => {
      if (document.activeElement) {
        sessionStorage.setItem('accessify-last-focus', document.activeElement.id || '');
      }
    });
    
    // Restore focus when page loads
    window.addEventListener('load', () => {
      const lastFocusId = sessionStorage.getItem('accessify-last-focus');
      if (lastFocusId) {
        const element = document.getElementById(lastFocusId);
        if (element) {
          element.focus();
        }
      }
    });
  }

  /**
   * Set up keyboard shortcuts
   */
  _setupKeyboardShortcuts() {
    const config = this.accessify.configManager.get('navigation.keyboard.shortcuts');
    
    if (!config.enabled) {
      return;
    }

    // Register default shortcuts
    this.registerShortcut(config.skipToContent, () => {
      this._skipToContent();
    });
    
    this.registerShortcut(config.toggleMenu, () => {
      this._toggleMenu();
    });
    
    this.registerShortcut(config.increaseTextSize, () => {
      this.accessify.visual.increaseTextSize();
    });
    
    this.registerShortcut(config.decreaseTextSize, () => {
      this.accessify.visual.decreaseTextSize();
    });
    
    this.registerShortcut(config.toggleContrast, () => {
      this.accessify.visual.toggleContrastMode();
    });
    
    this.registerShortcut(config.toggleHighContrast, () => {
      this.accessify.visual.setContrastMode('high');
    });

    // Enhanced keyboard shortcuts
    this.registerShortcut('Alt+r', () => {
      if (this.accessify.readingGuide) {
        this.accessify.readingGuide.toggleReadingRuler();
      }
    });
    
    this.registerShortcut('Alt+h', () => {
      if (this.accessify.readingGuide) {
        this.accessify.readingGuide.toggleTextHighlighting();
      }
    });
    
    this.registerShortcut('Alt+a', () => {
      if (this.accessify.visual) {
        this.accessify.visual.toggleAnimations();
      }
    });
    
    this.registerShortcut('Alt+l', () => {
      this._toggleLinkUnderlining();
    });
    
    this.registerShortcut('Alt+f', () => {
      this._cycleFocusStyles();
    });
    
    this.registerShortcut('Alt+c', () => {
      this._cycleCursorStyles();
    });
    
    this.registerShortcut('Alt+s', () => {
      this._toggleScreenReaderAnnouncements();
    });
    
    this.registerShortcut('Alt+t', () => {
      this._toggleTabOrder();
    });
    
    this.registerShortcut('Alt+g', () => {
      this._toggleGridOverlay();
    });
  }

  /**
   * Register keyboard shortcut
   */
  registerShortcut(shortcut, callback) {
    this.keyboardShortcuts.set(shortcut, callback);
  }

  /**
   * Unregister keyboard shortcut
   */
  unregisterShortcut(shortcut) {
    this.keyboardShortcuts.delete(shortcut);
  }

  /**
   * Get shortcut key from event
   */
  _getShortcutKey(event) {
    const parts = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    
    parts.push(event.key);
    
    return parts.join('+');
  }

  /**
   * Set up tab order optimization
   */
  _setupTabOrder() {
    const config = this.accessify.configManager.get('navigation.focus');
    
    if (config.order === 'logical') {
      this._optimizeTabOrder();
    }
  }

  /**
   * Optimize tab order
   */
  _optimizeTabOrder(event) {
    // This is a simplified implementation
    // In a real implementation, you'd analyze the DOM structure
    // and ensure logical tab order
  }

  /**
   * Skip to content
   */
  _skipToContent() {
    const mainContent = document.querySelector('main, #main-content, [role="main"]');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Toggle menu
   */
  _toggleMenu() {
    const menu = document.querySelector('[role="menu"], .menu, #menu');
    if (menu) {
      const isOpen = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', !isOpen);
      
      if (!isOpen) {
        const firstMenuItem = menu.querySelector('button, a, [tabindex="0"]');
        if (firstMenuItem) {
          firstMenuItem.focus();
        }
      }
    }
  }

  /**
   * Close open elements
   */
  _closeOpenElements() {
    // Close any open modals, menus, or dropdowns
    const openElements = document.querySelectorAll('[aria-expanded="true"]');
    openElements.forEach(element => {
      element.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Return focus to previous element
   */
  _returnFocus() {
    if (this.focusHistory.length > 0) {
      const previousElement = this.focusHistory.pop();
      if (previousElement && previousElement.focus) {
        previousElement.focus();
      }
    }
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('keydown', this._handleKeydown);
    document.removeEventListener('keyup', this._handleKeyup);
    document.removeEventListener('focusin', this._handleFocusIn);
    document.removeEventListener('focusout', this._handleFocusOut);
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    const config = this.accessify.configManager.get('navigation');
    const enabledFeatures = [];
    
    if (config.keyboard.enabled) enabledFeatures.push('keyboardNavigation');
    if (config.focus.enabled) enabledFeatures.push('focusManagement');
    if (config.skipLinks.enabled) enabledFeatures.push('skipLinks');
    
    return {
      wcag: {
        level: 'AA',
        compliant: enabledFeatures.length >= 2,
        score: Math.round((enabledFeatures.length / 3) * 100)
      },
      israeliStandard: {
        compliant: enabledFeatures.includes('keyboardNavigation'),
        score: Math.round((enabledFeatures.length / 3) * 100)
      },
      features: enabledFeatures
    };
  }

  /**
   * Get current navigation settings
   */
  getCurrentSettings() {
    return {
      keyboard: this.accessify.configManager.get('navigation.keyboard'),
      focus: this.accessify.configManager.get('navigation.focus'),
      skipLinks: this.accessify.configManager.get('navigation.skipLinks')
    };
  }

  /**
   * Toggle link underlining
   */
  _toggleLinkUnderlining() {
    if (this.accessify.visual) {
      const currentStyle = this.accessify.configManager.get('visual.linkUnderlining.style');
      const styles = ['none', 'always', 'hover', 'enhanced', 'double'];
      const currentIndex = styles.indexOf(currentStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      this.accessify.visual.setLinkUnderlining(styles[nextIndex]);
    }
  }

  /**
   * Cycle through focus styles
   */
  _cycleFocusStyles() {
    if (this.accessify.visual) {
      const currentStyle = this.accessify.configManager.get('visual.focusIndicators.style');
      const styles = ['standard', 'highlight', 'glow', 'thick', 'dotted'];
      const currentIndex = styles.indexOf(currentStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      this.accessify.visual.setFocusIndicator(styles[nextIndex]);
    }
  }

  /**
   * Cycle through cursor styles
   */
  _cycleCursorStyles() {
    if (this.accessify.visual) {
      const currentStyle = this.accessify.configManager.get('visual.cursors.current');
      const styles = ['default', 'large', 'extra-large', 'high-contrast', 'crosshair', 'pointer-large', 'text-large'];
      const currentIndex = styles.indexOf(currentStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      this.accessify.visual.setCursor(styles[nextIndex]);
    }
  }

  /**
   * Toggle screen reader announcements
   */
  _toggleScreenReaderAnnouncements() {
    if (this.accessify.screenReader) {
      const isEnabled = this.accessify.configManager.get('screenReader.announcements.enabled');
      this.accessify.configManager.set('screenReader.announcements.enabled', !isEnabled);
      this.accessify.screenReader.announce(`Screen reader announcements ${!isEnabled ? 'enabled' : 'disabled'}`, 'polite', 'normal');
    }
  }

  /**
   * Toggle tab order visualization
   */
  _toggleTabOrder() {
    const isEnabled = this.accessify.configManager.get('navigation.focus.visualizeTabOrder');
    this.accessify.configManager.set('navigation.focus.visualizeTabOrder', !isEnabled);
    
    if (!isEnabled) {
      this._showTabOrder();
    } else {
      this._hideTabOrder();
    }
  }

  /**
   * Show tab order visualization
   */
  _showTabOrder() {
    const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach((element, index) => {
      if (!element.querySelector('.accessify-tab-order-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'accessify-tab-order-indicator';
        indicator.textContent = index + 1;
        indicator.style.cssText = `
          position: absolute;
          top: -5px;
          left: -5px;
          background: #ff0000;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          z-index: 10000;
          pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(indicator);
      }
    });
    
    this.accessify.emit('tabOrderShown');
  }

  /**
   * Hide tab order visualization
   */
  _hideTabOrder() {
    const indicators = document.querySelectorAll('.accessify-tab-order-indicator');
    indicators.forEach(indicator => {
      indicator.remove();
    });
    
    this.accessify.emit('tabOrderHidden');
  }

  /**
   * Toggle grid overlay
   */
  _toggleGridOverlay() {
    const isEnabled = this.accessify.configManager.get('navigation.gridOverlay.enabled');
    this.accessify.configManager.set('navigation.gridOverlay.enabled', !isEnabled);
    
    if (!isEnabled) {
      this._showGridOverlay();
    } else {
      this._hideGridOverlay();
    }
  }

  /**
   * Show grid overlay
   */
  _showGridOverlay() {
    if (!document.getElementById('accessify-grid-overlay')) {
      const gridOverlay = document.createElement('div');
      gridOverlay.id = 'accessify-grid-overlay';
      gridOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background-image: 
          linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.5;
      `;
      
      document.body.appendChild(gridOverlay);
    }
    
    this.accessify.emit('gridOverlayShown');
  }

  /**
   * Hide grid overlay
   */
  _hideGridOverlay() {
    const gridOverlay = document.getElementById('accessify-grid-overlay');
    if (gridOverlay) {
      gridOverlay.remove();
    }
    
    this.accessify.emit('gridOverlayHidden');
  }
}

/**
 * Reading Accessibility Component
 * Handles text-to-speech, fonts, spacing, and reading guides
 */

class ReadingAccessibility {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.speechSynthesis = null;
    this.currentUtterance = null;
    this.readingGuide = null;
    this.textHighlighter = null;
    this.fontLoader = null;
  }

  /**
   * Initialize reading accessibility features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Initialize speech synthesis
      this._initializeSpeechSynthesis();
      
      // Set up font loading
      this._setupFontLoading();
      
      // Set up text spacing
      this._setupTextSpacing();
      
      // Set up reading guides
      this._setupReadingGuides();
      
      // Set up text highlighting
      this._setupTextHighlighting();

      this.isInitialized = true;
      this.accessify.emit('readingAccessibilityInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Reading accessibility initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy reading accessibility features
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Stop speech synthesis
      this._stopSpeech();
      
      // Remove reading guides
      this._removeReadingGuides();
      
      // Remove text highlighting
      this._removeTextHighlighting();
      
      // Remove custom fonts
      this._removeCustomFonts();

      this.isInitialized = false;
      this.accessify.emit('readingAccessibilityDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Reading accessibility destruction', 'component');
    }
  }

  /**
   * Initialize speech synthesis
   */
  _initializeSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    this.speechSynthesis = window.speechSynthesis;
    
    // Set up speech synthesis event listeners
    this.speechSynthesis.addEventListener('voiceschanged', () => {
      this.accessify.emit('voicesChanged', this.getAvailableVoices());
    });
  }

  /**
   * Speak text
   */
  speak(text, options = {}) {
    if (!this.speechSynthesis) {
      throw new Error('Speech synthesis not available');
    }

    // Stop current speech
    this._stopSpeech();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    const config = this.accessify.configManager.get('reading.textToSpeech');
    utterance.rate = options.rate || config.rate;
    utterance.pitch = options.pitch || config.pitch;
    utterance.volume = options.volume || config.volume;
    
    // Set voice
    if (options.voice || config.voice !== 'auto') {
      const voice = this._getVoice(options.voice || config.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Set up event listeners
    utterance.onstart = () => {
      this.accessify.emit('speechStarted', utterance);
    };
    
    utterance.onend = () => {
      this.accessify.emit('speechEnded', utterance);
      this.currentUtterance = null;
    };
    
    utterance.onerror = (event) => {
      this.accessify.emit('speechError', event);
      this.currentUtterance = null;
    };

    // Speak
    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
  }

  /**
   * Stop speech
   */
  _stopSpeech() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Pause speech
   */
  pauseSpeech() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.pause();
    }
  }

  /**
   * Resume speech
   */
  resumeSpeech() {
    if (this.speechSynthesis && this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    }
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    if (!this.speechSynthesis) {
      return [];
    }

    return this.speechSynthesis.getVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService
    }));
  }

  /**
   * Get voice by name or language
   */
  _getVoice(voiceName) {
    if (!this.speechSynthesis) {
      return null;
    }

    const voices = this.speechSynthesis.getVoices();
    
    // Try to find by name
    let voice = voices.find(v => v.name === voiceName);
    
    // Try to find by language
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(voiceName));
    }
    
    // Try to find default voice
    if (!voice) {
      voice = voices.find(v => v.default);
    }
    
    return voice;
  }

  /**
   * Set up font loading
   */
  _setupFontLoading() {
    const config = this.accessify.configManager.get('reading.fonts');
    
    if (!config.enabled) {
      return;
    }

    // Load dyslexia-friendly fonts
    if (config.dyslexia) {
      this._loadDyslexiaFonts();
    }
    
    // Apply current font
    this._applyFont(config.current);
  }

  /**
   * Load dyslexia-friendly fonts
   */
  _loadDyslexiaFonts() {
    const fonts = [
      {
        name: 'OpenDyslexic',
        url: 'https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap'
      },
      {
        name: 'Lexend',
        url: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap'
      },
      {
        name: 'Atkinson Hyperlegible',
        url: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap'
      }
    ];

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = font.url;
      link.onload = () => {
        this.accessify.emit('fontLoaded', font.name);
      };
      document.head.appendChild(link);
    });
  }

  /**
   * Apply font
   */
  _applyFont(fontName) {
    const config = this.accessify.configManager.get('reading.fonts');
    
    if (!config.enabled) {
      return;
    }

    let fontFamily = '';
    
    switch (fontName) {
      case 'opendyslexic':
        fontFamily = 'OpenDyslexic, sans-serif';
        break;
      case 'lexend':
        fontFamily = 'Lexend, sans-serif';
        break;
      case 'atkinson':
        fontFamily = 'Atkinson Hyperlegible, sans-serif';
        break;
      case 'default':
      default:
        fontFamily = 'inherit';
        break;
    }

    const css = `
      * {
        font-family: ${fontFamily} !important;
      }
    `;
    
    this._addStyle('dyslexia-font', css);
  }

  /**
   * Set font
   */
  setFont(fontName) {
    const availableFonts = this.accessify.configManager.get('reading.fonts.available');
    
    if (!availableFonts.includes(fontName)) {
      throw new Error(`Invalid font: ${fontName}`);
    }

    this.accessify.configManager.set('reading.fonts.current', fontName);
    this._applyFont(fontName);
    
    this.accessify.emit('fontChanged', fontName);
  }

  /**
   * Set up text spacing
   */
  _setupTextSpacing() {
    const config = this.accessify.configManager.get('reading.spacing');
    
    if (!config.enabled) {
      return;
    }

    this._applyTextSpacing(config);
  }

  /**
   * Apply text spacing
   */
  _applyTextSpacing(config) {
    const css = `
      * {
        line-height: ${config.lineHeight} !important;
        letter-spacing: ${config.letterSpacing} !important;
        word-spacing: ${config.wordSpacing} !important;
      }
    `;
    
    this._addStyle('text-spacing', css);
  }

  /**
   * Set line height
   */
  setLineHeight(height) {
    const config = this.accessify.configManager.get('reading.spacing');
    this.accessify.configManager.set('reading.spacing.lineHeight', height);
    this._applyTextSpacing({ ...config, lineHeight: height });
    
    this.accessify.emit('lineHeightChanged', height);
  }

  /**
   * Set letter spacing
   */
  setLetterSpacing(spacing) {
    const config = this.accessify.configManager.get('reading.spacing');
    this.accessify.configManager.set('reading.spacing.letterSpacing', spacing);
    this._applyTextSpacing({ ...config, letterSpacing: spacing });
    
    this.accessify.emit('letterSpacingChanged', spacing);
  }

  /**
   * Set word spacing
   */
  setWordSpacing(spacing) {
    const config = this.accessify.configManager.get('reading.spacing');
    this.accessify.configManager.set('reading.spacing.wordSpacing', spacing);
    this._applyTextSpacing({ ...config, wordSpacing: spacing });
    
    this.accessify.emit('wordSpacingChanged', spacing);
  }

  /**
   * Set up reading guides
   */
  _setupReadingGuides() {
    const config = this.accessify.configManager.get('reading.guides');
    
    if (!config.enabled) {
      return;
    }

    if (config.readingRuler) {
      this._createReadingRuler();
    }
    
    if (config.textHighlighting) {
      this._setupTextHighlighting();
    }
  }

  /**
   * Create reading ruler
   */
  _createReadingRuler() {
    this.readingGuide = document.createElement('div');
    this.readingGuide.className = 'accessify-reading-ruler';
    this.readingGuide.setAttribute('aria-hidden', 'true');
    
    // Add CSS for reading ruler
    this._addReadingRulerCSS();
    
    // Add to page
    document.body.appendChild(this.readingGuide);
    
    // Set up mouse tracking
    document.addEventListener('mousemove', this._handleReadingRulerMouseMove.bind(this));
  }

  /**
   * Handle reading ruler mouse move
   */
  _handleReadingRulerMouseMove(event) {
    if (!this.readingGuide) {
      return;
    }

    this.readingGuide.style.top = `${event.clientY - 10}px`;
    this.readingGuide.style.left = '0';
    this.readingGuide.style.width = '100%';
  }

  /**
   * Add CSS for reading ruler
   */
  _addReadingRulerCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-reading-ruler {
        position: fixed;
        height: 2px;
        background: #ff0000;
        opacity: 0.7;
        pointer-events: none;
        z-index: 10000;
        transition: top 0.1s ease;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Set up text highlighting
   */
  _setupTextHighlighting() {
    this.textHighlighter = document.createElement('div');
    this.textHighlighter.className = 'accessify-text-highlighter';
    this.textHighlighter.setAttribute('aria-hidden', 'true');
    
    // Add CSS for text highlighter
    this._addTextHighlighterCSS();
    
    // Add to page
    document.body.appendChild(this.textHighlighter);
    
    // Set up text selection
    document.addEventListener('mouseup', this._handleTextSelection.bind(this));
  }

  /**
   * Handle text selection
   */
  _handleTextSelection(event) {
    if (!this.textHighlighter) {
      return;
    }

    const selection = window.getSelection();
    if (selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      this.textHighlighter.style.top = `${rect.top}px`;
      this.textHighlighter.style.left = `${rect.left}px`;
      this.textHighlighter.style.width = `${rect.width}px`;
      this.textHighlighter.style.height = `${rect.height}px`;
    }
  }

  /**
   * Add CSS for text highlighter
   */
  _addTextHighlighterCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-text-highlighter {
        position: fixed;
        background: rgba(255, 255, 0, 0.3);
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove reading guides
   */
  _removeReadingGuides() {
    if (this.readingGuide && this.readingGuide.parentNode) {
      this.readingGuide.parentNode.removeChild(this.readingGuide);
      this.readingGuide = null;
    }
    
    if (this.textHighlighter && this.textHighlighter.parentNode) {
      this.textHighlighter.parentNode.removeChild(this.textHighlighter);
      this.textHighlighter = null;
    }
  }

  /**
   * Remove text highlighting
   */
  _removeTextHighlighting() {
    // Remove text selection
    window.getSelection().removeAllRanges();
  }

  /**
   * Remove custom fonts
   */
  _removeCustomFonts() {
    // Remove font styles
    this._removeStyle('dyslexia-font');
  }

  /**
   * Add style to the style element
   */
  _addStyle(name, css) {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'accessify-reading-styles';
      document.head.appendChild(this.styleElement);
    }
    
    this.currentStyles = this.currentStyles || new Map();
    this.currentStyles.set(name, css);
    this._updateStyleElement();
  }

  /**
   * Remove style from the style element
   */
  _removeStyle(name) {
    if (this.currentStyles) {
      this.currentStyles.delete(name);
      this._updateStyleElement();
    }
  }

  /**
   * Update the style element with all current styles
   */
  _updateStyleElement() {
    if (!this.styleElement || !this.currentStyles) {
      return;
    }

    const allStyles = Array.from(this.currentStyles.values()).join('\n');
    this.styleElement.textContent = allStyles;
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    const config = this.accessify.configManager.get('reading');
    const enabledFeatures = [];
    
    if (config.textToSpeech.enabled) enabledFeatures.push('textToSpeech');
    if (config.fonts.enabled) enabledFeatures.push('dyslexiaFonts');
    if (config.spacing.enabled) enabledFeatures.push('textSpacing');
    if (config.guides.enabled) enabledFeatures.push('readingGuides');
    
    return {
      wcag: {
        level: 'AA',
        compliant: enabledFeatures.length >= 2,
        score: Math.round((enabledFeatures.length / 4) * 100)
      },
      israeliStandard: {
        compliant: enabledFeatures.includes('textToSpeech') || 
                   enabledFeatures.includes('dyslexiaFonts'),
        score: Math.round((enabledFeatures.length / 4) * 100)
      },
      features: enabledFeatures
    };
  }

  /**
   * Get current reading settings
   */
  getCurrentSettings() {
    return {
      textToSpeech: this.accessify.configManager.get('reading.textToSpeech'),
      fonts: this.accessify.configManager.get('reading.fonts'),
      spacing: this.accessify.configManager.get('reading.spacing'),
      guides: this.accessify.configManager.get('reading.guides')
    };
  }

  /**
   * Reset all reading settings to default
   */
  reset() {
    this._stopSpeech();
    this.setFont('default');
    this.setLineHeight(1.5);
    this.setLetterSpacing('normal');
    this.setWordSpacing('normal');
    
    this.accessify.emit('readingSettingsReset');
  }
}

/**
 * Motor Accessibility Component
 * Handles large targets, gestures, voice commands, and motion control
 */

class MotorAccessibility {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.voiceRecognition = null;
    this.gestureRecognizer = null;
    this.motionSensor = null;
    this.targetEnlarger = null;
    this.interactionDelays = new Map();
  }

  /**
   * Initialize motor accessibility features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Set up large targets
      this._setupLargeTargets();
      
      // Set up gesture alternatives
      this._setupGestureAlternatives();
      
      // Set up voice commands
      this._setupVoiceCommands();
      
      // Set up motion control
      this._setupMotionControl();
      
      // Set up interaction delays
      this._setupInteractionDelays();

      this.isInitialized = true;
      this.accessify.emit('motorAccessibilityInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Motor accessibility initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy motor accessibility features
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Stop voice recognition
      this._stopVoiceRecognition();
      
      // Remove gesture recognition
      this._removeGestureRecognition();
      
      // Remove motion sensor
      this._removeMotionSensor();
      
      // Remove large targets
      this._removeLargeTargets();

      this.isInitialized = false;
      this.accessify.emit('motorAccessibilityDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Motor accessibility destruction', 'component');
    }
  }

  /**
   * Set up large targets
   */
  _setupLargeTargets() {
    const config = this.accessify.configManager.get('motor.targets');
    
    if (!config.enabled) {
      return;
    }

    // Create target enlarger
    this.targetEnlarger = document.createElement('div');
    this.targetEnlarger.className = 'accessify-target-enlarger';
    this.targetEnlarger.setAttribute('aria-hidden', 'true');
    
    // Add CSS for target enlarger
    this._addTargetEnlargerCSS(config);
    
    // Add to page
    document.body.appendChild(this.targetEnlarger);
    
    // Set up hover tracking
    document.addEventListener('mouseover', this._handleTargetHover.bind(this));
    document.addEventListener('mouseout', this._handleTargetOut.bind(this));
  }

  /**
   * Handle target hover
   */
  _handleTargetHover(event) {
    if (!this.targetEnlarger) {
      return;
    }

    const target = event.target;
    
    // Check if target is interactive
    if (this._isInteractiveElement(target)) {
      const rect = target.getBoundingClientRect();
      const minSize = this.accessify.configManager.get('motor.targets.minSize');
      const padding = this.accessify.configManager.get('motor.targets.padding');
      
      // Calculate enlarged size
      const enlargedWidth = Math.max(rect.width, minSize) + (padding * 2);
      const enlargedHeight = Math.max(rect.height, minSize) + (padding * 2);
      
      // Position enlarger
      this.targetEnlarger.style.top = `${rect.top - padding}px`;
      this.targetEnlarger.style.left = `${rect.left - padding}px`;
      this.targetEnlarger.style.width = `${enlargedWidth}px`;
      this.targetEnlarger.style.height = `${enlargedHeight}px`;
      this.targetEnlarger.style.display = 'block';
    }
  }

  /**
   * Handle target out
   */
  _handleTargetOut(event) {
    if (!this.targetEnlarger) {
      return;
    }

    this.targetEnlarger.style.display = 'none';
  }

  /**
   * Check if element is interactive
   */
  _isInteractiveElement(element) {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio'];
    
    return interactiveTags.includes(element.tagName.toLowerCase()) ||
           interactiveRoles.includes(element.getAttribute('role')) ||
           element.getAttribute('tabindex') === '0';
  }

  /**
   * Add CSS for target enlarger
   */
  _addTargetEnlargerCSS(config) {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-target-enlarger {
        position: fixed;
        border: 2px solid #0066cc;
        background: rgba(0, 102, 204, 0.1);
        pointer-events: none;
        z-index: 10000;
        display: none;
        transition: all 0.2s ease;
        border-radius: 4px;
      }
      
      .accessify-target-enlarger::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 1px solid rgba(0, 102, 204, 0.3);
        border-radius: 6px;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove large targets
   */
  _removeLargeTargets() {
    if (this.targetEnlarger && this.targetEnlarger.parentNode) {
      this.targetEnlarger.parentNode.removeChild(this.targetEnlarger);
      this.targetEnlarger = null;
    }
  }

  /**
   * Set up gesture alternatives
   */
  _setupGestureAlternatives() {
    const config = this.accessify.configManager.get('motor.gestures');
    
    if (!config.enabled) {
      return;
    }

    // Set up touch events
    this._setupTouchEvents();
    
    // Set up pointer events
    this._setupPointerEvents();
    
    // Set up gesture recognition
    this._setupGestureRecognition();
  }

  /**
   * Set up touch events
   */
  _setupTouchEvents() {
    document.addEventListener('touchstart', this._handleTouchStart.bind(this));
    document.addEventListener('touchend', this._handleTouchEnd.bind(this));
    document.addEventListener('touchmove', this._handleTouchMove.bind(this));
  }

  /**
   * Handle touch start
   */
  _handleTouchStart(event) {
    // Store touch start position
    this.touchStart = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      time: Date.now()
    };
  }

  /**
   * Handle touch end
   */
  _handleTouchEnd(event) {
    if (!this.touchStart) {
      return;
    }

    const touchEnd = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
      time: Date.now()
    };

    // Calculate gesture
    const gesture = this._calculateGesture(this.touchStart, touchEnd);
    
    if (gesture) {
      this._handleGesture(gesture);
    }

    this.touchStart = null;
  }

  /**
   * Handle touch move
   */
  _handleTouchMove(event) {
    // Handle touch move if needed
  }

  /**
   * Set up pointer events
   */
  _setupPointerEvents() {
    document.addEventListener('pointerdown', this._handlePointerDown.bind(this));
    document.addEventListener('pointerup', this._handlePointerUp.bind(this));
    document.addEventListener('pointermove', this._handlePointerMove.bind(this));
  }

  /**
   * Handle pointer down
   */
  _handlePointerDown(event) {
    // Store pointer start position
    this.pointerStart = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now()
    };
  }

  /**
   * Handle pointer up
   */
  _handlePointerUp(event) {
    if (!this.pointerStart) {
      return;
    }

    const pointerEnd = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now()
    };

    // Calculate gesture
    const gesture = this._calculateGesture(this.pointerStart, pointerEnd);
    
    if (gesture) {
      this._handleGesture(gesture);
    }

    this.pointerStart = null;
  }

  /**
   * Handle pointer move
   */
  _handlePointerMove(event) {
    // Handle pointer move if needed
  }

  /**
   * Set up gesture recognition
   */
  _setupGestureRecognition() {
    // This is a simplified implementation
    // In a real implementation, you'd use a gesture recognition library
  }

  /**
   * Calculate gesture from start and end points
   */
  _calculateGesture(start, end) {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const deltaTime = end.time - start.time;
    
    // Check for swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 50 && deltaTime < 500) {
        return { type: 'swipe', direction: 'right' };
      } else if (deltaX < -50 && deltaTime < 500) {
        return { type: 'swipe', direction: 'left' };
      }
    } else {
      if (deltaY > 50 && deltaTime < 500) {
        return { type: 'swipe', direction: 'down' };
      } else if (deltaY < -50 && deltaTime < 500) {
        return { type: 'swipe', direction: 'up' };
      }
    }
    
    // Check for tap gestures
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      return { type: 'tap' };
    }
    
    return null;
  }

  /**
   * Handle gesture
   */
  _handleGesture(gesture) {
    this.accessify.emit('gestureDetected', gesture);
    
    // Handle specific gestures
    switch (gesture.type) {
      case 'swipe':
        this._handleSwipeGesture(gesture);
        break;
      case 'tap':
        this._handleTapGesture(gesture);
        break;
    }
  }

  /**
   * Handle swipe gesture
   */
  _handleSwipeGesture(gesture) {
    // Handle swipe gestures
    switch (gesture.direction) {
      case 'left':
        // Go back
        if (window.history.length > 1) {
          window.history.back();
        }
        break;
      case 'right':
        // Go forward
        if (window.history.length > 1) {
          window.history.forward();
        }
        break;
      case 'up':
        // Scroll up
        window.scrollBy(0, -100);
        break;
      case 'down':
        // Scroll down
        window.scrollBy(0, 100);
        break;
    }
  }

  /**
   * Handle tap gesture
   */
  _handleTapGesture(gesture) {
    // Handle tap gestures
  }

  /**
   * Remove gesture recognition
   */
  _removeGestureRecognition() {
    // Remove event listeners
    document.removeEventListener('touchstart', this._handleTouchStart);
    document.removeEventListener('touchend', this._handleTouchEnd);
    document.removeEventListener('touchmove', this._handleTouchMove);
    document.removeEventListener('pointerdown', this._handlePointerDown);
    document.removeEventListener('pointerup', this._handlePointerUp);
    document.removeEventListener('pointermove', this._handlePointerMove);
  }

  /**
   * Set up voice commands
   */
  _setupVoiceCommands() {
    const config = this.accessify.configManager.get('motor.voice');
    
    if (!config.enabled) {
      return;
    }

    // Check for speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.voiceRecognition = new SpeechRecognition();
    
    // Configure speech recognition
    this.voiceRecognition.continuous = true;
    this.voiceRecognition.interimResults = false;
    this.voiceRecognition.lang = this.accessify.configManager.get('language', 'en-US');
    
    // Set up event listeners
    this.voiceRecognition.onstart = () => {
      this.accessify.emit('voiceRecognitionStarted');
    };
    
    this.voiceRecognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        this._handleVoiceCommand(result[0].transcript);
      }
    };
    
    this.voiceRecognition.onerror = (event) => {
      this.accessify.emit('voiceRecognitionError', event);
    };
    
    this.voiceRecognition.onend = () => {
      this.accessify.emit('voiceRecognitionEnded');
    };
  }

  /**
   * Handle voice command
   */
  _handleVoiceCommand(transcript) {
    const command = transcript.toLowerCase().trim();
    
    this.accessify.emit('voiceCommand', command);
    
    // Handle specific commands
    if (command.includes('scroll up')) {
      window.scrollBy(0, -100);
    } else if (command.includes('scroll down')) {
      window.scrollBy(0, 100);
    } else if (command.includes('go back')) {
      if (window.history.length > 1) {
        window.history.back();
      }
    } else if (command.includes('go forward')) {
      if (window.history.length > 1) {
        window.history.forward();
      }
    } else if (command.includes('increase text size')) {
      this.accessify.visual.increaseTextSize();
    } else if (command.includes('decrease text size')) {
      this.accessify.visual.decreaseTextSize();
    } else if (command.includes('toggle contrast')) {
      this.accessify.visual.toggleContrastMode();
    } else if (command.includes('speak')) {
      const text = document.body.textContent;
      this.accessify.reading.speak(text);
    }
  }

  /**
   * Start voice recognition
   */
  startVoiceRecognition() {
    if (this.voiceRecognition) {
      this.voiceRecognition.start();
    }
  }

  /**
   * Stop voice recognition
   */
  _stopVoiceRecognition() {
    if (this.voiceRecognition) {
      this.voiceRecognition.stop();
    }
  }

  /**
   * Set up motion control
   */
  _setupMotionControl() {
    const config = this.accessify.configManager.get('motor.motion');
    
    if (!config.enabled) {
      return;
    }

    // Check for reduced motion preference
    if (config.reduced && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._applyReducedMotion();
    }
    
    // Set up motion sensor
    this._setupMotionSensor();
  }

  /**
   * Apply reduced motion
   */
  _applyReducedMotion() {
    const css = `
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    
    this._addStyle('reduced-motion', css);
  }

  /**
   * Set up motion sensor
   */
  _setupMotionSensor() {
    // This is a simplified implementation
    // In a real implementation, you'd use device motion APIs
  }

  /**
   * Remove motion sensor
   */
  _removeMotionSensor() {
    // Remove motion sensor if implemented
  }

  /**
   * Set up interaction delays
   */
  _setupInteractionDelays() {
    const config = this.accessify.configManager.get('motor.delays');
    
    if (!config.enabled) {
      return;
    }

    // Set up hover delays
    if (config.hover > 0) {
      this._setupHoverDelays(config.hover);
    }
    
    // Set up interaction delays
    if (config.interaction > 0) {
      this._setupInteractionDelays(config.interaction);
    }
  }

  /**
   * Set up hover delays
   */
  _setupHoverDelays(delay) {
    // This is a simplified implementation
    // In a real implementation, you'd add delays to hover events
  }

  /**
   * Set up interaction delays
   */
  _setupInteractionDelays(delay) {
    // This is a simplified implementation
    // In a real implementation, you'd add delays to interaction events
  }

  /**
   * Add style to the style element
   */
  _addStyle(name, css) {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'accessify-motor-styles';
      document.head.appendChild(this.styleElement);
    }
    
    this.currentStyles = this.currentStyles || new Map();
    this.currentStyles.set(name, css);
    this._updateStyleElement();
  }

  /**
   * Update the style element with all current styles
   */
  _updateStyleElement() {
    if (!this.styleElement || !this.currentStyles) {
      return;
    }

    const allStyles = Array.from(this.currentStyles.values()).join('\n');
    this.styleElement.textContent = allStyles;
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    const config = this.accessify.configManager.get('motor');
    const enabledFeatures = [];
    
    if (config.targets.enabled) enabledFeatures.push('largeTargets');
    if (config.gestures.enabled) enabledFeatures.push('gestureAlternatives');
    if (config.voice.enabled) enabledFeatures.push('voiceCommands');
    if (config.motion.enabled) enabledFeatures.push('motionControl');
    
    return {
      wcag: {
        level: 'AA',
        compliant: enabledFeatures.length >= 2,
        score: Math.round((enabledFeatures.length / 4) * 100)
      },
      israeliStandard: {
        compliant: enabledFeatures.includes('largeTargets') || 
                   enabledFeatures.includes('voiceCommands'),
        score: Math.round((enabledFeatures.length / 4) * 100)
      },
      features: enabledFeatures
    };
  }

  /**
   * Get current motor settings
   */
  getCurrentSettings() {
    return {
      targets: this.accessify.configManager.get('motor.targets'),
      gestures: this.accessify.configManager.get('motor.gestures'),
      voice: this.accessify.configManager.get('motor.voice'),
      motion: this.accessify.configManager.get('motor.motion'),
      delays: this.accessify.configManager.get('motor.delays')
    };
  }

  /**
   * Reset all motor settings to default
   */
  reset() {
    this._stopVoiceRecognition();
    this._removeLargeTargets();
    this._removeGestureRecognition();
    this._removeMotionSensor();
    
    this.accessify.emit('motorSettingsReset');
  }
}

/**
 * Multilingual Support Component
 * Handles RTL support, language detection, and internationalization
 */

class MultilingualSupport {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.currentLanguage = 'en';
    this.currentDirection = 'ltr';
    this.rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi'];
    this.translations = new Map();
    this.directionObserver = null;
  }

  /**
   * Initialize multilingual support
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Detect current language and direction
      this._detectLanguageAndDirection();
      
      // Set up RTL support
      this._setupRTLSupport();
      
      // Set up language switching
      this._setupLanguageSwitching();
      
      // Set up direction switching
      this._setupDirectionSwitching();
      
      // Load translations
      await this._loadTranslations();

      // Initialize voice recognition for RTL languages
      this._initializeRTLVoiceRecognition();

      this.isInitialized = true;
      this.accessify.emit('multilingualSupportInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Multilingual support initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy multilingual support
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Remove direction observer
      if (this.directionObserver) {
        this.directionObserver.disconnect();
      }
      
      // Remove RTL styles
      this._removeRTLStyles();

      this.isInitialized = false;
      this.accessify.emit('multilingualSupportDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Multilingual support destruction', 'component');
    }
  }

  /**
   * Detect current language and direction
   */
  _detectLanguageAndDirection() {
    const config = this.accessify.configManager.get('multilingual');
    
    if (config.autoDetect) {
      // Detect language from HTML lang attribute
      const htmlLang = document.documentElement.lang || 'en';
      this.currentLanguage = htmlLang.split('-')[0];
      
      // Detect direction from HTML dir attribute
      const htmlDir = document.documentElement.dir || 'ltr';
      this.currentDirection = htmlDir;
    } else {
      // Use configured values
      this.currentLanguage = this.accessify.configManager.get('language', 'en');
      this.currentDirection = this.accessify.configManager.get('direction', 'ltr');
    }
    
    // Update configuration
    this.accessify.configManager.set('language', this.currentLanguage);
    this.accessify.configManager.set('direction', this.currentDirection);
  }

  /**
   * Set up RTL support
   */
  _setupRTLSupport() {
    const config = this.accessify.configManager.get('multilingual.rtl');
    
    if (!config.enabled) {
      return;
    }

    // Apply RTL styles
    this._applyRTLStyles();
    
    // Set up direction observer
    this._setupDirectionObserver();
    
    // Set up RTL-specific features
    this._setupRTLFeatures();
  }

  /**
   * Apply RTL styles
   */
  _applyRTLStyles() {
    if (this.currentDirection === 'rtl') {
      const css = `
        html {
          direction: rtl !important;
        }
        
        body {
          direction: rtl !important;
        }
        
        * {
          direction: inherit !important;
        }
        
        /* RTL-specific adjustments */
        .accessify-skip-links {
          right: 0 !important;
          left: auto !important;
        }
        
        .accessify-skip-link {
          border-radius: 0 0 0 4px !important;
        }
        
        .accessify-reading-ruler {
          right: 0 !important;
          left: auto !important;
        }
        
        .accessify-target-enlarger {
          right: 0 !important;
          left: auto !important;
        }
      `;
      
      this._addStyle('rtl-support', css);
    }
  }

  /**
   * Remove RTL styles
   */
  _removeRTLStyles() {
    this._removeStyle('rtl-support');
  }

  /**
   * Set up direction observer
   */
  _setupDirectionObserver() {
    // Observe changes to the HTML dir attribute
    this.directionObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'dir') {
          const newDirection = document.documentElement.dir || 'ltr';
          if (newDirection !== this.currentDirection) {
            this.setDirection(newDirection);
          }
        }
      });
    });
    
    this.directionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });
  }

  /**
   * Set up RTL-specific features
   */
  _setupRTLFeatures() {
    if (this.currentDirection === 'rtl') {
      // Adjust keyboard navigation for RTL
      this._adjustKeyboardNavigationForRTL();
      
      // Adjust gesture recognition for RTL
      this._adjustGestureRecognitionForRTL();
      
      // Adjust text selection for RTL
      this._adjustTextSelectionForRTL();
    }
  }

  /**
   * Adjust keyboard navigation for RTL
   */
  _adjustKeyboardNavigationForRTL() {
    // Override arrow key behavior for RTL
    document.addEventListener('keydown', (event) => {
      if (this.currentDirection === 'rtl') {
        switch (event.key) {
          case 'ArrowLeft':
            // In RTL, left arrow should move right
            event.preventDefault();
            this._moveFocus('right');
            break;
          case 'ArrowRight':
            // In RTL, right arrow should move left
            event.preventDefault();
            this._moveFocus('left');
            break;
        }
      }
    });
  }

  /**
   * Move focus in specified direction
   */
  _moveFocus(direction) {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
    
    if (currentIndex === -1) {
      return;
    }
    
    let nextIndex;
    if (direction === 'left') {
      nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
    }
    
    focusableElements[nextIndex].focus();
  }

  /**
   * Adjust gesture recognition for RTL
   */
  _adjustGestureRecognitionForRTL() {
    // Override swipe gesture behavior for RTL
    this.accessify.on('gestureDetected', (gesture) => {
      if (this.currentDirection === 'rtl' && gesture.type === 'swipe') {
        if (gesture.direction === 'left') {
          gesture.direction = 'right';
        } else if (gesture.direction === 'right') {
          gesture.direction = 'left';
        }
      }
    });
  }

  /**
   * Adjust text selection for RTL
   */
  _adjustTextSelectionForRTL() {
    // Override text selection behavior for RTL
    document.addEventListener('mouseup', (event) => {
      if (this.currentDirection === 'rtl') {
        const selection = window.getSelection();
        if (selection.toString().trim()) {
          // Adjust selection highlighting for RTL
          this._adjustSelectionHighlighting();
        }
      }
    });
  }

  /**
   * Adjust selection highlighting for RTL
   */
  _adjustSelectionHighlighting() {
    // This is a simplified implementation
    // In a real implementation, you'd adjust the highlighting position
  }

  /**
   * Set up language switching
   */
  _setupLanguageSwitching() {
    // Listen for language changes
    this.accessify.on('languageChanged', (newLanguage) => {
      this.setLanguage(newLanguage);
    });
  }

  /**
   * Set up direction switching
   */
  _setupDirectionSwitching() {
    // Listen for direction changes
    this.accessify.on('directionChanged', (newDirection) => {
      this.setDirection(newDirection);
    });
  }

  /**
   * Set language
   */
  setLanguage(language) {
    if (this.currentLanguage === language) {
      return;
    }

    this.currentLanguage = language;
    this.accessify.configManager.set('language', language);
    
    // Update HTML lang attribute
    document.documentElement.lang = language;
    
    // Update speech synthesis language
    if (this.accessify.reading && this.accessify.reading.speechSynthesis) {
      this.accessify.reading.speechSynthesis.lang = language;
    }
    
    // Update voice recognition language
    if (this.accessify.motor && this.accessify.motor.voiceRecognition) {
      this.accessify.motor.voiceRecognition.lang = language;
    }
    
    // Emit language changed event
    this.accessify.emit('languageChanged', language);
  }

  /**
   * Set direction
   */
  setDirection(direction) {
    if (this.currentDirection === direction) {
      return;
    }

    this.currentDirection = direction;
    this.accessify.configManager.set('direction', direction);
    
    // Update HTML dir attribute
    document.documentElement.dir = direction;
    
    // Apply or remove RTL styles
    if (direction === 'rtl') {
      this._applyRTLStyles();
      this._setupRTLFeatures();
    } else {
      this._removeRTLStyles();
    }
    
    // Emit direction changed event
    this.accessify.emit('directionChanged', direction);
  }

  /**
   * Load translations
   */
  async _loadTranslations() {
    const languages = ['en', 'he', 'ar', 'es', 'fr', 'de'];
    
    for (const lang of languages) {
      try {
        const translations = await this._loadLanguageTranslations(lang);
        this.translations.set(lang, translations);
      } catch (error) {
        console.warn(`Failed to load translations for ${lang}:`, error);
      }
    }
  }

  /**
   * Load language translations
   */
  async _loadLanguageTranslations(language) {
    // This is a simplified implementation
    // In a real implementation, you'd load translations from files or API
    
    const translations = {
      en: {
        'skipToContent': 'Skip to main content',
        'skipToNavigation': 'Skip to navigation',
        'increaseTextSize': 'Increase text size',
        'decreaseTextSize': 'Decrease text size',
        'toggleContrast': 'Toggle contrast',
        'toggleHighContrast': 'Toggle high contrast',
        'speak': 'Speak text',
        'stop': 'Stop',
        'pause': 'Pause',
        'resume': 'Resume'
      },
      he: {
        'skipToContent': 'דלג לתוכן הראשי',
        'skipToNavigation': 'דלג לניווט',
        'increaseTextSize': 'הגדל גודל טקסט',
        'decreaseTextSize': 'הקטן גודל טקסט',
        'toggleContrast': 'החלף ניגודיות',
        'toggleHighContrast': 'החלף ניגודיות גבוהה',
        'speak': 'הקרא טקסט',
        'stop': 'עצור',
        'pause': 'השהה',
        'resume': 'המשך'
      },
      ar: {
        'skipToContent': 'انتقل إلى المحتوى الرئيسي',
        'skipToNavigation': 'انتقل إلى التنقل',
        'increaseTextSize': 'زيادة حجم النص',
        'decreaseTextSize': 'تقليل حجم النص',
        'toggleContrast': 'تبديل التباين',
        'toggleHighContrast': 'تبديل التباين العالي',
        'speak': 'قراءة النص',
        'stop': 'توقف',
        'pause': 'إيقاف مؤقت',
        'resume': 'استئناف'
      }
    };
    
    return translations[language] || translations.en;
  }

  /**
   * Get translation
   */
  getTranslation(key, language = null) {
    const lang = language || this.currentLanguage;
    const langTranslations = this.translations.get(lang);
    
    if (langTranslations && langTranslations[key]) {
      return langTranslations[key];
    }
    
    // Fallback to English
    const enTranslations = this.translations.get('en');
    if (enTranslations && enTranslations[key]) {
      return enTranslations[key];
    }
    
    // Fallback to key
    return key;
  }

  /**
   * Check if language is RTL
   */
  isRTLLanguage(language = null) {
    const lang = language || this.currentLanguage;
    return this.rtlLanguages.includes(lang);
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get current direction
   */
  getCurrentDirection() {
    return this.currentDirection;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Array.from(this.translations.keys());
  }

  /**
   * Add style to the style element
   */
  _addStyle(name, css) {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'accessify-multilingual-styles';
      document.head.appendChild(this.styleElement);
    }
    
    this.currentStyles = this.currentStyles || new Map();
    this.currentStyles.set(name, css);
    this._updateStyleElement();
  }

  /**
   * Remove style from the style element
   */
  _removeStyle(name) {
    if (this.currentStyles) {
      this.currentStyles.delete(name);
      this._updateStyleElement();
    }
  }

  /**
   * Update the style element with all current styles
   */
  _updateStyleElement() {
    if (!this.styleElement || !this.currentStyles) {
      return;
    }

    const allStyles = Array.from(this.currentStyles.values()).join('\n');
    this.styleElement.textContent = allStyles;
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    const config = this.accessify.configManager.get('multilingual');
    const enabledFeatures = [];
    
    if (config.enabled) enabledFeatures.push('multilingual');
    if (config.rtl.enabled) enabledFeatures.push('rtlSupport');
    
    return {
      wcag: {
        level: 'AA',
        compliant: enabledFeatures.length >= 1,
        score: Math.round((enabledFeatures.length / 2) * 100)
      },
      israeliStandard: {
        compliant: enabledFeatures.includes('rtlSupport') && 
                   this.isRTLLanguage(),
        score: Math.round((enabledFeatures.length / 2) * 100)
      },
      features: enabledFeatures
    };
  }

  /**
   * Get current multilingual settings
   */
  getCurrentSettings() {
    return {
      language: this.currentLanguage,
      direction: this.currentDirection,
      isRTL: this.isRTLLanguage(),
      supportedLanguages: this.getSupportedLanguages(),
      translations: this.translations
    };
  }

  /**
   * Reset all multilingual settings to default
   */
  reset() {
    this.setLanguage('en');
    this.setDirection('ltr');
    
    this.accessify.emit('multilingualSettingsReset');
  }

  /**
   * Initialize RTL voice recognition
   */
  _initializeRTLVoiceRecognition() {
    try {
      // Hebrew voice commands
      this.hebrewCommands = {
        'גדל טקסט': () => this.accessify.visual?.increaseTextSize(),
        'הקטן טקסט': () => this.accessify.visual?.decreaseTextSize(),
        'ניגודיות גבוהה': () => this.accessify.visual?.setContrastMode('high'),
        'ניגודיות רגילה': () => this.accessify.visual?.setContrastMode('normal'),
        'ערכת נושא כהה': () => this.accessify.visual?.setTheme('dark'),
        'ערכת נושא בהירה': () => this.accessify.visual?.setTheme('light'),
        'קרא טקסט': () => this._speakSelectedText('he'),
        'עצור קריאה': () => this.accessify.reading?.stop(),
        'ניווט למעלה': () => this._navigateUp(),
        'ניווט למטה': () => this._navigateDown(),
        'ניווט שמאלה': () => this._navigateLeft(),
        'ניווט ימינה': () => this._navigateRight(),
        'סגור': () => this._closeCurrentElement(),
        'פתח': () => this._openCurrentElement(),
        'חזור': () => window.history.back(),
        'קדימה': () => window.history.forward()
      };

      // Arabic voice commands
      this.arabicCommands = {
        'كبر النص': () => this.accessify.visual?.increaseTextSize(),
        'صغر النص': () => this.accessify.visual?.decreaseTextSize(),
        'تباين عالي': () => this.accessify.visual?.setContrastMode('high'),
        'تباين عادي': () => this.accessify.visual?.setContrastMode('normal'),
        'مظهر داكن': () => this.accessify.visual?.setTheme('dark'),
        'مظهر فاتح': () => this.accessify.visual?.setTheme('light'),
        'اقرأ النص': () => this._speakSelectedText('ar'),
        'توقف عن القراءة': () => this.accessify.reading?.stop(),
        'انتقل لأعلى': () => this._navigateUp(),
        'انتقل لأسفل': () => this._navigateDown(),
        'انتقل لليسار': () => this._navigateLeft(),
        'انتقل لليمين': () => this._navigateRight(),
        'إغلاق': () => this._closeCurrentElement(),
        'فتح': () => this._openCurrentElement(),
        'رجوع': () => window.history.back(),
        'تقدم': () => window.history.forward()
      };

      this.accessify.emit('rtlVoiceRecognitionInitialized');
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'RTL voice recognition initialization', 'component');
    }
  }

  /**
   * Process voice command for current language
   */
  processVoiceCommand(command) {
    try {
      const normalizedCommand = command.toLowerCase().trim();
      
      if (this.currentLanguage === 'he' && this.hebrewCommands[normalizedCommand]) {
        this.hebrewCommands[normalizedCommand]();
        this.accessify.emit('hebrewVoiceCommand', command);
        return true;
      } else if (this.currentLanguage === 'ar' && this.arabicCommands[normalizedCommand]) {
        this.arabicCommands[normalizedCommand]();
        this.accessify.emit('arabicVoiceCommand', command);
        return true;
      }
      
      return false;
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Voice command processing', 'component');
      return false;
    }
  }

  /**
   * Speak selected text in current language
   */
  _speakSelectedText(language) {
    try {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text && this.accessify.reading) {
        this.accessify.reading.speak(text, {
          lang: language,
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0
        });
      }
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Text-to-speech in RTL language', 'component');
    }
  }

  /**
   * Navigate up
   */
  _navigateUp() {
    const currentElement = document.activeElement;
    const focusableElements = this._getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
    }
  }

  /**
   * Navigate down
   */
  _navigateDown() {
    const currentElement = document.activeElement;
    const focusableElements = this._getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
    }
  }

  /**
   * Navigate left (RTL-aware)
   */
  _navigateLeft() {
    if (this.currentDirection === 'rtl') {
      this._navigateDown();
    } else {
      this._navigateUp();
    }
  }

  /**
   * Navigate right (RTL-aware)
   */
  _navigateRight() {
    if (this.currentDirection === 'rtl') {
      this._navigateUp();
    } else {
      this._navigateDown();
    }
  }

  /**
   * Close current element
   */
  _closeCurrentElement() {
    const currentElement = document.activeElement;
    
    // Try to find close button or escape functionality
    const closeButton = currentElement.closest('[role="dialog"], [role="modal"]')?.querySelector('[aria-label*="close"], [aria-label*="סגור"], [aria-label*="إغلاق"]');
    if (closeButton) {
      closeButton.click();
    } else {
      // Send escape key
      currentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
  }

  /**
   * Open current element
   */
  _openCurrentElement() {
    const currentElement = document.activeElement;
    
    if (currentElement.tagName === 'BUTTON' || currentElement.getAttribute('role') === 'button') {
      currentElement.click();
    } else if (currentElement.tagName === 'A') {
      currentElement.click();
    } else {
      // Send enter key
      currentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
  }

  /**
   * Get all focusable elements
   */
  _getFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    return Array.from(document.querySelectorAll(focusableSelectors.join(', ')));
  }

  /**
   * Get available voice commands for current language
   */
  getAvailableVoiceCommands() {
    if (this.currentLanguage === 'he') {
      return Object.keys(this.hebrewCommands);
    } else if (this.currentLanguage === 'ar') {
      return Object.keys(this.arabicCommands);
    }
    return [];
  }

  /**
   * Add custom voice command
   */
  addCustomVoiceCommand(command, action, language = null) {
    try {
      const lang = language || this.currentLanguage;
      
      if (lang === 'he') {
        this.hebrewCommands[command] = action;
      } else if (lang === 'ar') {
        this.arabicCommands[command] = action;
      }
      
      this.accessify.emit('customVoiceCommandAdded', { command, language: lang });
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Custom voice command addition', 'component');
    }
  }
}

/**
 * ARIA Enhancement Component
 * Provides comprehensive ARIA labeling and accessibility enhancements
 */

class ARIAEnhancement {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.enhancedElements = new Set();
    this.ariaObserver = null;
  }

  /**
   * Initialize ARIA enhancement features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Enhance existing elements
      this._enhanceExistingElements();

      // Set up observer for new elements
      this._observeNewElements();

      // Set up live regions for announcements
      this._setupLiveRegions();

      this.isInitialized = true;
      this.accessify.emit('ariaEnhancementInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'ARIA enhancement initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy ARIA enhancement features
   */
  destroy() {
    try {
      if (this.ariaObserver) {
        this.ariaObserver.disconnect();
        this.ariaObserver = null;
      }

      // Remove enhanced elements tracking
      this.enhancedElements.clear();

      this.isInitialized = false;
      this.accessify.emit('ariaEnhancementDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'ARIA enhancement destruction', 'component');
    }
  }

  /**
   * Enhance existing elements with ARIA attributes
   */
  _enhanceExistingElements() {
    // Enhance buttons
    this._enhanceButtons();
    
    // Enhance form elements
    this._enhanceFormElements();
    
    // Enhance navigation elements
    this._enhanceNavigation();
    
    // Enhance images
    this._enhanceImages();
    
    // Enhance interactive elements
    this._enhanceInteractiveElements();
  }

  /**
   * Enhance buttons with proper ARIA attributes
   */
  _enhanceButtons() {
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    
    buttons.forEach(button => {
      if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
        // Generate aria-label from icon or other attributes
        const icon = button.querySelector('i, svg, img');
        if (icon) {
          const iconClass = icon.className;
          const iconTitle = icon.getAttribute('title') || icon.getAttribute('aria-label');
          
          if (iconTitle) {
            button.setAttribute('aria-label', iconTitle);
          } else if (iconClass) {
            // Generate label from icon class
            const label = this._generateLabelFromIconClass(iconClass);
            button.setAttribute('aria-label', label);
          }
        }
        
        // Use data-label if available
        const dataLabel = button.getAttribute('data-label');
        if (dataLabel) {
          button.setAttribute('aria-label', dataLabel);
        }
      }
      
      this.enhancedElements.add(button);
    });
  }

  /**
   * Enhance form elements with proper labels and descriptions
   */
  _enhanceFormElements() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Ensure proper labeling
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-labelledby', label.id || this._generateId(label));
        }
      }
      
      // Add validation states
      if (input.hasAttribute('required')) {
        input.setAttribute('aria-required', 'true');
      }
      
      if (input.hasAttribute('invalid') || input.classList.contains('invalid')) {
        input.setAttribute('aria-invalid', 'true');
      }
      
      // Add descriptions for help text
      const helpText = input.closest('.form-group, .field')?.querySelector('.help-text, .description');
      if (helpText && !input.getAttribute('aria-describedby')) {
        helpText.id = helpText.id || this._generateId(helpText);
        input.setAttribute('aria-describedby', helpText.id);
      }
      
      this.enhancedElements.add(input);
    });
  }

  /**
   * Enhance navigation elements
   */
  _enhanceNavigation() {
    const navs = document.querySelectorAll('nav:not([aria-label]):not([aria-labelledby])');
    
    navs.forEach(nav => {
      if (!nav.getAttribute('aria-label')) {
        // Try to get label from heading or title
        const heading = nav.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          nav.setAttribute('aria-labelledby', heading.id || this._generateId(heading));
        } else {
          nav.setAttribute('aria-label', 'Navigation');
        }
      }
      
      this.enhancedElements.add(nav);
    });
  }

  /**
   * Enhance images with proper alt text and descriptions
   */
  _enhanceImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Ensure alt attribute exists
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', 'Image');
      }
      
      // Add longdesc for complex images
      if (img.hasAttribute('data-longdesc') && !img.hasAttribute('aria-describedby')) {
        const longdescId = this._generateId(img) + '-longdesc';
        const longdescElement = document.getElementById(img.getAttribute('data-longdesc'));
        if (longdescElement) {
          longdescElement.id = longdescId;
          img.setAttribute('aria-describedby', longdescId);
        }
      }
      
      this.enhancedElements.add(img);
    });
  }

  /**
   * Enhance interactive elements
   */
  _enhanceInteractiveElements() {
    // Enhance clickable divs and spans
    const clickableElements = document.querySelectorAll('[onclick], [role="button"]:not(button)');
    
    clickableElements.forEach(element => {
      if (!element.getAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
      
      if (!element.getAttribute('role')) {
        element.setAttribute('role', 'button');
      }
      
      // Add keyboard event handlers
      this._addKeyboardHandlers(element);
      
      this.enhancedElements.add(element);
    });
  }

  /**
   * Add keyboard event handlers for interactive elements
   */
  _addKeyboardHandlers(element) {
    const handleKeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    };
    
    element.addEventListener('keydown', handleKeydown);
    
    // Store handler for cleanup
    element._accessifyKeydownHandler = handleKeydown;
  }

  /**
   * Observe for new elements and enhance them
   */
  _observeNewElements() {
    if (typeof MutationObserver !== 'undefined') {
      this.ariaObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this._enhanceNewElement(node);
            }
          });
        });
      });

      this.ariaObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Enhance a newly added element
   */
  _enhanceNewElement(element) {
    // Skip if already enhanced
    if (this.enhancedElements.has(element)) {
      return;
    }

    // Enhance based on element type
    if (element.tagName === 'BUTTON') {
      this._enhanceButtons();
    } else if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      this._enhanceFormElements();
    } else if (element.tagName === 'NAV') {
      this._enhanceNavigation();
    } else if (element.tagName === 'IMG') {
      this._enhanceImages();
    } else if (element.hasAttribute('onclick') || element.getAttribute('role') === 'button') {
      this._enhanceInteractiveElements();
    }
  }

  /**
   * Set up live regions for announcements
   */
  _setupLiveRegions() {
    // Create live region for status announcements
    if (!document.getElementById('accessify-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'accessify-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
    }

    // Create live region for assertive announcements
    if (!document.getElementById('accessify-live-region-assertive')) {
      const liveRegionAssertive = document.createElement('div');
      liveRegionAssertive.id = 'accessify-live-region-assertive';
      liveRegionAssertive.setAttribute('aria-live', 'assertive');
      liveRegionAssertive.setAttribute('aria-atomic', 'true');
      liveRegionAssertive.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegionAssertive);
    }
  }

  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    try {
      const liveRegionId = priority === 'assertive' ? 
        'accessify-live-region-assertive' : 
        'accessify-live-region';
      
      const liveRegion = document.getElementById(liveRegionId);
      if (liveRegion) {
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Live region announcement', 'component');
    }
  }

  /**
   * Generate label from icon class
   */
  _generateLabelFromIconClass(iconClass) {
    const iconMap = {
      'fa-search': 'Search',
      'fa-menu': 'Menu',
      'fa-close': 'Close',
      'fa-edit': 'Edit',
      'fa-delete': 'Delete',
      'fa-save': 'Save',
      'fa-cancel': 'Cancel',
      'fa-plus': 'Add',
      'fa-minus': 'Remove',
      'fa-arrow-left': 'Previous',
      'fa-arrow-right': 'Next',
      'fa-arrow-up': 'Up',
      'fa-arrow-down': 'Down',
      'fa-home': 'Home',
      'fa-user': 'User',
      'fa-settings': 'Settings',
      'fa-help': 'Help'
    };

    for (const [className, label] of Object.entries(iconMap)) {
      if (iconClass.includes(className)) {
        return label;
      }
    }

    return 'Button';
  }

  /**
   * Generate unique ID for element
   */
  _generateId(element) {
    if (element.id) {
      return element.id;
    }

    const prefix = element.tagName.toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const id = `${prefix}-${timestamp}-${random}`;
    
    element.id = id;
    return id;
  }

  /**
   * Add ARIA attributes to element
   */
  enhanceElement(element, attributes) {
    try {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      
      this.enhancedElements.add(element);
      this.accessify.emit('elementEnhanced', { element, attributes });
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Element enhancement', 'component');
    }
  }

  /**
   * Remove ARIA attributes from element
   */
  removeEnhancement(element, attributes) {
    try {
      if (Array.isArray(attributes)) {
        attributes.forEach(attr => {
          element.removeAttribute(attr);
        });
      } else {
        element.removeAttribute(attributes);
      }
      
      this.enhancedElements.delete(element);
      this.accessify.emit('elementEnhancementRemoved', { element, attributes });
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Element enhancement removal', 'component');
    }
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    return {
      enhancedElements: this.enhancedElements.size,
      liveRegions: {
        polite: !!document.getElementById('accessify-live-region'),
        assertive: !!document.getElementById('accessify-live-region-assertive')
      },
      wcagCompliant: true,
      israeliStandardCompliant: true
    };
  }

  /**
   * Reset all ARIA enhancements
   */
  reset() {
    try {
      // Remove all enhanced elements
      this.enhancedElements.forEach(element => {
        // Remove Accessify-specific attributes
        const accessifyAttributes = Array.from(element.attributes)
          .filter(attr => attr.name.startsWith('data-accessify-'))
          .map(attr => attr.name);
        
        accessifyAttributes.forEach(attr => {
          element.removeAttribute(attr);
        });
      });
      
      this.enhancedElements.clear();
      
      this.accessify.emit('ariaEnhancementReset');
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'ARIA enhancement reset', 'component');
    }
  }
}

/**
 * Reading Guide Component
 * Provides reading ruler and text highlighting features
 */

class ReadingGuide {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.readingRuler = null;
    this.isActive = false;
    this.currentPosition = { x: 0, y: 0 };
    this.highlightedElements = new Set();
  }

  /**
   * Initialize reading guide features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Create reading ruler
      this._createReadingRuler();
      
      // Set up event listeners
      this._setupEventListeners();
      
      // Initialize text highlighting
      this._initializeTextHighlighting();

      this.isInitialized = true;
      this.accessify.emit('readingGuideInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Reading guide initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy reading guide features
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Remove reading ruler
      this._removeReadingRuler();
      
      // Remove event listeners
      this._removeEventListeners();
      
      // Clear highlighted elements
      this._clearHighlightedElements();

      this.isInitialized = false;
      this.accessify.emit('readingGuideDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Reading guide destruction', 'component');
    }
  }

  /**
   * Create reading ruler
   */
  _createReadingRuler() {
    this.readingRuler = document.createElement('div');
    this.readingRuler.id = 'accessify-reading-ruler';
    this.readingRuler.className = 'accessify-reading-ruler';
    this.readingRuler.setAttribute('aria-hidden', 'true');
    
    // Create ruler line
    const rulerLine = document.createElement('div');
    rulerLine.className = 'accessify-ruler-line';
    
    // Create ruler handles
    const topHandle = document.createElement('div');
    topHandle.className = 'accessify-ruler-handle accessify-ruler-handle-top';
    
    const bottomHandle = document.createElement('div');
    bottomHandle.className = 'accessify-ruler-handle accessify-ruler-handle-bottom';
    
    this.readingRuler.appendChild(rulerLine);
    this.readingRuler.appendChild(topHandle);
    this.readingRuler.appendChild(bottomHandle);
    
    // Add to document
    document.body.appendChild(this.readingRuler);
    
    // Add CSS
    this._addReadingRulerCSS();
    
    // Initially hidden
    this.hideReadingRuler();
  }

  /**
   * Add reading ruler CSS
   */
  _addReadingRulerCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-reading-ruler {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 60px;
        z-index: 10000;
        pointer-events: none;
        display: none;
        border: 2px solid #ff0000;
        background-color: rgba(255, 0, 0, 0.1);
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
      }
      
      .accessify-ruler-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #ff0000;
        top: 50%;
        transform: translateY(-50%);
      }
      
      .accessify-ruler-handle {
        position: absolute;
        width: 20px;
        height: 20px;
        background-color: #ff0000;
        border: 2px solid #ffffff;
        border-radius: 50%;
        cursor: pointer;
        pointer-events: auto;
        top: 50%;
        transform: translateY(-50%);
      }
      
      .accessify-ruler-handle-top {
        left: -10px;
      }
      
      .accessify-ruler-handle-bottom {
        right: -10px;
      }
      
      .accessify-ruler-handle:hover {
        background-color: #cc0000;
        transform: translateY(-50%) scale(1.2);
      }
      
      .accessify-reading-ruler.active {
        display: block;
        pointer-events: auto;
      }
      
      .accessify-text-highlight {
        background-color: rgba(255, 255, 0, 0.3) !important;
        border-radius: 3px !important;
        padding: 2px !important;
      }
      
      .accessify-text-mask {
        background-color: rgba(0, 0, 0, 0.8) !important;
        color: transparent !important;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.8) !important;
      }
      
      .accessify-text-mask.active {
        background-color: rgba(255, 255, 255, 0.9) !important;
        color: inherit !important;
        text-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show reading ruler
   */
  showReadingRuler() {
    if (this.readingRuler) {
      this.readingRuler.classList.add('active');
      this.isActive = true;
      this.accessify.emit('readingRulerShown');
    }
  }

  /**
   * Hide reading ruler
   */
  hideReadingRuler() {
    if (this.readingRuler) {
      this.readingRuler.classList.remove('active');
      this.isActive = false;
      this.accessify.emit('readingRulerHidden');
    }
  }

  /**
   * Toggle reading ruler
   */
  toggleReadingRuler() {
    if (this.isActive) {
      this.hideReadingRuler();
    } else {
      this.showReadingRuler();
    }
  }

  /**
   * Set reading ruler position
   */
  setReadingRulerPosition(y) {
    if (this.readingRuler) {
      this.readingRuler.style.top = y + 'px';
      this.currentPosition.y = y;
      this.accessify.emit('readingRulerPositionChanged', y);
    }
  }

  /**
   * Set reading ruler height
   */
  setReadingRulerHeight(height) {
    if (this.readingRuler) {
      this.readingRuler.style.height = height + 'px';
      this.accessify.emit('readingRulerHeightChanged', height);
    }
  }

  /**
   * Highlight text elements
   */
  highlightText(elements) {
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    
    elements.forEach(element => {
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        element.classList.add('accessify-text-highlight');
        this.highlightedElements.add(element);
      }
    });
    
    this.accessify.emit('textHighlighted', elements);
  }

  /**
   * Remove text highlighting
   */
  removeTextHighlighting(elements) {
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    
    elements.forEach(element => {
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        element.classList.remove('accessify-text-highlight');
        this.highlightedElements.delete(element);
      }
    });
    
    this.accessify.emit('textHighlightingRemoved', elements);
  }

  /**
   * Clear all highlighted elements
   */
  _clearHighlightedElements() {
    this.highlightedElements.forEach(element => {
      element.classList.remove('accessify-text-highlight');
    });
    this.highlightedElements.clear();
  }

  /**
   * Mask text (hide non-focused text)
   */
  maskText(elements) {
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    
    elements.forEach(element => {
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        element.classList.add('accessify-text-mask');
      }
    });
    
    this.accessify.emit('textMasked', elements);
  }

  /**
   * Unmask text
   */
  unmaskText(elements) {
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    
    elements.forEach(element => {
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        element.classList.remove('accessify-text-mask');
      }
    });
    
    this.accessify.emit('textUnmasked', elements);
  }

  /**
   * Focus on specific text element
   */
  focusOnText(element) {
    if (element && element.nodeType === Node.ELEMENT_NODE) {
      // Unmask the focused element
      element.classList.add('accessify-text-mask', 'active');
      
      // Mask all other text elements
      const allTextElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th');
      allTextElements.forEach(el => {
        if (el !== element) {
          el.classList.add('accessify-text-mask');
        }
      });
      
      this.accessify.emit('textFocused', element);
    }
  }

  /**
   * Clear text focus
   */
  clearTextFocus() {
    const maskedElements = document.querySelectorAll('.accessify-text-mask');
    maskedElements.forEach(element => {
      element.classList.remove('accessify-text-mask', 'active');
    });
    
    this.accessify.emit('textFocusCleared');
  }

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Mouse events for reading ruler
    document.addEventListener('mousemove', this._handleMouseMove.bind(this));
    document.addEventListener('click', this._handleClick.bind(this));
    
    // Keyboard events
    document.addEventListener('keydown', this._handleKeydown.bind(this));
    
    // Touch events for mobile
    document.addEventListener('touchstart', this._handleTouchStart.bind(this));
    document.addEventListener('touchmove', this._handleTouchMove.bind(this));
  }

  /**
   * Handle mouse move
   */
  _handleMouseMove(event) {
    if (this.isActive && event.ctrlKey) {
      this.setReadingRulerPosition(event.clientY - 30);
    }
  }

  /**
   * Handle click
   */
  _handleClick(event) {
    if (this.isActive && event.ctrlKey) {
      event.preventDefault();
      this.setReadingRulerPosition(event.clientY - 30);
    }
  }

  /**
   * Handle keydown
   */
  _handleKeydown(event) {
    if (event.altKey && event.key === 'r') {
      event.preventDefault();
      this.toggleReadingRuler();
    }
    
    if (event.altKey && event.key === 'h') {
      event.preventDefault();
      this.toggleTextHighlighting();
    }
  }

  /**
   * Handle touch start
   */
  _handleTouchStart(event) {
    if (this.isActive && event.touches.length === 1) {
      this.setReadingRulerPosition(event.touches[0].clientY - 30);
    }
  }

  /**
   * Handle touch move
   */
  _handleTouchMove(event) {
    if (this.isActive && event.touches.length === 1) {
      event.preventDefault();
      this.setReadingRulerPosition(event.touches[0].clientY - 30);
    }
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('mousemove', this._handleMouseMove);
    document.removeEventListener('click', this._handleClick);
    document.removeEventListener('keydown', this._handleKeydown);
    document.removeEventListener('touchstart', this._handleTouchStart);
    document.removeEventListener('touchmove', this._handleTouchMove);
  }

  /**
   * Remove reading ruler
   */
  _removeReadingRuler() {
    if (this.readingRuler && this.readingRuler.parentNode) {
      this.readingRuler.parentNode.removeChild(this.readingRuler);
    }
  }

  /**
   * Initialize text highlighting
   */
  _initializeTextHighlighting() {
    // This can be expanded to include more sophisticated text highlighting
    this.accessify.emit('textHighlightingInitialized');
  }

  /**
   * Toggle text highlighting
   */
  toggleTextHighlighting() {
    if (this.highlightedElements.size > 0) {
      this._clearHighlightedElements();
    } else {
      // Highlight all text elements
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th');
      this.highlightText(Array.from(textElements));
    }
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    return {
      readingRuler: {
        available: !!this.readingRuler,
        active: this.isActive
      },
      textHighlighting: {
        available: true,
        highlightedElements: this.highlightedElements.size
      },
      wcagCompliant: true,
      israeliStandardCompliant: true
    };
  }

  /**
   * Get current settings
   */
  getCurrentSettings() {
    return {
      readingRuler: {
        active: this.isActive,
        position: this.currentPosition
      },
      textHighlighting: {
        highlightedElements: this.highlightedElements.size
      }
    };
  }

  /**
   * Reset all settings
   */
  reset() {
    this.hideReadingRuler();
    this._clearHighlightedElements();
    this.clearTextFocus();
    this.accessify.emit('readingGuideReset');
  }
}

/**
 * Screen Reader Optimization Component
 * Provides comprehensive screen reader support and optimization
 */

class ScreenReaderOptimization {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.liveRegions = new Map();
    this.announcements = [];
    this.ariaEnhancements = new Map();
    this.screenReaderDetected = false;
  }

  /**
   * Initialize screen reader optimization features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Detect screen reader
      this._detectScreenReader();
      
      // Set up live regions
      this._setupLiveRegions();
      
      // Enhance ARIA attributes
      this._enhanceARIA();
      
      // Set up announcements
      this._setupAnnouncements();
      
      // Set up event listeners
      this._setupEventListeners();

      this.isInitialized = true;
      this.accessify.emit('screenReaderOptimizationInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Screen reader optimization initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy screen reader optimization features
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Remove live regions
      this._removeLiveRegions();
      
      // Remove event listeners
      this._removeEventListeners();
      
      // Clear announcements
      this.announcements = [];

      this.isInitialized = false;
      this.accessify.emit('screenReaderOptimizationDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Screen reader optimization destruction', 'component');
    }
  }

  /**
   * Detect screen reader
   */
  _detectScreenReader() {

    // Check for screen reader specific properties
    if (window.speechSynthesis || document.querySelector('[aria-live]')) {
      this.screenReaderDetected = true;
    }

    // Check for screen reader specific classes or attributes
    const hasScreenReaderClasses = document.querySelector('.sr-only, .screen-reader-only, [aria-hidden="true"]');
    if (hasScreenReaderClasses) {
      this.screenReaderDetected = true;
    }

    this.accessify.emit('screenReaderDetected', this.screenReaderDetected);
  }

  /**
   * Set up live regions
   */
  _setupLiveRegions() {
    // Create polite live region
    this._createLiveRegion('polite', 'accessify-live-polite');
    
    // Create assertive live region
    this._createLiveRegion('assertive', 'accessify-live-assertive');
    
    // Create status live region
    this._createLiveRegion('status', 'accessify-live-status');
    
    // Create log live region
    this._createLiveRegion('log', 'accessify-live-log');
  }

  /**
   * Create live region
   */
  _createLiveRegion(type, id) {
    const liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', type);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(liveRegion);
    this.liveRegions.set(type, liveRegion);
  }

  /**
   * Announce message to screen reader
   */
  announce(message, type = 'polite', priority = 'normal') {
    try {
      const liveRegion = this.liveRegions.get(type);
      if (liveRegion) {
        // Clear previous message
        liveRegion.textContent = '';
        
        // Set new message
        setTimeout(() => {
          liveRegion.textContent = message;
          this.announcements.push({
            message,
            type,
            priority,
            timestamp: new Date().toISOString()
          });
        }, 100);
        
        // Clear after announcement
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 2000);
        
        this.accessify.emit('announcementMade', { message, type, priority });
      }
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Screen reader announcement', 'component');
    }
  }

  /**
   * Announce status change
   */
  announceStatus(status, details = '') {
    const message = details ? `${status}: ${details}` : status;
    this.announce(message, 'status', 'high');
  }

  /**
   * Announce error
   */
  announceError(error, context = '') {
    const message = context ? `Error in ${context}: ${error}` : `Error: ${error}`;
    this.announce(message, 'assertive', 'high');
  }

  /**
   * Announce success
   */
  announceSuccess(message) {
    this.announce(`Success: ${message}`, 'polite', 'normal');
  }

  /**
   * Enhance ARIA attributes
   */
  _enhanceARIA() {
    // Enhance buttons
    this._enhanceButtons();
    
    // Enhance form elements
    this._enhanceFormElements();
    
    // Enhance navigation
    this._enhanceNavigation();
    
    // Enhance headings
    this._enhanceHeadings();
    
    // Enhance lists
    this._enhanceLists();
    
    // Enhance tables
    this._enhanceTables();
  }

  /**
   * Enhance buttons
   */
  _enhanceButtons() {
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        // Generate aria-label from icon or other attributes
        const icon = button.querySelector('i, svg, img');
        if (icon) {
          const iconTitle = icon.getAttribute('title') || icon.getAttribute('aria-label');
          if (iconTitle) {
            button.setAttribute('aria-label', iconTitle);
          }
        }
        
        // Use data-label if available
        const dataLabel = button.getAttribute('data-label');
        if (dataLabel) {
          button.setAttribute('aria-label', dataLabel);
        }
      }
      
      this.ariaEnhancements.set(button, ['aria-label']);
    });
  }

  /**
   * Enhance form elements
   */
  _enhanceFormElements() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Ensure proper labeling
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-labelledby', label.id || this._generateId(label));
        }
      }
      
      // Add validation states
      if (input.hasAttribute('required')) {
        input.setAttribute('aria-required', 'true');
      }
      
      if (input.hasAttribute('invalid') || input.classList.contains('invalid')) {
        input.setAttribute('aria-invalid', 'true');
      }
      
      // Add descriptions for help text
      const helpText = input.closest('.form-group, .field')?.querySelector('.help-text, .description');
      if (helpText && !input.getAttribute('aria-describedby')) {
        helpText.id = helpText.id || this._generateId(helpText);
        input.setAttribute('aria-describedby', helpText.id);
      }
      
      this.ariaEnhancements.set(input, ['aria-required', 'aria-invalid', 'aria-describedby']);
    });
  }

  /**
   * Enhance navigation
   */
  _enhanceNavigation() {
    const navs = document.querySelectorAll('nav:not([aria-label]):not([aria-labelledby])');
    
    navs.forEach(nav => {
      if (!nav.getAttribute('aria-label')) {
        // Try to get label from heading or title
        const heading = nav.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          nav.setAttribute('aria-labelledby', heading.id || this._generateId(heading));
        } else {
          nav.setAttribute('aria-label', 'Navigation');
        }
      }
      
      this.ariaEnhancements.set(nav, ['aria-label', 'aria-labelledby']);
    });
  }

  /**
   * Enhance headings
   */
  _enhanceHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach(heading => {
      if (!heading.id) {
        heading.id = this._generateId(heading);
      }
      
      this.ariaEnhancements.set(heading, ['id']);
    });
  }

  /**
   * Enhance lists
   */
  _enhanceLists() {
    const lists = document.querySelectorAll('ul, ol');
    
    lists.forEach(list => {
      if (!list.getAttribute('aria-label') && !list.getAttribute('aria-labelledby')) {
        // Try to get label from heading
        const heading = list.previousElementSibling;
        if (heading && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(heading.tagName)) {
          list.setAttribute('aria-labelledby', heading.id || this._generateId(heading));
        }
      }
      
      this.ariaEnhancements.set(list, ['aria-label', 'aria-labelledby']);
    });
  }

  /**
   * Enhance tables
   */
  _enhanceTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      // Add caption if missing
      if (!table.querySelector('caption')) {
        const caption = document.createElement('caption');
        caption.textContent = 'Table';
        table.insertBefore(caption, table.firstChild);
      }
      
      // Add table headers
      const headers = table.querySelectorAll('th');
      if (headers.length > 0) {
        table.setAttribute('role', 'table');
      }
      
      this.ariaEnhancements.set(table, ['caption', 'role']);
    });
  }

  /**
   * Set up announcements
   */
  _setupAnnouncements() {
    // Announce page load
    this.announce('Page loaded successfully', 'polite', 'normal');
    
    // Announce accessibility features
    this.announce('Accessibility features are now active', 'polite', 'normal');
  }

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Listen for form submissions
    document.addEventListener('submit', this._handleFormSubmit.bind(this));
    
    // Listen for focus changes
    document.addEventListener('focusin', this._handleFocusIn.bind(this));
    
    // Listen for errors
    window.addEventListener('error', this._handleError.bind(this));
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));
  }

  /**
   * Handle form submission
   */
  _handleFormSubmit(event) {
    this.announce('Form submitted', 'polite', 'normal');
  }

  /**
   * Handle focus in
   */
  _handleFocusIn(event) {
    const target = event.target;
    
    // Announce focused element
    if (target.getAttribute('aria-label')) {
      this.announce(target.getAttribute('aria-label'), 'polite', 'low');
    } else if (target.textContent.trim()) {
      this.announce(target.textContent.trim(), 'polite', 'low');
    }
  }

  /**
   * Handle error
   */
  _handleError(event) {
    this.announceError(event.message, event.filename);
  }

  /**
   * Handle visibility change
   */
  _handleVisibilityChange(event) {
    if (document.hidden) {
      this.announce('Page hidden', 'polite', 'low');
    } else {
      this.announce('Page visible', 'polite', 'low');
    }
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('submit', this._handleFormSubmit);
    document.removeEventListener('focusin', this._handleFocusIn);
    window.removeEventListener('error', this._handleError);
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
  }

  /**
   * Remove live regions
   */
  _removeLiveRegions() {
    this.liveRegions.forEach(liveRegion => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    });
    this.liveRegions.clear();
  }

  /**
   * Generate unique ID for element
   */
  _generateId(element) {
    if (element.id) {
      return element.id;
    }

    const prefix = element.tagName.toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const id = `${prefix}-${timestamp}-${random}`;
    
    element.id = id;
    return id;
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    return {
      screenReaderDetected: this.screenReaderDetected,
      liveRegions: {
        count: this.liveRegions.size,
        types: Array.from(this.liveRegions.keys())
      },
      ariaEnhancements: {
        count: this.ariaEnhancements.size
      },
      announcements: {
        count: this.announcements.length
      },
      wcagCompliant: true,
      israeliStandardCompliant: true
    };
  }

  /**
   * Get current settings
   */
  getCurrentSettings() {
    return {
      screenReaderDetected: this.screenReaderDetected,
      liveRegions: Array.from(this.liveRegions.keys()),
      ariaEnhancements: this.ariaEnhancements.size,
      announcements: this.announcements.length
    };
  }

  /**
   * Reset all settings
   */
  reset() {
    // Clear announcements
    this.announcements = [];
    
    // Clear live regions
    this.liveRegions.forEach(liveRegion => {
      liveRegion.textContent = '';
    });
    
    this.accessify.emit('screenReaderOptimizationReset');
  }
}

/**
 * Text-to-Speech Plugin
 * Enhanced text-to-speech functionality with advanced controls
 */

class TextToSpeechPlugin {
  constructor(accessify, config = {}) {
    this.accessify = accessify;
    this.config = config;
    this.isInitialized = false;
    this.speechSynthesis = null;
    this.currentUtterance = null;
    this.voiceQueue = [];
    this.isPlaying = false;
    this.isPaused = false;
    this.currentPosition = 0;
    this.totalLength = 0;
  }

  /**
   * Initialize the plugin
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Initialize speech synthesis
      this._initializeSpeechSynthesis();
      
      // Set up event listeners
      this._setupEventListeners();
      
      // Create UI controls
      this._createUIControls();

      this.isInitialized = true;
      this.accessify.emit('textToSpeechPluginInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Text-to-speech plugin initialization', 'plugin');
      throw error;
    }
  }

  /**
   * Destroy the plugin
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Stop speech
      this.stop();
      
      // Remove event listeners
      this._removeEventListeners();
      
      // Remove UI controls
      this._removeUIControls();

      this.isInitialized = false;
      this.accessify.emit('textToSpeechPluginDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Text-to-speech plugin destruction', 'plugin');
    }
  }

  /**
   * Initialize speech synthesis
   */
  _initializeSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    this.speechSynthesis = window.speechSynthesis;
    
    // Set up speech synthesis event listeners
    this.speechSynthesis.addEventListener('voiceschanged', () => {
      this.accessify.emit('voicesChanged', this.getAvailableVoices());
    });
  }

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Listen for text selection
    document.addEventListener('mouseup', this._handleTextSelection.bind(this));
    
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', this._handleKeyboardShortcuts.bind(this));
    
    // Listen for configuration changes
    this.accessify.on('configUpdated', this._handleConfigUpdate.bind(this));
  }

  /**
   * Handle text selection
   */
  _handleTextSelection(event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && this.config.autoSpeakOnSelection) {
      this.speak(selectedText);
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  _handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          if (event.shiftKey) {
            event.preventDefault();
            this.speak(document.body.textContent);
          }
          break;
        case 'p':
          event.preventDefault();
          if (this.isPlaying) {
            this.pause();
          } else if (this.isPaused) {
            this.resume();
          }
          break;
        case 'q':
          event.preventDefault();
          this.stop();
          break;
      }
    }
  }

  /**
   * Handle configuration update
   */
  _handleConfigUpdate(newConfig) {
    if (newConfig.reading && newConfig.reading.textToSpeech) {
      this.config = { ...this.config, ...newConfig.reading.textToSpeech };
    }
  }

  /**
   * Create UI controls
   */
  _createUIControls() {
    if (!this.config.showControls) {
      return;
    }

    // Create control panel
    this.controlPanel = document.createElement('div');
    this.controlPanel.className = 'accessify-tts-controls';
    this.controlPanel.setAttribute('aria-label', 'Text-to-speech controls');
    
    // Create play/pause button
    this.playButton = document.createElement('button');
    this.playButton.className = 'accessify-tts-play';
    this.playButton.setAttribute('aria-label', 'Play text-to-speech');
    this.playButton.innerHTML = '▶️';
    this.playButton.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else if (this.isPaused) {
        this.resume();
      } else {
        this.speak(document.body.textContent);
      }
    });
    
    // Create stop button
    this.stopButton = document.createElement('button');
    this.stopButton.className = 'accessify-tts-stop';
    this.stopButton.setAttribute('aria-label', 'Stop text-to-speech');
    this.stopButton.innerHTML = '⏹️';
    this.stopButton.addEventListener('click', () => this.stop());
    
    // Create rate control
    this.rateControl = document.createElement('input');
    this.rateControl.type = 'range';
    this.rateControl.min = '0.5';
    this.rateControl.max = '2.0';
    this.rateControl.step = '0.1';
    this.rateControl.value = this.config.rate || 1.0;
    this.rateControl.setAttribute('aria-label', 'Speech rate');
    this.rateControl.addEventListener('input', (e) => {
      this.setRate(parseFloat(e.target.value));
    });
    
    // Create volume control
    this.volumeControl = document.createElement('input');
    this.volumeControl.type = 'range';
    this.volumeControl.min = '0';
    this.volumeControl.max = '1';
    this.volumeControl.step = '0.1';
    this.volumeControl.value = this.config.volume || 1.0;
    this.volumeControl.setAttribute('aria-label', 'Speech volume');
    this.volumeControl.addEventListener('input', (e) => {
      this.setVolume(parseFloat(e.target.value));
    });
    
    // Create voice selector
    this.voiceSelector = document.createElement('select');
    this.voiceSelector.setAttribute('aria-label', 'Voice selection');
    this.voiceSelector.addEventListener('change', (e) => {
      this.setVoice(e.target.value);
    });
    
    // Populate voice selector
    this._populateVoiceSelector();
    
    // Assemble control panel
    this.controlPanel.appendChild(this.playButton);
    this.controlPanel.appendChild(this.stopButton);
    this.controlPanel.appendChild(this.rateControl);
    this.controlPanel.appendChild(this.volumeControl);
    this.controlPanel.appendChild(this.voiceSelector);
    
    // Add to page
    document.body.appendChild(this.controlPanel);
    
    // Add CSS
    this._addControlPanelCSS();
  }

  /**
   * Populate voice selector
   */
  _populateVoiceSelector() {
    const voices = this.getAvailableVoices();
    
    // Clear existing options
    this.voiceSelector.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'auto';
    defaultOption.textContent = 'Auto (System Default)';
    this.voiceSelector.appendChild(defaultOption);
    
    // Add voice options
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      this.voiceSelector.appendChild(option);
    });
  }

  /**
   * Add CSS for control panel
   */
  _addControlPanelCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-tts-controls {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 8px;
        display: flex;
        gap: 10px;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
      }
      
      .accessify-tts-controls button {
        background: #0066cc;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }
      
      .accessify-tts-controls button:hover {
        background: #0052a3;
      }
      
      .accessify-tts-controls button:disabled {
        background: #666;
        cursor: not-allowed;
      }
      
      .accessify-tts-controls input[type="range"] {
        width: 80px;
      }
      
      .accessify-tts-controls select {
        background: white;
        color: black;
        border: 1px solid #ccc;
        padding: 4px;
        border-radius: 4px;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove UI controls
   */
  _removeUIControls() {
    if (this.controlPanel && this.controlPanel.parentNode) {
      this.controlPanel.parentNode.removeChild(this.controlPanel);
    }
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('mouseup', this._handleTextSelection);
    document.removeEventListener('keydown', this._handleKeyboardShortcuts);
  }

  /**
   * Speak text
   */
  speak(text, options = {}) {
    if (!this.speechSynthesis) {
      throw new Error('Speech synthesis not available');
    }

    // Stop current speech
    this.stop();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate || this.config.rate || 1.0;
    utterance.pitch = options.pitch || this.config.pitch || 1.0;
    utterance.volume = options.volume || this.config.volume || 1.0;
    
    // Set voice
    if (options.voice || this.config.voice !== 'auto') {
      const voice = this._getVoice(options.voice || this.config.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Set up event listeners
    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this._updatePlayButton();
      this.accessify.emit('speechStarted', utterance);
    };
    
    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this._updatePlayButton();
      this.accessify.emit('speechEnded', utterance);
      this.currentUtterance = null;
    };
    
    utterance.onerror = (event) => {
      this.isPlaying = false;
      this.isPaused = false;
      this._updatePlayButton();
      this.accessify.emit('speechError', event);
      this.currentUtterance = null;
    };

    // Speak
    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.pause();
      this.isPaused = true;
      this.isPlaying = false;
      this._updatePlayButton();
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.speechSynthesis && this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
      this.isPlaying = true;
      this.isPaused = false;
      this._updatePlayButton();
    }
  }

  /**
   * Stop speech
   */
  stop() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this._updatePlayButton();
  }

  /**
   * Set speech rate
   */
  setRate(rate) {
    this.config.rate = rate;
    if (this.rateControl) {
      this.rateControl.value = rate;
    }
  }

  /**
   * Set speech volume
   */
  setVolume(volume) {
    this.config.volume = volume;
    if (this.volumeControl) {
      this.volumeControl.value = volume;
    }
  }

  /**
   * Set voice
   */
  setVoice(voiceName) {
    this.config.voice = voiceName;
    if (this.voiceSelector) {
      this.voiceSelector.value = voiceName;
    }
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    if (!this.speechSynthesis) {
      return [];
    }

    return this.speechSynthesis.getVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService
    }));
  }

  /**
   * Get voice by name or language
   */
  _getVoice(voiceName) {
    if (!this.speechSynthesis) {
      return null;
    }

    const voices = this.speechSynthesis.getVoices();
    
    // Try to find by name
    let voice = voices.find(v => v.name === voiceName);
    
    // Try to find by language
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(voiceName));
    }
    
    // Try to find default voice
    if (!voice) {
      voice = voices.find(v => v.default);
    }
    
    return voice;
  }

  /**
   * Update play button
   */
  _updatePlayButton() {
    if (!this.playButton) {
      return;
    }

    if (this.isPlaying) {
      this.playButton.innerHTML = '⏸️';
      this.playButton.setAttribute('aria-label', 'Pause text-to-speech');
    } else if (this.isPaused) {
      this.playButton.innerHTML = '▶️';
      this.playButton.setAttribute('aria-label', 'Resume text-to-speech');
    } else {
      this.playButton.innerHTML = '▶️';
      this.playButton.setAttribute('aria-label', 'Play text-to-speech');
    }
  }

  /**
   * Get plugin status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentUtterance: this.currentUtterance,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Voice Commands Plugin
 * Advanced voice command recognition and processing
 */

class VoiceCommandsPlugin {
  constructor(accessify, config = {}) {
    this.accessify = accessify;
    this.config = config;
    this.isInitialized = false;
    this.voiceRecognition = null;
    this.isListening = false;
    this.commands = new Map();
    this.recognitionTimeout = null;
    this.lastCommandTime = 0;
  }

  /**
   * Initialize the plugin
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Check for speech recognition support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser');
      }

      // Initialize speech recognition
      this._initializeSpeechRecognition();
      
      // Set up default commands
      this._setupDefaultCommands();
      
      // Set up event listeners
      this._setupEventListeners();
      
      // Create UI controls
      this._createUIControls();

      this.isInitialized = true;
      this.accessify.emit('voiceCommandsPluginInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Voice commands plugin initialization', 'plugin');
      throw error;
    }
  }

  /**
   * Destroy the plugin
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Stop listening
      this.stopListening();
      
      // Remove event listeners
      this._removeEventListeners();
      
      // Remove UI controls
      this._removeUIControls();

      this.isInitialized = false;
      this.accessify.emit('voiceCommandsPluginDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Voice commands plugin destruction', 'plugin');
    }
  }

  /**
   * Initialize speech recognition
   */
  _initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.voiceRecognition = new SpeechRecognition();
    
    // Configure speech recognition
    this.voiceRecognition.continuous = this.config.continuous || true;
    this.voiceRecognition.interimResults = this.config.interimResults || false;
    this.voiceRecognition.lang = this.config.language || this.accessify.configManager.get('language', 'en-US');
    this.voiceRecognition.maxAlternatives = this.config.maxAlternatives || 1;
    
    // Set up event listeners
    this.voiceRecognition.onstart = () => {
      this.isListening = true;
      this._updateListenButton();
      this.accessify.emit('voiceRecognitionStarted');
    };
    
    this.voiceRecognition.onresult = (event) => {
      this._handleRecognitionResult(event);
    };
    
    this.voiceRecognition.onerror = (event) => {
      this._handleRecognitionError(event);
    };
    
    this.voiceRecognition.onend = () => {
      this.isListening = false;
      this._updateListenButton();
      this.accessify.emit('voiceRecognitionEnded');
      
      // Restart if continuous mode
      if (this.config.continuous && this.config.autoRestart) {
        setTimeout(() => {
          if (this.config.autoRestart) {
            this.startListening();
          }
        }, 1000);
      }
    };
  }

  /**
   * Set up default commands
   */
  _setupDefaultCommands() {
    // Navigation commands
    this.registerCommand('scroll up', () => {
      window.scrollBy(0, -100);
    });
    
    this.registerCommand('scroll down', () => {
      window.scrollBy(0, 100);
    });
    
    this.registerCommand('scroll left', () => {
      window.scrollBy(-100, 0);
    });
    
    this.registerCommand('scroll right', () => {
      window.scrollBy(100, 0);
    });
    
    this.registerCommand('go back', () => {
      if (window.history.length > 1) {
        window.history.back();
      }
    });
    
    this.registerCommand('go forward', () => {
      if (window.history.length > 1) {
        window.history.forward();
      }
    });
    
    // Accessibility commands
    this.registerCommand('increase text size', () => {
      this.accessify.visual.increaseTextSize();
    });
    
    this.registerCommand('decrease text size', () => {
      this.accessify.visual.decreaseTextSize();
    });
    
    this.registerCommand('toggle contrast', () => {
      this.accessify.visual.toggleContrastMode();
    });
    
    this.registerCommand('toggle high contrast', () => {
      this.accessify.visual.setContrastMode('high');
    });
    
    this.registerCommand('toggle dark mode', () => {
      this.accessify.visual.setTheme('dark');
    });
    
    this.registerCommand('toggle light mode', () => {
      this.accessify.visual.setTheme('light');
    });
    
    // Text-to-speech commands
    this.registerCommand('speak page', () => {
      const text = document.body.textContent;
      this.accessify.reading.speak(text);
    });
    
    this.registerCommand('speak selection', () => {
      const selection = window.getSelection();
      if (selection.toString().trim()) {
        this.accessify.reading.speak(selection.toString());
      }
    });
    
    this.registerCommand('stop speaking', () => {
      this.accessify.reading.stop();
    });
    
    this.registerCommand('pause speaking', () => {
      this.accessify.reading.pause();
    });
    
    this.registerCommand('resume speaking', () => {
      this.accessify.reading.resume();
    });
    
    // Voice command controls
    this.registerCommand('start listening', () => {
      this.startListening();
    });
    
    this.registerCommand('stop listening', () => {
      this.stopListening();
    });
    
    this.registerCommand('toggle listening', () => {
      if (this.isListening) {
        this.stopListening();
      } else {
        this.startListening();
      }
    });
  }

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', this._handleKeyboardShortcuts.bind(this));
    
    // Listen for configuration changes
    this.accessify.on('configUpdated', this._handleConfigUpdate.bind(this));
  }

  /**
   * Handle keyboard shortcuts
   */
  _handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'v':
          if (event.shiftKey) {
            event.preventDefault();
            this.toggleListening();
          }
          break;
      }
    }
  }

  /**
   * Handle configuration update
   */
  _handleConfigUpdate(newConfig) {
    if (newConfig.motor && newConfig.motor.voice) {
      this.config = { ...this.config, ...newConfig.motor.voice };
    }
  }

  /**
   * Create UI controls
   */
  _createUIControls() {
    if (!this.config.showControls) {
      return;
    }

    // Create control panel
    this.controlPanel = document.createElement('div');
    this.controlPanel.className = 'accessify-voice-controls';
    this.controlPanel.setAttribute('aria-label', 'Voice command controls');
    
    // Create listen button
    this.listenButton = document.createElement('button');
    this.listenButton.className = 'accessify-voice-listen';
    this.listenButton.setAttribute('aria-label', 'Start voice commands');
    this.listenButton.innerHTML = '🎤';
    this.listenButton.addEventListener('click', () => this.toggleListening());
    
    // Create status indicator
    this.statusIndicator = document.createElement('div');
    this.statusIndicator.className = 'accessify-voice-status';
    this.statusIndicator.textContent = 'Voice commands ready';
    
    // Create command list
    this.commandList = document.createElement('div');
    this.commandList.className = 'accessify-voice-commands';
    this.commandList.innerHTML = '<h4>Available Commands:</h4>';
    
    // Populate command list
    this._populateCommandList();
    
    // Assemble control panel
    this.controlPanel.appendChild(this.listenButton);
    this.controlPanel.appendChild(this.statusIndicator);
    this.controlPanel.appendChild(this.commandList);
    
    // Add to page
    document.body.appendChild(this.controlPanel);
    
    // Add CSS
    this._addControlPanelCSS();
  }

  /**
   * Populate command list
   */
  _populateCommandList() {
    const commandGroups = {
      'Navigation': ['scroll up', 'scroll down', 'go back', 'go forward'],
      'Accessibility': ['increase text size', 'decrease text size', 'toggle contrast', 'toggle high contrast'],
      'Text-to-Speech': ['speak page', 'speak selection', 'stop speaking', 'pause speaking'],
      'Voice Controls': ['start listening', 'stop listening', 'toggle listening']
    };
    
    Object.entries(commandGroups).forEach(([group, commands]) => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'accessify-voice-group';
      
      const groupTitle = document.createElement('h5');
      groupTitle.textContent = group;
      groupDiv.appendChild(groupTitle);
      
      const commandUl = document.createElement('ul');
      commands.forEach(command => {
        const li = document.createElement('li');
        li.textContent = command;
        commandUl.appendChild(li);
      });
      groupDiv.appendChild(commandUl);
      
      this.commandList.appendChild(groupDiv);
    });
  }

  /**
   * Add CSS for control panel
   */
  _addControlPanelCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-voice-controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        max-width: 300px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
      }
      
      .accessify-voice-listen {
        background: #0066cc;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        margin-bottom: 10px;
        transition: all 0.3s ease;
      }
      
      .accessify-voice-listen:hover {
        background: #0052a3;
      }
      
      .accessify-voice-listen.listening {
        background: #ff4444;
        animation: pulse 1s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .accessify-voice-status {
        margin-bottom: 10px;
        font-weight: bold;
        color: #00ff00;
      }
      
      .accessify-voice-commands h4 {
        margin: 0 0 10px 0;
        color: #ffcc00;
      }
      
      .accessify-voice-group {
        margin-bottom: 10px;
      }
      
      .accessify-voice-group h5 {
        margin: 0 0 5px 0;
        color: #ffcc00;
        font-size: 12px;
      }
      
      .accessify-voice-group ul {
        margin: 0;
        padding-left: 15px;
        font-size: 11px;
      }
      
      .accessify-voice-group li {
        margin-bottom: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove UI controls
   */
  _removeUIControls() {
    if (this.controlPanel && this.controlPanel.parentNode) {
      this.controlPanel.parentNode.removeChild(this.controlPanel);
    }
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('keydown', this._handleKeyboardShortcuts);
  }

  /**
   * Register a voice command
   */
  registerCommand(command, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Command callback must be a function');
    }

    this.commands.set(command.toLowerCase(), callback);
    this.accessify.emit('voiceCommandRegistered', command);
  }

  /**
   * Unregister a voice command
   */
  unregisterCommand(command) {
    this.commands.delete(command.toLowerCase());
    this.accessify.emit('voiceCommandUnregistered', command);
  }

  /**
   * Start listening for voice commands
   */
  startListening() {
    if (!this.voiceRecognition) {
      throw new Error('Voice recognition not initialized');
    }

    if (this.isListening) {
      return;
    }

    try {
      this.voiceRecognition.start();
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Failed to start voice recognition', 'plugin');
    }
  }

  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (!this.voiceRecognition) {
      return;
    }

    if (this.isListening) {
      this.voiceRecognition.stop();
    }
  }

  /**
   * Toggle listening state
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Handle recognition result
   */
  _handleRecognitionResult(event) {
    const result = event.results[event.results.length - 1];
    if (result.isFinal) {
      const transcript = result[0].transcript.toLowerCase().trim();
      this._processCommand(transcript);
    }
  }

  /**
   * Process voice command
   */
  _processCommand(transcript) {
    // Update status
    this._updateStatus(`Heard: "${transcript}"`);
    
    // Emit command event
    this.accessify.emit('voiceCommand', transcript);
    
    // Find matching command
    const command = this._findMatchingCommand(transcript);
    
    if (command) {
      try {
        command.callback();
        this._updateStatus(`Executed: "${command.name}"`);
        this.accessify.emit('voiceCommandExecuted', command.name);
      } catch (error) {
        this.accessify.errorHandler.handle(error, `Failed to execute command: ${command.name}`, 'plugin');
        this._updateStatus(`Error executing: "${command.name}"`);
      }
    } else {
      this._updateStatus(`Unknown command: "${transcript}"`);
      this.accessify.emit('voiceCommandUnknown', transcript);
    }
  }

  /**
   * Find matching command
   */
  _findMatchingCommand(transcript) {
    // Exact match
    if (this.commands.has(transcript)) {
      return { name: transcript, callback: this.commands.get(transcript) };
    }
    
    // Partial match
    for (const [command, callback] of this.commands) {
      if (transcript.includes(command) || command.includes(transcript)) {
        return { name: command, callback };
      }
    }
    
    return null;
  }

  /**
   * Handle recognition error
   */
  _handleRecognitionError(event) {
    this._updateStatus(`Error: ${event.error}`);
    this.accessify.emit('voiceRecognitionError', event);
    
    // Handle specific errors
    switch (event.error) {
      case 'no-speech':
        this._updateStatus('No speech detected');
        break;
      case 'audio-capture':
        this._updateStatus('Microphone not available');
        break;
      case 'not-allowed':
        this._updateStatus('Microphone permission denied');
        break;
      case 'network':
        this._updateStatus('Network error');
        break;
      default:
        this._updateStatus(`Recognition error: ${event.error}`);
    }
  }

  /**
   * Update status indicator
   */
  _updateStatus(message) {
    if (this.statusIndicator) {
      this.statusIndicator.textContent = message;
    }
  }

  /**
   * Update listen button
   */
  _updateListenButton() {
    if (!this.listenButton) {
      return;
    }

    if (this.isListening) {
      this.listenButton.classList.add('listening');
      this.listenButton.setAttribute('aria-label', 'Stop voice commands');
    } else {
      this.listenButton.classList.remove('listening');
      this.listenButton.setAttribute('aria-label', 'Start voice commands');
    }
  }

  /**
   * Get plugin status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isListening: this.isListening,
      commands: Array.from(this.commands.keys()),
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Update speech recognition settings
    if (this.voiceRecognition) {
      this.voiceRecognition.continuous = this.config.continuous || true;
      this.voiceRecognition.interimResults = this.config.interimResults || false;
      this.voiceRecognition.lang = this.config.language || this.accessify.configManager.get('language', 'en-US');
    }
  }
}

/**
 * Switch Navigation Plugin
 * Alternative input device support and switch navigation
 */

class SwitchNavigationPlugin {
  constructor(accessify, config = {}) {
    this.accessify = accessify;
    this.config = config;
    this.isInitialized = false;
    this.switchElements = [];
    this.currentIndex = 0;
    this.scanInterval = null;
    this.isScanning = false;
    this.scanSpeed = 1000; // milliseconds
    this.activationTimeout = null;
    this.activationDelay = 2000; // milliseconds
  }

  /**
   * Initialize the plugin
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Set up switch navigation
      this._setupSwitchNavigation();
      
      // Set up keyboard alternatives
      this._setupKeyboardAlternatives();
      
      // Set up event listeners
      this._setupEventListeners();
      
      // Create UI controls
      this._createUIControls();

      this.isInitialized = true;
      this.accessify.emit('switchNavigationPluginInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Switch navigation plugin initialization', 'plugin');
      throw error;
    }
  }

  /**
   * Destroy the plugin
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Stop scanning
      this.stopScanning();
      
      // Remove event listeners
      this._removeEventListeners();
      
      // Remove UI controls
      this._removeUIControls();

      this.isInitialized = false;
      this.accessify.emit('switchNavigationPluginDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Switch navigation plugin destruction', 'plugin');
    }
  }

  /**
   * Set up switch navigation
   */
  _setupSwitchNavigation() {
    // Find all interactive elements
    this._findInteractiveElements();
    
    // Set up scanning
    this._setupScanning();
  }

  /**
   * Find interactive elements
   */
  _findInteractiveElements() {
    const selectors = [
      'button',
      'a[href]',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="option"]'
    ];
    
    this.switchElements = Array.from(document.querySelectorAll(selectors.join(', ')))
      .filter(element => {
        // Filter out hidden elements
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               !element.hasAttribute('aria-hidden');
      });
    
    this.accessify.emit('switchElementsFound', this.switchElements.length);
  }

  /**
   * Set up scanning
   */
  _setupScanning() {
    // Set up scan indicators
    this._setupScanIndicators();
  }

  /**
   * Set up scan indicators
   */
  _setupScanIndicators() {
    // Add CSS for scan indicators
    this._addScanIndicatorCSS();
  }

  /**
   * Add CSS for scan indicators
   */
  _addScanIndicatorCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-scan-indicator {
        position: absolute;
        border: 3px solid #ff0000;
        background: rgba(255, 0, 0, 0.1);
        pointer-events: none;
        z-index: 10000;
        transition: all 0.3s ease;
        border-radius: 4px;
      }
      
      .accessify-scan-indicator::before {
        content: '';
        position: absolute;
        top: -6px;
        left: -6px;
        right: -6px;
        bottom: -6px;
        border: 1px solid rgba(255, 0, 0, 0.3);
        border-radius: 7px;
        pointer-events: none;
      }
      
      .accessify-scan-indicator.active {
        border-color: #00ff00;
        background: rgba(0, 255, 0, 0.1);
        animation: scanPulse 1s infinite;
      }
      
      @keyframes scanPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Set up keyboard alternatives
   */
  _setupKeyboardAlternatives() {
    // Set up keyboard event listeners for switch navigation
    document.addEventListener('keydown', this._handleKeyboardInput.bind(this));
  }

  /**
   * Handle keyboard input
   */
  _handleKeyboardInput(event) {
    // Check if switch navigation is enabled
    if (!this.config.enabled) {
      return;
    }

    // Handle switch navigation keys
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (this.isScanning) {
          event.preventDefault();
          this.activateCurrentElement();
        }
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        if (this.isScanning) {
          event.preventDefault();
          this.nextElement();
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        if (this.isScanning) {
          event.preventDefault();
          this.previousElement();
        }
        break;
      case 'Escape':
        if (this.isScanning) {
          event.preventDefault();
          this.stopScanning();
        }
        break;
    }
  }

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Listen for DOM changes to update switch elements
    const observer = new MutationObserver(() => {
      this._findInteractiveElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'role', 'aria-hidden']
    });
    
    // Listen for configuration changes
    this.accessify.on('configUpdated', this._handleConfigUpdate.bind(this));
  }

  /**
   * Handle configuration update
   */
  _handleConfigUpdate(newConfig) {
    if (newConfig.motor && newConfig.motor.switchNavigation) {
      this.config = { ...this.config, ...newConfig.motor.switchNavigation };
    }
  }

  /**
   * Create UI controls
   */
  _createUIControls() {
    if (!this.config.showControls) {
      return;
    }

    // Create control panel
    this.controlPanel = document.createElement('div');
    this.controlPanel.className = 'accessify-switch-controls';
    this.controlPanel.setAttribute('aria-label', 'Switch navigation controls');
    
    // Create start/stop button
    this.scanButton = document.createElement('button');
    this.scanButton.className = 'accessify-switch-scan';
    this.scanButton.setAttribute('aria-label', 'Start switch navigation');
    this.scanButton.textContent = 'Start Switch Navigation';
    this.scanButton.addEventListener('click', () => this.toggleScanning());
    
    // Create speed control
    this.speedControl = document.createElement('input');
    this.speedControl.type = 'range';
    this.speedControl.min = '500';
    this.speedControl.max = '3000';
    this.speedControl.step = '100';
    this.speedControl.value = this.scanSpeed;
    this.speedControl.setAttribute('aria-label', 'Scan speed');
    this.speedControl.addEventListener('input', (e) => {
      this.setScanSpeed(parseInt(e.target.value));
    });
    
    // Create speed label
    this.speedLabel = document.createElement('label');
    this.speedLabel.textContent = `Scan Speed: ${this.scanSpeed}ms`;
    
    // Create status indicator
    this.statusIndicator = document.createElement('div');
    this.statusIndicator.className = 'accessify-switch-status';
    this.statusIndicator.textContent = 'Switch navigation ready';
    
    // Create instructions
    this.instructions = document.createElement('div');
    this.instructions.className = 'accessify-switch-instructions';
    this.instructions.innerHTML = `
      <h4>Switch Navigation Instructions:</h4>
      <ul>
        <li>Use arrow keys to navigate between elements</li>
        <li>Press Enter or Space to activate the current element</li>
        <li>Press Escape to stop scanning</li>
        <li>Adjust scan speed with the slider</li>
      </ul>
    `;
    
    // Assemble control panel
    this.controlPanel.appendChild(this.scanButton);
    this.controlPanel.appendChild(this.speedControl);
    this.controlPanel.appendChild(this.speedLabel);
    this.controlPanel.appendChild(this.statusIndicator);
    this.controlPanel.appendChild(this.instructions);
    
    // Add to page
    document.body.appendChild(this.controlPanel);
    
    // Add CSS
    this._addControlPanelCSS();
  }

  /**
   * Add CSS for control panel
   */
  _addControlPanelCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-switch-controls {
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        max-width: 300px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
      }
      
      .accessify-switch-scan {
        background: #0066cc;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 10px;
        width: 100%;
      }
      
      .accessify-switch-scan:hover {
        background: #0052a3;
      }
      
      .accessify-switch-scan.scanning {
        background: #ff4444;
      }
      
      .accessify-switch-controls input[type="range"] {
        width: 100%;
        margin: 10px 0;
      }
      
      .accessify-switch-status {
        margin: 10px 0;
        font-weight: bold;
        color: #00ff00;
      }
      
      .accessify-switch-instructions h4 {
        margin: 0 0 10px 0;
        color: #ffcc00;
      }
      
      .accessify-switch-instructions ul {
        margin: 0;
        padding-left: 15px;
        font-size: 12px;
      }
      
      .accessify-switch-instructions li {
        margin-bottom: 5px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove UI controls
   */
  _removeUIControls() {
    if (this.controlPanel && this.controlPanel.parentNode) {
      this.controlPanel.parentNode.removeChild(this.controlPanel);
    }
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('keydown', this._handleKeyboardInput);
  }

  /**
   * Start scanning
   */
  startScanning() {
    if (this.isScanning) {
      return;
    }

    if (this.switchElements.length === 0) {
      this._updateStatus('No interactive elements found');
      return;
    }

    this.isScanning = true;
    this.currentIndex = 0;
    
    // Start scan interval
    this.scanInterval = setInterval(() => {
      this._highlightCurrentElement();
    }, this.scanSpeed);
    
    // Highlight first element
    this._highlightCurrentElement();
    
    this._updateStatus(`Scanning ${this.switchElements.length} elements`);
    this._updateScanButton();
    
    this.accessify.emit('switchScanningStarted');
  }

  /**
   * Stop scanning
   */
  stopScanning() {
    if (!this.isScanning) {
      return;
    }

    this.isScanning = false;
    
    // Clear scan interval
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    
    // Clear activation timeout
    if (this.activationTimeout) {
      clearTimeout(this.activationTimeout);
      this.activationTimeout = null;
    }
    
    // Remove scan indicators
    this._removeScanIndicators();
    
    this._updateStatus('Switch navigation stopped');
    this._updateScanButton();
    
    this.accessify.emit('switchScanningStopped');
  }

  /**
   * Toggle scanning
   */
  toggleScanning() {
    if (this.isScanning) {
      this.stopScanning();
    } else {
      this.startScanning();
    }
  }

  /**
   * Move to next element
   */
  nextElement() {
    if (!this.isScanning) {
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % this.switchElements.length;
    this._highlightCurrentElement();
  }

  /**
   * Move to previous element
   */
  previousElement() {
    if (!this.isScanning) {
      return;
    }

    this.currentIndex = this.currentIndex === 0 ? 
      this.switchElements.length - 1 : 
      this.currentIndex - 1;
    this._highlightCurrentElement();
  }

  /**
   * Activate current element
   */
  activateCurrentElement() {
    if (!this.isScanning || this.currentIndex >= this.switchElements.length) {
      return;
    }

    const element = this.switchElements[this.currentIndex];
    
    // Clear any existing activation timeout
    if (this.activationTimeout) {
      clearTimeout(this.activationTimeout);
    }
    
    // Set activation timeout
    this.activationTimeout = setTimeout(() => {
      this._performActivation(element);
    }, this.activationDelay);
    
    this._updateStatus(`Activating in ${this.activationDelay}ms...`);
  }

  /**
   * Perform element activation
   */
  _performActivation(element) {
    try {
      // Focus the element
      element.focus();
      
      // Activate the element
      if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
        element.click();
      } else if (element.tagName === 'A') {
        element.click();
      } else if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
        element.focus();
      } else if (element.getAttribute('tabindex') === '0') {
        element.click();
      }
      
      this._updateStatus(`Activated: ${this._getElementDescription(element)}`);
      this.accessify.emit('switchElementActivated', element);
      
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Failed to activate switch element', 'plugin');
    }
  }

  /**
   * Highlight current element
   */
  _highlightCurrentElement() {
    // Remove existing indicators
    this._removeScanIndicators();
    
    if (this.currentIndex >= this.switchElements.length) {
      return;
    }

    const element = this.switchElements[this.currentIndex];
    const rect = element.getBoundingClientRect();
    
    // Create scan indicator
    const indicator = document.createElement('div');
    indicator.className = 'accessify-scan-indicator';
    indicator.style.top = `${rect.top + window.scrollY}px`;
    indicator.style.left = `${rect.left + window.scrollX}px`;
    indicator.style.width = `${rect.width}px`;
    indicator.style.height = `${rect.height}px`;
    
    // Add to page
    document.body.appendChild(indicator);
    
    // Update status
    this._updateStatus(`Element ${this.currentIndex + 1} of ${this.switchElements.length}: ${this._getElementDescription(element)}`);
  }

  /**
   * Remove scan indicators
   */
  _removeScanIndicators() {
    const indicators = document.querySelectorAll('.accessify-scan-indicator');
    indicators.forEach(indicator => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    });
  }

  /**
   * Get element description
   */
  _getElementDescription(element) {
    // Try to get accessible name
    const accessibleName = element.getAttribute('aria-label') || 
                          element.getAttribute('title') || 
                          element.textContent?.trim() || 
                          element.getAttribute('alt') ||
                          element.getAttribute('placeholder') ||
                          element.tagName.toLowerCase();
    
    return accessibleName || 'Unknown element';
  }

  /**
   * Set scan speed
   */
  setScanSpeed(speed) {
    this.scanSpeed = speed;
    if (this.speedLabel) {
      this.speedLabel.textContent = `Scan Speed: ${speed}ms`;
    }
    
    // Restart scanning with new speed if currently scanning
    if (this.isScanning) {
      this.stopScanning();
      this.startScanning();
    }
  }

  /**
   * Update status indicator
   */
  _updateStatus(message) {
    if (this.statusIndicator) {
      this.statusIndicator.textContent = message;
    }
  }

  /**
   * Update scan button
   */
  _updateScanButton() {
    if (!this.scanButton) {
      return;
    }

    if (this.isScanning) {
      this.scanButton.textContent = 'Stop Switch Navigation';
      this.scanButton.classList.add('scanning');
      this.scanButton.setAttribute('aria-label', 'Stop switch navigation');
    } else {
      this.scanButton.textContent = 'Start Switch Navigation';
      this.scanButton.classList.remove('scanning');
      this.scanButton.setAttribute('aria-label', 'Start switch navigation');
    }
  }

  /**
   * Get plugin status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isScanning: this.isScanning,
      currentIndex: this.currentIndex,
      totalElements: this.switchElements.length,
      scanSpeed: this.scanSpeed,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Accessify - Modular Web Accessibility Toolkit
 * 
 * A comprehensive accessibility library supporting WCAG 2.0/2.1 AA and Israeli Standard 5568
 * with full RTL support and multilingual capabilities.
 */


/**
 * Main Accessify class
 */
class Accessify {
  constructor(options = {}) {
    this.version = '1.0.0';
    this.isInitialized = false;
    
    // Initialize core systems
    this.eventEmitter = new EventEmitter();
    this.stateManager = new StateManager();
    this.configManager = new ConfigManager(options);
    this.pluginManager = new PluginManager(this);
    this.browserDetection = new BrowserDetection();
    this.errorHandler = new ErrorHandler();
    
    // Initialize components
    this.visual = new VisualAccessibility(this);
    this.navigation = new NavigationAccessibility(this);
    this.reading = new ReadingAccessibility(this);
    this.motor = new MotorAccessibility(this);
    this.multilingual = new MultilingualSupport(this);
    this.aria = new ARIAEnhancement(this);
    this.readingGuide = new ReadingGuide(this);
    this.screenReader = new ScreenReaderOptimization(this);
    
    // Register built-in plugins
    this._registerBuiltInPlugins();
    
    // Bind methods
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.emit = this.emit.bind(this);
  }

  /**
   * Initialize Accessify
   */
  async init() {
    try {
      if (this.isInitialized) {
        console.warn('Accessify is already initialized');
        return this;
      }

      // Check browser compatibility
      if (!this.browserDetection.isSupported) {
        throw new Error('Browser not supported. Please use Chrome 60+, Firefox 55+, Safari 12+, or Edge 79+');
      }

      // Initialize components in order
      await this.multilingual.init();
      await this.visual.init();
      await this.navigation.init();
      await this.reading.init();
      await this.motor.init();
      await this.aria.init();
      await this.readingGuide.init();
      await this.screenReader.init();
      
      // Initialize plugins
      await this.pluginManager.init();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('Accessify initialized successfully');
      return this;
    } catch (error) {
      this.errorHandler.handle(error, 'Initialization failed');
      throw error;
    }
  }

  /**
   * Destroy Accessify instance
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return this;
      }

      // Destroy components in reverse order
      this.screenReader.destroy();
      this.readingGuide.destroy();
      this.aria.destroy();
      this.motor.destroy();
      this.reading.destroy();
      this.navigation.destroy();
      this.visual.destroy();
      this.multilingual.destroy();
      
      // Destroy plugins
      this.pluginManager.destroy();
      
      // Clean up core systems
      this.eventEmitter.removeAllListeners();
      this.stateManager.clear();
      
      this.isInitialized = false;
      this.emit('destroyed');
      
      console.log('Accessify destroyed');
    } catch (error) {
      this.errorHandler.handle(error, 'Destruction failed');
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.configManager.update(newConfig);
    this.emit('configUpdated', newConfig);
  }

  /**
   * Get current state
   */
  getState() {
    return this.stateManager.getState();
  }

  /**
   * Set state
   */
  setState(newState) {
    this.stateManager.setState(newState);
    this.emit('stateChanged', newState);
  }

  /**
   * Event system methods
   */
  on(event, callback) {
    this.eventEmitter.on(event, callback);
    return this;
  }

  off(event, callback) {
    this.eventEmitter.off(event, callback);
    return this;
  }

  emit(event, ...args) {
    this.eventEmitter.emit(event, ...args);
    return this;
  }

  /**
   * Register built-in plugins
   */
  _registerBuiltInPlugins() {
    this.pluginManager.register('textToSpeech', TextToSpeechPlugin);
    this.pluginManager.register('voiceCommands', VoiceCommandsPlugin);
    this.pluginManager.register('switchNavigation', SwitchNavigationPlugin);
  }

  /**
   * Get component by name
   */
  getComponent(name) {
    const components = {
      visual: this.visual,
      navigation: this.navigation,
      reading: this.reading,
      motor: this.motor,
      multilingual: this.multilingual,
      aria: this.aria,
      readingGuide: this.readingGuide,
      screenReader: this.screenReader
    };
    return components[name];
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature) {
    return this.configManager.isFeatureEnabled(feature);
  }

  /**
   * Enable feature
   */
  enableFeature(feature) {
    this.configManager.enableFeature(feature);
    this.emit('featureEnabled', feature);
  }

  /**
   * Disable feature
   */
  disableFeature(feature) {
    this.configManager.disableFeature(feature);
    this.emit('featureDisabled', feature);
  }

  /**
   * Get accessibility compliance status
   */
  getComplianceStatus() {
    return {
      wcag: this._checkWCAGCompliance(),
      israeliStandard: this._checkIsraeliStandardCompliance(),
      features: this._getFeatureCompliance()
    };
  }

  /**
   * Check WCAG compliance
   */
  _checkWCAGCompliance() {
    const features = this.configManager.getEnabledFeatures();
    return {
      level: 'AA',
      version: '2.1',
      compliant: this._validateWCAGFeatures(features),
      score: this._calculateWCAGScore(features)
    };
  }

  /**
   * Check Israeli Standard 5568 compliance
   */
  _checkIsraeliStandardCompliance() {
    const features = this.configManager.getEnabledFeatures();
    return {
      compliant: this._validateIsraeliStandardFeatures(features),
      score: this._calculateIsraeliStandardScore(features)
    };
  }

  /**
   * Get feature compliance details
   */
  _getFeatureCompliance() {
    return {
      visual: this.visual.getComplianceStatus(),
      navigation: this.navigation.getComplianceStatus(),
      reading: this.reading.getComplianceStatus(),
      motor: this.motor.getComplianceStatus(),
      multilingual: this.multilingual.getComplianceStatus(),
      aria: this.aria.getComplianceStatus(),
      readingGuide: this.readingGuide.getComplianceStatus(),
      screenReader: this.screenReader.getComplianceStatus()
    };
  }

  /**
   * Validate WCAG features
   */
  _validateWCAGFeatures(features) {
    const requiredFeatures = [
      'textSizeAdjustment',
      'highContrast',
      'keyboardNavigation',
      'focusIndicators',
      'skipLinks',
      'altText'
    ];
    return requiredFeatures.every(feature => features.includes(feature));
  }

  /**
   * Calculate WCAG compliance score
   */
  _calculateWCAGScore(features) {
    const totalFeatures = 20; // Total WCAG features
    const enabledFeatures = features.length;
    return Math.round((enabledFeatures / totalFeatures) * 100);
  }

  /**
   * Validate Israeli Standard features
   */
  _validateIsraeliStandardFeatures(features) {
    const requiredFeatures = [
      'rtlSupport',
      'hebrewSupport',
      'textSizeAdjustment',
      'highContrast',
      'keyboardNavigation'
    ];
    return requiredFeatures.every(feature => features.includes(feature));
  }

  /**
   * Calculate Israeli Standard compliance score
   */
  _calculateIsraeliStandardScore(features) {
    const totalFeatures = 15; // Total Israeli Standard features
    const enabledFeatures = features.length;
    return Math.round((enabledFeatures / totalFeatures) * 100);
  }
}

// Global assignment for UMD builds - ensure it's available immediately
if (typeof window !== 'undefined') {
  window.Accessify = Accessify;
}

module.exports = Accessify;
//# sourceMappingURL=accessify.cjs.js.map
