/**
 * Visual Accessibility Component
 * Handles text size, contrast, themes, cursors, and focus indicators
 */

export class VisualAccessibility {
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
        
      case 'high-contrast':
        css = `
          * {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="white" stroke="black" stroke-width="2"/></svg>'), auto !important;
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
    const css = `
      *:focus {
        outline: ${config.thickness} solid ${config.color} !important;
        outline-offset: 2px !important;
      }
      
      *:focus-visible {
        outline: ${config.thickness} solid ${config.color} !important;
        outline-offset: 2px !important;
      }
      
      button:focus,
      input:focus,
      textarea:focus,
      select:focus,
      a:focus {
        outline: ${config.thickness} solid ${config.color} !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 ${config.thickness} ${config.color} !important;
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
}
