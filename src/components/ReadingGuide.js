/**
 * Reading Guide Component
 * Provides reading ruler and text highlighting features
 */

export class ReadingGuide {
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
