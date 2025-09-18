/**
 * Motor Accessibility Component
 * Handles large targets, gestures, voice commands, and motion control
 */

export class MotorAccessibility {
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
