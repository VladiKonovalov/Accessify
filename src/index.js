/**
 * Accessify - Modular Web Accessibility Toolkit
 * 
 * A comprehensive accessibility library supporting WCAG 2.0/2.1 AA and Israeli Standard 5568
 * with full RTL support and multilingual capabilities.
 */

import { EventEmitter } from './utils/EventEmitter.js';
import { StateManager } from './utils/StateManager.js';
import { ConfigManager } from './utils/ConfigManager.js';
import { PluginManager } from './utils/PluginManager.js';
import { BrowserDetection } from './utils/BrowserDetection.js';
import { ErrorHandler } from './utils/ErrorHandler.js';

// Core components
import { VisualAccessibility } from './components/VisualAccessibility.js';
import { NavigationAccessibility } from './components/NavigationAccessibility.js';
import { ReadingAccessibility } from './components/ReadingAccessibility.js';
import { MotorAccessibility } from './components/MotorAccessibility.js';
import { MultilingualSupport } from './components/MultilingualSupport.js';
import { ARIAEnhancement } from './components/ARIAEnhancement.js';
import { ReadingGuide } from './components/ReadingGuide.js';
import { ScreenReaderOptimization } from './components/ScreenReaderOptimization.js';

// Built-in plugins
import { TextToSpeechPlugin } from './plugins/TextToSpeechPlugin.js';
import { VoiceCommandsPlugin } from './plugins/VoiceCommandsPlugin.js';
import { SwitchNavigationPlugin } from './plugins/SwitchNavigationPlugin.js';

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

// Export for different module systems
export default Accessify;

// Global assignment for UMD builds - ensure it's available immediately
if (typeof window !== 'undefined') {
  window.Accessify = Accessify;
}
