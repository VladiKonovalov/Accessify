/**
 * Multilingual Support Component
 * Handles RTL support, language detection, and internationalization
 */

export class MultilingualSupport {
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
