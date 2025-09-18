/**
 * Reading Accessibility Component
 * Handles text-to-speech, fonts, spacing, and reading guides
 */

export class ReadingAccessibility {
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
