/**
 * Navigation Accessibility Component
 * Handles keyboard navigation, focus management, and skip links
 */

export class NavigationAccessibility {
  constructor(accessify) {
    this.accessify = accessify;
    this.isInitialized = false;
    this.focusTrap = null;
    this.skipLinks = [];
    this.keyboardShortcuts = new Map();
    this.focusHistory = [];
    this.tabOrder = [];
  }

  /**
   * Initialize navigation accessibility features
   */
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Set up keyboard navigation
      this._setupKeyboardNavigation();
      
      // Create skip links
      this._createSkipLinks();
      
      // Set up focus management
      this._setupFocusManagement();
      
      // Set up keyboard shortcuts
      this._setupKeyboardShortcuts();
      
      // Set up tab order optimization
      this._setupTabOrder();

      this.isInitialized = true;
      this.accessify.emit('navigationAccessibilityInitialized');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Navigation accessibility initialization', 'component');
      throw error;
    }
  }

  /**
   * Destroy navigation accessibility features
   */
  destroy() {
    try {
      if (!this.isInitialized) {
        return;
      }

      // Remove event listeners
      this._removeEventListeners();
      
      // Remove skip links
      this._removeSkipLinks();
      
      // Clear focus trap
      this._clearFocusTrap();

      this.isInitialized = false;
      this.accessify.emit('navigationAccessibilityDestroyed');

    } catch (error) {
      this.accessify.errorHandler.handle(error, 'Navigation accessibility destruction', 'component');
    }
  }

  /**
   * Set up keyboard navigation
   */
  _setupKeyboardNavigation() {
    // Add keyboard event listeners
    document.addEventListener('keydown', this._handleKeydown.bind(this));
    document.addEventListener('keyup', this._handleKeyup.bind(this));
    
    // Add focus event listeners
    document.addEventListener('focusin', this._handleFocusIn.bind(this));
    document.addEventListener('focusout', this._handleFocusOut.bind(this));
  }

  /**
   * Handle keydown events
   */
  _handleKeydown(event) {
    const config = this.accessify.configManager.get('navigation.keyboard.shortcuts');
    
    if (!config.enabled) {
      return;
    }

    // Check for keyboard shortcuts
    const shortcut = this._getShortcutKey(event);
    if (this.keyboardShortcuts.has(shortcut)) {
      event.preventDefault();
      this.keyboardShortcuts.get(shortcut)();
      return;
    }

    // Handle special navigation keys
    switch (event.key) {
      case 'Tab':
        this._handleTabNavigation(event);
        break;
      case 'Escape':
        this._handleEscapeKey(event);
        break;
      case 'Enter':
      case ' ':
        this._handleActivationKey(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this._handleArrowKeys(event);
        break;
    }
  }

  /**
   * Handle keyup events
   */
  _handleKeyup(event) {
    // Handle keyup events if needed
  }

  /**
   * Handle focus in events
   */
  _handleFocusIn(event) {
    // Add to focus history
    this.focusHistory.push(event.target);
    
    // Limit focus history size
    if (this.focusHistory.length > 10) {
      this.focusHistory.shift();
    }
    
    // Emit focus event
    this.accessify.emit('focusIn', event.target);
  }

  /**
   * Handle focus out events
   */
  _handleFocusOut(event) {
    this.accessify.emit('focusOut', event.target);
  }

  /**
   * Handle tab navigation
   */
  _handleTabNavigation(event) {
    const config = this.accessify.configManager.get('navigation.focus');
    
    if (!config.enabled) {
      return;
    }

    // Check if we're in a focus trap
    if (this.focusTrap) {
      this._handleFocusTrap(event);
    }
    
    // Optimize tab order if enabled
    if (config.order === 'logical') {
      this._optimizeTabOrder(event);
    }
  }

  /**
   * Handle escape key
   */
  _handleEscapeKey(event) {
    // Close any open modals or menus
    this._closeOpenElements();
    
    // Return focus to previous element
    this._returnFocus();
  }

  /**
   * Handle activation keys (Enter, Space)
   */
  _handleActivationKey(event) {
    const target = event.target;
    
    // Handle different element types
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      // Button activation is handled by default
      return;
    }
    
    if (target.tagName === 'A' && target.getAttribute('href')) {
      // Link activation is handled by default
      return;
    }
    
    // Handle custom interactive elements
    if (target.getAttribute('tabindex') === '0') {
      target.click();
    }
  }

  /**
   * Handle arrow keys
   */
  _handleArrowKeys(event) {
    const target = event.target;
    
    // Handle arrow key navigation for custom components
    if (target.getAttribute('role') === 'menu' || 
        target.getAttribute('role') === 'menubar' ||
        target.getAttribute('role') === 'tablist') {
      this._handleArrowKeyNavigation(event);
    }
  }

  /**
   * Handle arrow key navigation
   */
  _handleArrowKeyNavigation(event) {
    const target = event.target;
    const role = target.getAttribute('role');
    const items = target.querySelectorAll(`[role="${role === 'tablist' ? 'tab' : 'menuitem'}"], button, a`);
    const currentIndex = Array.from(items).indexOf(target);
    
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
    }
    
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  }

  /**
   * Create skip links
   */
  _createSkipLinks() {
    const config = this.accessify.configManager.get('navigation.skipLinks');
    
    if (!config.enabled) {
      return;
    }

    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'accessify-skip-links';
    skipLinksContainer.setAttribute('aria-label', 'Skip navigation links');
    
    // Create skip to content link
    const skipToContent = document.createElement('a');
    skipToContent.href = '#main-content';
    skipToContent.textContent = 'Skip to main content';
    skipToContent.className = 'accessify-skip-link';
    skipToContent.addEventListener('click', this._handleSkipLink.bind(this));
    
    // Create skip to navigation link
    const skipToNav = document.createElement('a');
    skipToNav.href = '#main-navigation';
    skipToNav.textContent = 'Skip to navigation';
    skipToNav.className = 'accessify-skip-link';
    skipToNav.addEventListener('click', this._handleSkipLink.bind(this));
    
    skipLinksContainer.appendChild(skipToContent);
    skipLinksContainer.appendChild(skipToNav);
    
    // Add to page
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
    
    // Store references
    this.skipLinks.push(skipToContent, skipToNav);
    
    // Add CSS for skip links
    this._addSkipLinksCSS();
  }

  /**
   * Handle skip link clicks
   */
  _handleSkipLink(event) {
    event.preventDefault();
    
    const targetId = event.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Add CSS for skip links
   */
  _addSkipLinksCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .accessify-skip-links {
        position: absolute;
        top: -100px;
        left: 0;
        z-index: 10000;
      }
      
      .accessify-skip-link {
        position: absolute;
        top: 0;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 0 0 4px 0;
        font-weight: bold;
        transition: top 0.3s ease;
      }
      
      .accessify-skip-link:focus {
        top: 0;
        outline: 2px solid #fff;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove skip links
   */
  _removeSkipLinks() {
    this.skipLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
    this.skipLinks = [];
  }

  /**
   * Set up focus management
   */
  _setupFocusManagement() {
    const config = this.accessify.configManager.get('navigation.focus');
    
    if (!config.enabled) {
      return;
    }

    // Set up focus trap for modals
    this._setupFocusTrap();
    
    // Set up focus restoration
    this._setupFocusRestoration();
  }

  /**
   * Set up focus trap
   */
  _setupFocusTrap() {
    // This will be implemented when modals are detected
  }

  /**
   * Handle focus trap
   */
  _handleFocusTrap(event) {
    if (!this.focusTrap) {
      return;
    }

    const trapElements = this.focusTrap.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (trapElements.length === 0) {
      return;
    }

    const firstElement = trapElements[0];
    const lastElement = trapElements[trapElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Set focus trap
   */
  setFocusTrap(element) {
    this.focusTrap = element;
    this.accessify.emit('focusTrapSet', element);
  }

  /**
   * Clear focus trap
   */
  _clearFocusTrap() {
    this.focusTrap = null;
    this.accessify.emit('focusTrapCleared');
  }

  /**
   * Set up focus restoration
   */
  _setupFocusRestoration() {
    // Store focus when page loads
    window.addEventListener('beforeunload', () => {
      if (document.activeElement) {
        sessionStorage.setItem('accessify-last-focus', document.activeElement.id || '');
      }
    });
    
    // Restore focus when page loads
    window.addEventListener('load', () => {
      const lastFocusId = sessionStorage.getItem('accessify-last-focus');
      if (lastFocusId) {
        const element = document.getElementById(lastFocusId);
        if (element) {
          element.focus();
        }
      }
    });
  }

  /**
   * Set up keyboard shortcuts
   */
  _setupKeyboardShortcuts() {
    const config = this.accessify.configManager.get('navigation.keyboard.shortcuts');
    
    if (!config.enabled) {
      return;
    }

    // Register default shortcuts
    this.registerShortcut(config.skipToContent, () => {
      this._skipToContent();
    });
    
    this.registerShortcut(config.toggleMenu, () => {
      this._toggleMenu();
    });
    
    this.registerShortcut(config.increaseTextSize, () => {
      this.accessify.visual.increaseTextSize();
    });
    
    this.registerShortcut(config.decreaseTextSize, () => {
      this.accessify.visual.decreaseTextSize();
    });
    
    this.registerShortcut(config.toggleContrast, () => {
      this.accessify.visual.toggleContrastMode();
    });
    
    this.registerShortcut(config.toggleHighContrast, () => {
      this.accessify.visual.setContrastMode('high');
    });

    // Enhanced keyboard shortcuts
    this.registerShortcut('Alt+r', () => {
      if (this.accessify.readingGuide) {
        this.accessify.readingGuide.toggleReadingRuler();
      }
    });
    
    this.registerShortcut('Alt+h', () => {
      if (this.accessify.readingGuide) {
        this.accessify.readingGuide.toggleTextHighlighting();
      }
    });
    
    this.registerShortcut('Alt+a', () => {
      if (this.accessify.visual) {
        this.accessify.visual.toggleAnimations();
      }
    });
    
    this.registerShortcut('Alt+l', () => {
      this._toggleLinkUnderlining();
    });
    
    this.registerShortcut('Alt+f', () => {
      this._cycleFocusStyles();
    });
    
    this.registerShortcut('Alt+c', () => {
      this._cycleCursorStyles();
    });
    
    this.registerShortcut('Alt+s', () => {
      this._toggleScreenReaderAnnouncements();
    });
    
    this.registerShortcut('Alt+t', () => {
      this._toggleTabOrder();
    });
    
    this.registerShortcut('Alt+g', () => {
      this._toggleGridOverlay();
    });
  }

  /**
   * Register keyboard shortcut
   */
  registerShortcut(shortcut, callback) {
    this.keyboardShortcuts.set(shortcut, callback);
  }

  /**
   * Unregister keyboard shortcut
   */
  unregisterShortcut(shortcut) {
    this.keyboardShortcuts.delete(shortcut);
  }

  /**
   * Get shortcut key from event
   */
  _getShortcutKey(event) {
    const parts = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    
    parts.push(event.key);
    
    return parts.join('+');
  }

  /**
   * Set up tab order optimization
   */
  _setupTabOrder() {
    const config = this.accessify.configManager.get('navigation.focus');
    
    if (config.order === 'logical') {
      this._optimizeTabOrder();
    }
  }

  /**
   * Optimize tab order
   */
  _optimizeTabOrder(event) {
    // This is a simplified implementation
    // In a real implementation, you'd analyze the DOM structure
    // and ensure logical tab order
  }

  /**
   * Skip to content
   */
  _skipToContent() {
    const mainContent = document.querySelector('main, #main-content, [role="main"]');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Toggle menu
   */
  _toggleMenu() {
    const menu = document.querySelector('[role="menu"], .menu, #menu');
    if (menu) {
      const isOpen = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', !isOpen);
      
      if (!isOpen) {
        const firstMenuItem = menu.querySelector('button, a, [tabindex="0"]');
        if (firstMenuItem) {
          firstMenuItem.focus();
        }
      }
    }
  }

  /**
   * Close open elements
   */
  _closeOpenElements() {
    // Close any open modals, menus, or dropdowns
    const openElements = document.querySelectorAll('[aria-expanded="true"]');
    openElements.forEach(element => {
      element.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Return focus to previous element
   */
  _returnFocus() {
    if (this.focusHistory.length > 0) {
      const previousElement = this.focusHistory.pop();
      if (previousElement && previousElement.focus) {
        previousElement.focus();
      }
    }
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('keydown', this._handleKeydown);
    document.removeEventListener('keyup', this._handleKeyup);
    document.removeEventListener('focusin', this._handleFocusIn);
    document.removeEventListener('focusout', this._handleFocusOut);
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    const config = this.accessify.configManager.get('navigation');
    const enabledFeatures = [];
    
    if (config.keyboard.enabled) enabledFeatures.push('keyboardNavigation');
    if (config.focus.enabled) enabledFeatures.push('focusManagement');
    if (config.skipLinks.enabled) enabledFeatures.push('skipLinks');
    
    return {
      wcag: {
        level: 'AA',
        compliant: enabledFeatures.length >= 2,
        score: Math.round((enabledFeatures.length / 3) * 100)
      },
      israeliStandard: {
        compliant: enabledFeatures.includes('keyboardNavigation'),
        score: Math.round((enabledFeatures.length / 3) * 100)
      },
      features: enabledFeatures
    };
  }

  /**
   * Get current navigation settings
   */
  getCurrentSettings() {
    return {
      keyboard: this.accessify.configManager.get('navigation.keyboard'),
      focus: this.accessify.configManager.get('navigation.focus'),
      skipLinks: this.accessify.configManager.get('navigation.skipLinks')
    };
  }

  /**
   * Toggle link underlining
   */
  _toggleLinkUnderlining() {
    if (this.accessify.visual) {
      const currentStyle = this.accessify.configManager.get('visual.linkUnderlining.style');
      const styles = ['none', 'always', 'hover', 'enhanced', 'double'];
      const currentIndex = styles.indexOf(currentStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      this.accessify.visual.setLinkUnderlining(styles[nextIndex]);
    }
  }

  /**
   * Cycle through focus styles
   */
  _cycleFocusStyles() {
    if (this.accessify.visual) {
      const currentStyle = this.accessify.configManager.get('visual.focusIndicators.style');
      const styles = ['standard', 'highlight', 'glow', 'thick', 'dotted'];
      const currentIndex = styles.indexOf(currentStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      this.accessify.visual.setFocusIndicator(styles[nextIndex]);
    }
  }

  /**
   * Cycle through cursor styles
   */
  _cycleCursorStyles() {
    if (this.accessify.visual) {
      const currentStyle = this.accessify.configManager.get('visual.cursors.current');
      const styles = ['default', 'large', 'extra-large', 'high-contrast', 'crosshair', 'pointer-large', 'text-large'];
      const currentIndex = styles.indexOf(currentStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      this.accessify.visual.setCursor(styles[nextIndex]);
    }
  }

  /**
   * Toggle screen reader announcements
   */
  _toggleScreenReaderAnnouncements() {
    if (this.accessify.screenReader) {
      const isEnabled = this.accessify.configManager.get('screenReader.announcements.enabled');
      this.accessify.configManager.set('screenReader.announcements.enabled', !isEnabled);
      this.accessify.screenReader.announce(`Screen reader announcements ${!isEnabled ? 'enabled' : 'disabled'}`, 'polite', 'normal');
    }
  }

  /**
   * Toggle tab order visualization
   */
  _toggleTabOrder() {
    const isEnabled = this.accessify.configManager.get('navigation.focus.visualizeTabOrder');
    this.accessify.configManager.set('navigation.focus.visualizeTabOrder', !isEnabled);
    
    if (!isEnabled) {
      this._showTabOrder();
    } else {
      this._hideTabOrder();
    }
  }

  /**
   * Show tab order visualization
   */
  _showTabOrder() {
    const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach((element, index) => {
      if (!element.querySelector('.accessify-tab-order-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'accessify-tab-order-indicator';
        indicator.textContent = index + 1;
        indicator.style.cssText = `
          position: absolute;
          top: -5px;
          left: -5px;
          background: #ff0000;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          z-index: 10000;
          pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(indicator);
      }
    });
    
    this.accessify.emit('tabOrderShown');
  }

  /**
   * Hide tab order visualization
   */
  _hideTabOrder() {
    const indicators = document.querySelectorAll('.accessify-tab-order-indicator');
    indicators.forEach(indicator => {
      indicator.remove();
    });
    
    this.accessify.emit('tabOrderHidden');
  }

  /**
   * Toggle grid overlay
   */
  _toggleGridOverlay() {
    const isEnabled = this.accessify.configManager.get('navigation.gridOverlay.enabled');
    this.accessify.configManager.set('navigation.gridOverlay.enabled', !isEnabled);
    
    if (!isEnabled) {
      this._showGridOverlay();
    } else {
      this._hideGridOverlay();
    }
  }

  /**
   * Show grid overlay
   */
  _showGridOverlay() {
    if (!document.getElementById('accessify-grid-overlay')) {
      const gridOverlay = document.createElement('div');
      gridOverlay.id = 'accessify-grid-overlay';
      gridOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background-image: 
          linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.5;
      `;
      
      document.body.appendChild(gridOverlay);
    }
    
    this.accessify.emit('gridOverlayShown');
  }

  /**
   * Hide grid overlay
   */
  _hideGridOverlay() {
    const gridOverlay = document.getElementById('accessify-grid-overlay');
    if (gridOverlay) {
      gridOverlay.remove();
    }
    
    this.accessify.emit('gridOverlayHidden');
  }
}
