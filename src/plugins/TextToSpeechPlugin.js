/**
 * Text-to-Speech Plugin
 * Enhanced text-to-speech functionality with advanced controls
 */

export class TextToSpeechPlugin {
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
