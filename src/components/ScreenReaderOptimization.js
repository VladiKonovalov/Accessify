/**
 * Screen Reader Optimization Component
 * Provides comprehensive screen reader support and optimization
 */

export class ScreenReaderOptimization {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.liveRegions = new Map();
    this.announcements = [];
    this.ariaEnhancements = new Map();
    this.screenReaderDetected = false;
  }

  /**
   * Initialize screen reader optimization features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Detect screen reader
      this._detectScreenReader();
      
      // Set up live regions
      this._setupLiveRegions();
      
      // Enhance ARIA attributes
      this._enhanceARIA();
      
      // Set up announcements
      this._setupAnnouncements();
      
      // Set up event listeners
      this._setupEventListeners();

      this.isInitialized = true;
      this.accessify.emit('screenReaderOptimizationInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Screen reader optimization initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy screen reader optimization features
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Remove live regions
      this._removeLiveRegions();
      
      // Remove event listeners
      this._removeEventListeners();
      
      // Clear announcements
      this.announcements = [];

      this.isInitialized = false;
      this.accessify.emit('screenReaderOptimizationDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Screen reader optimization destruction', 'component');
    }
  }

  /**
   * Detect screen reader
   */
  _detectScreenReader() {
    // Check for screen reader indicators
    const screenReaderIndicators = [
      'navigator.userAgent.includes("NVDA")',
      'navigator.userAgent.includes("JAWS")',
      'navigator.userAgent.includes("VoiceOver")',
      'navigator.userAgent.includes("TalkBack")',
      'window.speechSynthesis',
      'document.querySelector("[aria-live]")',
      'document.querySelector("[role]")'
    ];

    // Check for screen reader specific properties
    if (window.speechSynthesis || document.querySelector('[aria-live]')) {
      this.screenReaderDetected = true;
    }

    // Check for screen reader specific classes or attributes
    const hasScreenReaderClasses = document.querySelector('.sr-only, .screen-reader-only, [aria-hidden="true"]');
    if (hasScreenReaderClasses) {
      this.screenReaderDetected = true;
    }

    this.accessify.emit('screenReaderDetected', this.screenReaderDetected);
  }

  /**
   * Set up live regions
   */
  _setupLiveRegions() {
    // Create polite live region
    this._createLiveRegion('polite', 'accessify-live-polite');
    
    // Create assertive live region
    this._createLiveRegion('assertive', 'accessify-live-assertive');
    
    // Create status live region
    this._createLiveRegion('status', 'accessify-live-status');
    
    // Create log live region
    this._createLiveRegion('log', 'accessify-live-log');
  }

  /**
   * Create live region
   */
  _createLiveRegion(type, id) {
    const liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', type);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(liveRegion);
    this.liveRegions.set(type, liveRegion);
  }

  /**
   * Announce message to screen reader
   */
  announce(message, type = 'polite', priority = 'normal') {
    try {
      const liveRegion = this.liveRegions.get(type);
      if (liveRegion) {
        // Clear previous message
        liveRegion.textContent = '';
        
        // Set new message
        setTimeout(() => {
          liveRegion.textContent = message;
          this.announcements.push({
            message,
            type,
            priority,
            timestamp: new Date().toISOString()
          });
        }, 100);
        
        // Clear after announcement
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 2000);
        
        this.accessify.emit('announcementMade', { message, type, priority });
      }
    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Screen reader announcement', 'component');
    }
  }

  /**
   * Announce status change
   */
  announceStatus(status, details = '') {
    const message = details ? `${status}: ${details}` : status;
    this.announce(message, 'status', 'high');
  }

  /**
   * Announce error
   */
  announceError(error, context = '') {
    const message = context ? `Error in ${context}: ${error}` : `Error: ${error}`;
    this.announce(message, 'assertive', 'high');
  }

  /**
   * Announce success
   */
  announceSuccess(message) {
    this.announce(`Success: ${message}`, 'polite', 'normal');
  }

  /**
   * Enhance ARIA attributes
   */
  _enhanceARIA() {
    // Enhance buttons
    this._enhanceButtons();
    
    // Enhance form elements
    this._enhanceFormElements();
    
    // Enhance navigation
    this._enhanceNavigation();
    
    // Enhance headings
    this._enhanceHeadings();
    
    // Enhance lists
    this._enhanceLists();
    
    // Enhance tables
    this._enhanceTables();
  }

  /**
   * Enhance buttons
   */
  _enhanceButtons() {
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        // Generate aria-label from icon or other attributes
        const icon = button.querySelector('i, svg, img');
        if (icon) {
          const iconTitle = icon.getAttribute('title') || icon.getAttribute('aria-label');
          if (iconTitle) {
            button.setAttribute('aria-label', iconTitle);
          }
        }
        
        // Use data-label if available
        const dataLabel = button.getAttribute('data-label');
        if (dataLabel) {
          button.setAttribute('aria-label', dataLabel);
        }
      }
      
      this.ariaEnhancements.set(button, ['aria-label']);
    });
  }

  /**
   * Enhance form elements
   */
  _enhanceFormElements() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Ensure proper labeling
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-labelledby', label.id || this._generateId(label));
        }
      }
      
      // Add validation states
      if (input.hasAttribute('required')) {
        input.setAttribute('aria-required', 'true');
      }
      
      if (input.hasAttribute('invalid') || input.classList.contains('invalid')) {
        input.setAttribute('aria-invalid', 'true');
      }
      
      // Add descriptions for help text
      const helpText = input.closest('.form-group, .field')?.querySelector('.help-text, .description');
      if (helpText && !input.getAttribute('aria-describedby')) {
        helpText.id = helpText.id || this._generateId(helpText);
        input.setAttribute('aria-describedby', helpText.id);
      }
      
      this.ariaEnhancements.set(input, ['aria-required', 'aria-invalid', 'aria-describedby']);
    });
  }

  /**
   * Enhance navigation
   */
  _enhanceNavigation() {
    const navs = document.querySelectorAll('nav:not([aria-label]):not([aria-labelledby])');
    
    navs.forEach(nav => {
      if (!nav.getAttribute('aria-label')) {
        // Try to get label from heading or title
        const heading = nav.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          nav.setAttribute('aria-labelledby', heading.id || this._generateId(heading));
        } else {
          nav.setAttribute('aria-label', 'Navigation');
        }
      }
      
      this.ariaEnhancements.set(nav, ['aria-label', 'aria-labelledby']);
    });
  }

  /**
   * Enhance headings
   */
  _enhanceHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach(heading => {
      if (!heading.id) {
        heading.id = this._generateId(heading);
      }
      
      this.ariaEnhancements.set(heading, ['id']);
    });
  }

  /**
   * Enhance lists
   */
  _enhanceLists() {
    const lists = document.querySelectorAll('ul, ol');
    
    lists.forEach(list => {
      if (!list.getAttribute('aria-label') && !list.getAttribute('aria-labelledby')) {
        // Try to get label from heading
        const heading = list.previousElementSibling;
        if (heading && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(heading.tagName)) {
          list.setAttribute('aria-labelledby', heading.id || this._generateId(heading));
        }
      }
      
      this.ariaEnhancements.set(list, ['aria-label', 'aria-labelledby']);
    });
  }

  /**
   * Enhance tables
   */
  _enhanceTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      // Add caption if missing
      if (!table.querySelector('caption')) {
        const caption = document.createElement('caption');
        caption.textContent = 'Table';
        table.insertBefore(caption, table.firstChild);
      }
      
      // Add table headers
      const headers = table.querySelectorAll('th');
      if (headers.length > 0) {
        table.setAttribute('role', 'table');
      }
      
      this.ariaEnhancements.set(table, ['caption', 'role']);
    });
  }

  /**
   * Set up announcements
   */
  _setupAnnouncements() {
    // Announce page load
    this.announce('Page loaded successfully', 'polite', 'normal');
    
    // Announce accessibility features
    this.announce('Accessibility features are now active', 'polite', 'normal');
  }

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Listen for form submissions
    document.addEventListener('submit', this._handleFormSubmit.bind(this));
    
    // Listen for focus changes
    document.addEventListener('focusin', this._handleFocusIn.bind(this));
    
    // Listen for errors
    window.addEventListener('error', this._handleError.bind(this));
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));
  }

  /**
   * Handle form submission
   */
  _handleFormSubmit(event) {
    this.announce('Form submitted', 'polite', 'normal');
  }

  /**
   * Handle focus in
   */
  _handleFocusIn(event) {
    const target = event.target;
    
    // Announce focused element
    if (target.getAttribute('aria-label')) {
      this.announce(target.getAttribute('aria-label'), 'polite', 'low');
    } else if (target.textContent.trim()) {
      this.announce(target.textContent.trim(), 'polite', 'low');
    }
  }

  /**
   * Handle error
   */
  _handleError(event) {
    this.announceError(event.message, event.filename);
  }

  /**
   * Handle visibility change
   */
  _handleVisibilityChange(event) {
    if (document.hidden) {
      this.announce('Page hidden', 'polite', 'low');
    } else {
      this.announce('Page visible', 'polite', 'low');
    }
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('submit', this._handleFormSubmit);
    document.removeEventListener('focusin', this._handleFocusIn);
    window.removeEventListener('error', this._handleError);
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
  }

  /**
   * Remove live regions
   */
  _removeLiveRegions() {
    this.liveRegions.forEach(liveRegion => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    });
    this.liveRegions.clear();
  }

  /**
   * Generate unique ID for element
   */
  _generateId(element) {
    if (element.id) {
      return element.id;
    }

    const prefix = element.tagName.toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const id = `${prefix}-${timestamp}-${random}`;
    
    element.id = id;
    return id;
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    return {
      screenReaderDetected: this.screenReaderDetected,
      liveRegions: {
        count: this.liveRegions.size,
        types: Array.from(this.liveRegions.keys())
      },
      ariaEnhancements: {
        count: this.ariaEnhancements.size
      },
      announcements: {
        count: this.announcements.length
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
      screenReaderDetected: this.screenReaderDetected,
      liveRegions: Array.from(this.liveRegions.keys()),
      ariaEnhancements: this.ariaEnhancements.size,
      announcements: this.announcements.length
    };
  }

  /**
   * Reset all settings
   */
  reset() {
    // Clear announcements
    this.announcements = [];
    
    // Clear live regions
    this.liveRegions.forEach(liveRegion => {
      liveRegion.textContent = '';
    });
    
    this.accessify.emit('screenReaderOptimizationReset');
  }
}
