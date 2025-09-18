/**
 * Voice Commands Plugin
 * Advanced voice command recognition and processing
 */

export class VoiceCommandsPlugin {
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
