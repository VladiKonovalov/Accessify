/**
 * Tests for Accessify main class
 */

import Accessify from '../src/index.js';

describe('Accessify', () => {
  let accessify;

  beforeEach(() => {
    accessify = new Accessify();
  });

  afterEach(() => {
    if (accessify && accessify.isInitialized) {
      accessify.destroy();
    }
  });

  describe('Initialization', () => {
    test('should create Accessify instance', () => {
      expect(accessify).toBeInstanceOf(Accessify);
      expect(accessify.version).toBe('1.0.0');
      expect(accessify.isInitialized).toBe(false);
    });

    test('should initialize successfully', async () => {
      await accessify.init();
      expect(accessify.isInitialized).toBe(true);
    });

    test('should destroy successfully', async () => {
      await accessify.init();
      accessify.destroy();
      expect(accessify.isInitialized).toBe(false);
    });

    test('should handle initialization errors gracefully', async () => {
      // Mock browser detection to return unsupported
      accessify.browserDetection.isSupported = jest.fn(() => false);
      
      await expect(accessify.init()).rejects.toThrow('Browser not supported');
    });
  });

  describe('Configuration', () => {
    test('should accept configuration options', () => {
      const config = {
        language: 'he',
        direction: 'rtl',
        theme: 'dark'
      };
      
      const configuredAccessify = new Accessify(config);
      expect(configuredAccessify.configManager.get('language')).toBe('he');
      expect(configuredAccessify.configManager.get('direction')).toBe('rtl');
      expect(configuredAccessify.configManager.get('theme')).toBe('dark');
    });

    test('should update configuration', () => {
      accessify.updateConfig({
        language: 'ar',
        direction: 'rtl'
      });
      
      expect(accessify.configManager.get('language')).toBe('ar');
      expect(accessify.configManager.get('direction')).toBe('rtl');
    });
  });

  describe('State Management', () => {
    test('should get and set state', () => {
      const state = { test: 'value' };
      accessify.setState(state);
      expect(accessify.getState()).toEqual(state);
    });

    test('should get current state', () => {
      const state = accessify.getState();
      expect(typeof state).toBe('object');
    });
  });

  describe('Event System', () => {
    test('should register event listeners', () => {
      const callback = jest.fn();
      accessify.on('testEvent', callback);
      expect(accessify.eventEmitter.hasListeners('testEvent')).toBe(true);
    });

    test('should emit events', () => {
      const callback = jest.fn();
      accessify.on('testEvent', callback);
      accessify.emit('testEvent', 'testData');
      expect(callback).toHaveBeenCalledWith('testData');
    });

    test('should remove event listeners', () => {
      const callback = jest.fn();
      accessify.on('testEvent', callback);
      accessify.off('testEvent', callback);
      expect(accessify.eventEmitter.hasListeners('testEvent')).toBe(false);
    });
  });

  describe('Feature Management', () => {
    test('should check if feature is enabled', () => {
      const isEnabled = accessify.isFeatureEnabled('textSizeAdjustment');
      expect(typeof isEnabled).toBe('boolean');
    });

    test('should enable feature', () => {
      accessify.enableFeature('textSizeAdjustment');
      expect(accessify.isFeatureEnabled('textSizeAdjustment')).toBe(true);
    });

    test('should disable feature', () => {
      accessify.enableFeature('textSizeAdjustment');
      accessify.disableFeature('textSizeAdjustment');
      expect(accessify.isFeatureEnabled('textSizeAdjustment')).toBe(false);
    });
  });

  describe('Component Access', () => {
    test('should get component by name', () => {
      const visual = accessify.getComponent('visual');
      expect(visual).toBe(accessify.visual);
    });

    test('should return null for invalid component', () => {
      const invalid = accessify.getComponent('invalid');
      expect(invalid).toBeUndefined();
    });
  });

  describe('Compliance Status', () => {
    test('should get compliance status', () => {
      const status = accessify.getComplianceStatus();
      expect(status).toHaveProperty('wcag');
      expect(status).toHaveProperty('israeliStandard');
      expect(status).toHaveProperty('features');
    });

    test('should check WCAG compliance', () => {
      const status = accessify.getComplianceStatus();
      expect(status.wcag).toHaveProperty('level');
      expect(status.wcag).toHaveProperty('version');
      expect(status.wcag).toHaveProperty('compliant');
      expect(status.wcag).toHaveProperty('score');
    });

    test('should check Israeli Standard compliance', () => {
      const status = accessify.getComplianceStatus();
      expect(status.israeliStandard).toHaveProperty('compliant');
      expect(status.israeliStandard).toHaveProperty('score');
    });
  });

  describe('Plugin System', () => {
    test('should have plugin manager', () => {
      expect(accessify.pluginManager).toBeDefined();
    });

    test('should register built-in plugins', () => {
      const registeredPlugins = accessify.pluginManager.getRegisteredPlugins();
      expect(registeredPlugins).toContain('textToSpeech');
      expect(registeredPlugins).toContain('voiceCommands');
      expect(registeredPlugins).toContain('switchNavigation');
    });
  });

  describe('Browser Detection', () => {
    test('should detect browser', () => {
      expect(accessify.browserDetection).toBeDefined();
      expect(accessify.browserDetection.browser).toBeDefined();
      expect(accessify.browserDetection.version).toBeDefined();
    });

    test('should check feature support', () => {
      const hasFeature = accessify.browserDetection.hasFeature('speechSynthesis');
      expect(typeof hasFeature).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    test('should have error handler', () => {
      expect(accessify.errorHandler).toBeDefined();
    });

    test('should handle errors', () => {
      const error = new Error('Test error');
      const errorInfo = accessify.errorHandler.handle(error, 'Test context');
      expect(errorInfo).toHaveProperty('id');
      expect(errorInfo).toHaveProperty('message');
      expect(errorInfo).toHaveProperty('context');
    });
  });

  describe('Global Assignment', () => {
    test('should assign to window in browser environment', () => {
      expect(window.Accessify).toBe(Accessify);
    });
  });
});
