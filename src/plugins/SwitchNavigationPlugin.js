/**
 * Switch Navigation Plugin
 * Alternative input device support and switch navigation
 */

export class SwitchNavigationPlugin {
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
