/**
 * Testing Utilities for Accessify
 * Provides hooks for automated accessibility testing and compliance validation
 */

export class TestingUtils {
  constructor(accessify) {
    this.accessify = accessify;
    this.testResults = new Map();
    this.complianceChecks = new Map();
    this.axeResults = null;
    this.lighthouseResults = null;
  }

  /**
   * Run comprehensive accessibility tests
   */
  async runAccessibilityTests() {
    const results = {
      timestamp: new Date().toISOString(),
      wcag: await this.runWCAGTests(),
      israeliStandard: await this.runIsraeliStandardTests(),
      axe: await this.runAxeTests(),
      lighthouse: await this.runLighthouseTests(),
      manual: await this.runManualTests(),
      overall: {}
    };

    // Calculate overall compliance score
    results.overall = this._calculateOverallScore(results);
    
    // Store results
    this.testResults.set('comprehensive', results);
    
    // Emit results
    this.accessify.emit('accessibilityTestsCompleted', results);
    
    return results;
  }

  /**
   * Run WCAG compliance tests
   */
  async runWCAGTests() {
    const tests = {
      level: 'AA',
      version: '2.1',
      results: {},
      score: 0,
      compliant: false,
      details: {
        perceivable: {},
        operable: {},
        understandable: {},
        robust: {}
      }
    };

    // Test 1: Text size adjustment
    tests.results.textSizeAdjustment = this._testTextSizeAdjustment();
    tests.details.perceivable.textSizeAdjustment = tests.results.textSizeAdjustment;
    
    // Test 2: High contrast
    tests.results.highContrast = this._testHighContrast();
    
    // Test 3: Keyboard navigation
    tests.results.keyboardNavigation = this._testKeyboardNavigation();
    
    // Test 4: Focus indicators
    tests.results.focusIndicators = this._testFocusIndicators();
    
    // Test 5: Skip links
    tests.results.skipLinks = this._testSkipLinks();
    
    // Test 6: Alt text
    tests.results.altText = this._testAltText();
    
    // Test 7: Color contrast
    tests.results.colorContrast = this._testColorContrast();
    
    // Test 8: Text spacing
    tests.results.textSpacing = this._testTextSpacing();
    
    // Test 9: Focus management
    tests.results.focusManagement = this._testFocusManagement();
    
    // Test 10: ARIA labels
    tests.results.ariaLabels = this._testAriaLabels();

    // Calculate score
    const passedTests = Object.values(tests.results).filter(result => result.passed).length;
    tests.score = Math.round((passedTests / Object.keys(tests.results).length) * 100);
    tests.compliant = tests.score >= 80; // 80% threshold for compliance

    return tests;
  }

  /**
   * Run Israeli Standard 5568 compliance tests
   */
  async runIsraeliStandardTests() {
    const tests = {
      results: {},
      score: 0,
      compliant: false
    };

    // Test 1: RTL support
    tests.results.rtlSupport = this._testRTLSupport();
    
    // Test 2: Hebrew language support
    tests.results.hebrewSupport = this._testHebrewSupport();
    
    // Test 3: Text size adjustment
    tests.results.textSizeAdjustment = this._testTextSizeAdjustment();
    
    // Test 4: High contrast
    tests.results.highContrast = this._testHighContrast();
    
    // Test 5: Keyboard navigation
    tests.results.keyboardNavigation = this._testKeyboardNavigation();
    
    // Test 6: Voice commands
    tests.results.voiceCommands = this._testVoiceCommands();
    
    // Test 7: Text-to-speech
    tests.results.textToSpeech = this._testTextToSpeech();
    
    // Test 8: Large targets
    tests.results.largeTargets = this._testLargeTargets();

    // Calculate score
    const passedTests = Object.values(tests.results).filter(result => result.passed).length;
    tests.score = Math.round((passedTests / Object.keys(tests.results).length) * 100);
    tests.compliant = tests.score >= 80; // 80% threshold for compliance

    return tests;
  }

  /**
   * Run Axe accessibility tests
   */
  async runAxeTests() {
    try {
      // Check if axe is available
      if (typeof window.axe === 'undefined') {
        return {
          available: false,
          error: 'Axe not loaded. Please include axe-core library.'
        };
      }

      // Run axe tests
      const results = await window.axe.run();
      
      this.axeResults = results;
      
      return {
        available: true,
        violations: results.violations,
        passes: results.passes,
        incomplete: results.incomplete,
        score: this._calculateAxeScore(results)
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Run Lighthouse accessibility tests
   */
  async runLighthouseTests() {
    try {
      // Check if Lighthouse is available
      if (typeof window.lighthouse === 'undefined') {
        return {
          available: false,
          error: 'Lighthouse not available in browser environment'
        };
      }

      // Note: Lighthouse typically runs in Node.js environment
      // This is a placeholder for when Lighthouse is available
      return {
        available: false,
        error: 'Lighthouse requires Node.js environment'
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Run manual accessibility tests
   */
  async runManualTests() {
    const tests = {
      keyboard: this._testKeyboardAccessibility(),
      screenReader: this._testScreenReaderAccessibility(),
      voiceControl: this._testVoiceControlAccessibility(),
      switchNavigation: this._testSwitchNavigationAccessibility()
    };

    return tests;
  }

  /**
   * Test text size adjustment
   */
  _testTextSizeAdjustment() {
    const config = this.accessify.configManager.get('visual.textSize');
    const isEnabled = config.enabled;
    const hasRange = config.min <= 0.5 && config.max >= 3.0;
    
    return {
      passed: isEnabled && hasRange,
      details: {
        enabled: isEnabled,
        minSize: config.min,
        maxSize: config.max,
        currentSize: config.current
      }
    };
  }

  /**
   * Test high contrast
   */
  _testHighContrast() {
    const config = this.accessify.configManager.get('visual.contrast');
    const isEnabled = config.enabled;
    const hasModes = config.modes.length >= 2;
    
    return {
      passed: isEnabled && hasModes,
      details: {
        enabled: isEnabled,
        modes: config.modes,
        currentMode: config.current
      }
    };
  }

  /**
   * Test keyboard navigation
   */
  _testKeyboardNavigation() {
    const config = this.accessify.configManager.get('navigation.keyboard');
    const isEnabled = config.enabled;
    const hasShortcuts = config.shortcuts.enabled;
    
    return {
      passed: isEnabled && hasShortcuts,
      details: {
        enabled: isEnabled,
        shortcuts: config.shortcuts
      }
    };
  }

  /**
   * Test focus indicators
   */
  _testFocusIndicators() {
    const config = this.accessify.configManager.get('visual.focusIndicators');
    const isEnabled = config.enabled;
    const hasStyle = config.style && config.color;
    
    return {
      passed: isEnabled && hasStyle,
      details: {
        enabled: isEnabled,
        style: config.style,
        color: config.color,
        thickness: config.thickness
      }
    };
  }

  /**
   * Test skip links
   */
  _testSkipLinks() {
    const config = this.accessify.configManager.get('navigation.skipLinks');
    const isEnabled = config.enabled;
    const hasSkipLinks = document.querySelectorAll('.accessify-skip-link').length > 0;
    
    return {
      passed: isEnabled && hasSkipLinks,
      details: {
        enabled: isEnabled,
        visible: config.visible,
        count: document.querySelectorAll('.accessify-skip-link').length
      }
    };
  }

  /**
   * Test alt text
   */
  _testAltText() {
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    
    return {
      passed: imagesWithoutAlt.length === 0,
      details: {
        totalImages: images.length,
        imagesWithAlt: imagesWithAlt.length,
        imagesWithoutAlt: imagesWithoutAlt.length,
        missingAltImages: imagesWithoutAlt.map(img => img.src)
      }
    };
  }

  /**
   * Test color contrast
   */
  _testColorContrast() {
    // This is a simplified test
    // In a real implementation, you'd use a color contrast analysis library
    const hasHighContrast = this.accessify.configManager.get('visual.contrast.current') === 'high';
    
    return {
      passed: hasHighContrast,
      details: {
        currentContrast: this.accessify.configManager.get('visual.contrast.current'),
        highContrastAvailable: this.accessify.configManager.get('visual.contrast.modes').includes('high')
      }
    };
  }

  /**
   * Test text spacing
   */
  _testTextSpacing() {
    const config = this.accessify.configManager.get('reading.spacing');
    const isEnabled = config.enabled;
    const hasLineHeight = config.lineHeight >= 1.5;
    
    return {
      passed: isEnabled && hasLineHeight,
      details: {
        enabled: isEnabled,
        lineHeight: config.lineHeight,
        letterSpacing: config.letterSpacing,
        wordSpacing: config.wordSpacing
      }
    };
  }

  /**
   * Test focus management
   */
  _testFocusManagement() {
    const config = this.accessify.configManager.get('navigation.focus');
    const isEnabled = config.enabled;
    const hasTrap = config.trap;
    
    return {
      passed: isEnabled && hasTrap,
      details: {
        enabled: isEnabled,
        trap: config.trap,
        visible: config.visible,
        order: config.order
      }
    };
  }

  /**
   * Test ARIA labels
   */
  _testAriaLabels() {
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, [role="button"], [role="link"]');
    const elementsWithLabels = document.querySelectorAll('button[aria-label], input[aria-label], select[aria-label], textarea[aria-label], [role="button"][aria-label], [role="link"][aria-label]');
    
    return {
      passed: elementsWithLabels.length >= interactiveElements.length * 0.8, // 80% threshold
      details: {
        totalInteractiveElements: interactiveElements.length,
        elementsWithLabels: elementsWithLabels.length,
        coverage: Math.round((elementsWithLabels.length / interactiveElements.length) * 100)
      }
    };
  }

  /**
   * Test RTL support
   */
  _testRTLSupport() {
    const config = this.accessify.configManager.get('multilingual.rtl');
    const isEnabled = config.enabled;
    const hasRTLStyles = document.querySelector('style[data-accessify="rtl"]') !== null;
    
    return {
      passed: isEnabled && hasRTLStyles,
      details: {
        enabled: isEnabled,
        currentDirection: this.accessify.configManager.get('direction'),
        hasRTLStyles: hasRTLStyles
      }
    };
  }

  /**
   * Test Hebrew language support
   */
  _testHebrewSupport() {
    const currentLanguage = this.accessify.configManager.get('language');
    const isHebrew = currentLanguage === 'he';
    const hasHebrewTranslations = this.accessify.multilingual.translations.has('he');
    
    return {
      passed: isHebrew || hasHebrewTranslations,
      details: {
        currentLanguage: currentLanguage,
        isHebrew: isHebrew,
        hasHebrewTranslations: hasHebrewTranslations
      }
    };
  }

  /**
   * Test voice commands
   */
  _testVoiceCommands() {
    const config = this.accessify.configManager.get('motor.voice');
    const isEnabled = config.enabled;
    const hasCommands = config.commands;
    
    return {
      passed: isEnabled && hasCommands,
      details: {
        enabled: isEnabled,
        commands: hasCommands,
        speechRecognitionSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
      }
    };
  }

  /**
   * Test text-to-speech
   */
  _testTextToSpeech() {
    const config = this.accessify.configManager.get('reading.textToSpeech');
    const isEnabled = config.enabled;
    const speechSupported = 'speechSynthesis' in window;
    
    return {
      passed: isEnabled && speechSupported,
      details: {
        enabled: isEnabled,
        speechSupported: speechSupported,
        rate: config.rate,
        pitch: config.pitch,
        volume: config.volume
      }
    };
  }

  /**
   * Test large targets
   */
  _testLargeTargets() {
    const config = this.accessify.configManager.get('motor.targets');
    const isEnabled = config.enabled;
    const minSize = config.minSize >= 44; // WCAG recommendation
    
    return {
      passed: isEnabled && minSize,
      details: {
        enabled: isEnabled,
        minSize: config.minSize,
        padding: config.padding,
        meetsWCAG: minSize
      }
    };
  }

  /**
   * Test keyboard accessibility
   */
  _testKeyboardAccessibility() {
    const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const keyboardAccessible = focusableElements.length > 0;
    
    return {
      passed: keyboardAccessible,
      details: {
        focusableElements: focusableElements.length,
        keyboardNavigationEnabled: this.accessify.configManager.get('navigation.keyboard.enabled')
      }
    };
  }

  /**
   * Test screen reader accessibility
   */
  _testScreenReaderAccessibility() {
    const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0;
    const hasAriaRoles = document.querySelectorAll('[role]').length > 0;
    const hasAltText = document.querySelectorAll('img[alt]').length > 0;
    
    return {
      passed: hasAriaLabels || hasAriaRoles || hasAltText,
      details: {
        ariaLabels: document.querySelectorAll('[aria-label]').length,
        ariaRoles: document.querySelectorAll('[role]').length,
        altText: document.querySelectorAll('img[alt]').length
      }
    };
  }

  /**
   * Test voice control accessibility
   */
  _testVoiceControlAccessibility() {
    const voiceEnabled = this.accessify.configManager.get('motor.voice.enabled');
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    return {
      passed: voiceEnabled && speechRecognitionSupported,
      details: {
        voiceEnabled: voiceEnabled,
        speechRecognitionSupported: speechRecognitionSupported
      }
    };
  }

  /**
   * Test switch navigation accessibility
   */
  _testSwitchNavigationAccessibility() {
    const switchPlugin = this.accessify.pluginManager.getPlugin('switchNavigation');
    const isAvailable = switchPlugin !== null;
    
    return {
      passed: isAvailable,
      details: {
        pluginAvailable: isAvailable,
        switchElements: switchPlugin ? switchPlugin.switchElements.length : 0
      }
    };
  }

  /**
   * Calculate Axe score
   */
  _calculateAxeScore(results) {
    if (!results.violations) {
      return 100;
    }
    
    const totalIssues = results.violations.length;
    const criticalIssues = results.violations.filter(v => v.impact === 'critical').length;
    const seriousIssues = results.violations.filter(v => v.impact === 'serious').length;
    
    // Calculate score based on issue severity
    let score = 100;
    score -= criticalIssues * 20; // -20 points per critical issue
    score -= seriousIssues * 10;  // -10 points per serious issue
    score -= (totalIssues - criticalIssues - seriousIssues) * 5; // -5 points per other issue
    
    return Math.max(0, score);
  }

  /**
   * Calculate overall compliance score
   */
  _calculateOverallScore(results) {
    const scores = [];
    
    if (results.wcag && results.wcag.score) {
      scores.push(results.wcag.score);
    }
    
    if (results.israeliStandard && results.israeliStandard.score) {
      scores.push(results.israeliStandard.score);
    }
    
    if (results.axe && results.axe.score) {
      scores.push(results.axe.score);
    }
    
    if (scores.length === 0) {
      return { score: 0, compliant: false };
    }
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: Math.round(averageScore),
      compliant: averageScore >= 80,
      breakdown: {
        wcag: results.wcag?.score || 0,
        israeliStandard: results.israeliStandard?.score || 0,
        axe: results.axe?.score || 0
      }
    };
  }

  /**
   * Get test results
   */
  getTestResults(testName = null) {
    if (testName) {
      return this.testResults.get(testName);
    }
    return Object.fromEntries(this.testResults);
  }

  /**
   * Clear test results
   */
  clearTestResults() {
    this.testResults.clear();
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport() {
    const results = this.getTestResults('comprehensive');
    
    if (!results) {
      return {
        error: 'No test results available. Run tests first.'
      };
    }
    
    return {
      timestamp: results.timestamp,
      overall: results.overall,
      wcag: results.wcag,
      israeliStandard: results.israeliStandard,
      recommendations: this._generateRecommendations(results),
      summary: this._generateSummary(results)
    };
  }

  /**
   * Generate recommendations
   */
  _generateRecommendations(results) {
    const recommendations = [];
    
    // WCAG recommendations
    if (results.wcag && results.wcag.score < 80) {
      const failedTests = Object.entries(results.wcag.results)
        .filter(([_, result]) => !result.passed)
        .map(([test, _]) => test);
      
      recommendations.push({
        category: 'WCAG Compliance',
        issues: failedTests,
        priority: 'High'
      });
    }
    
    // Israeli Standard recommendations
    if (results.israeliStandard && results.israeliStandard.score < 80) {
      const failedTests = Object.entries(results.israeliStandard.results)
        .filter(([_, result]) => !result.passed)
        .map(([test, _]) => test);
      
      recommendations.push({
        category: 'Israeli Standard 5568',
        issues: failedTests,
        priority: 'High'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate summary
   */
  _generateSummary(results) {
    return {
      overallScore: results.overall.score,
      overallCompliant: results.overall.compliant,
      wcagCompliant: results.wcag?.compliant || false,
      israeliStandardCompliant: results.israeliStandard?.compliant || false,
      totalTests: (results.wcag?.results ? Object.keys(results.wcag.results).length : 0) +
                 (results.israeliStandard?.results ? Object.keys(results.israeliStandard.results).length : 0),
      passedTests: (results.wcag?.results ? Object.values(results.wcag.results).filter(r => r.passed).length : 0) +
                  (results.israeliStandard?.results ? Object.values(results.israeliStandard.results).filter(r => r.passed).length : 0)
    };
  }

  /**
   * Test color contrast ratios
   */
  _testColorContrast() {
    const results = {
      passed: true,
      violations: [],
      recommendations: []
    };

    try {
      // Get all text elements
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, input, label');
      
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const contrast = this.accessify.visual?.validateColorContrast(color, backgroundColor);
          
          if (contrast && contrast.level === 'fail') {
            results.passed = false;
            results.violations.push({
              element: element,
              contrast: contrast.ratio,
              message: contrast.message
            });
          }
        }
      });
      
      if (results.violations.length === 0) {
        results.recommendations.push('All text elements meet WCAG AA contrast requirements');
      } else {
        results.recommendations.push(`Fix ${results.violations.length} contrast violations`);
      }
      
    } catch (error) {
      results.passed = false;
      results.violations.push({
        error: error.message,
        message: 'Error testing color contrast'
      });
    }

    return results;
  }

  /**
   * Test focus indicators
   */
  _testFocusIndicators() {
    const results = {
      passed: true,
      violations: [],
      recommendations: []
    };

    try {
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
      
      focusableElements.forEach(element => {
        const styles = window.getComputedStyle(element, ':focus');
        const outline = styles.outline;
        const outlineWidth = styles.outlineWidth;
        const boxShadow = styles.boxShadow;
        
        if (outline === 'none' && outlineWidth === '0px' && !boxShadow) {
          results.passed = false;
          results.violations.push({
            element: element,
            message: 'Element lacks visible focus indicator'
          });
        }
      });
      
      if (results.violations.length === 0) {
        results.recommendations.push('All focusable elements have visible focus indicators');
      } else {
        results.recommendations.push(`Add focus indicators to ${results.violations.length} elements`);
      }
      
    } catch (error) {
      results.passed = false;
      results.violations.push({
        error: error.message,
        message: 'Error testing focus indicators'
      });
    }

    return results;
  }

  /**
   * Test ARIA implementation
   */
  _testARIAImplementation() {
    const results = {
      passed: true,
      violations: [],
      recommendations: []
    };

    try {
      // Test for missing alt text
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
          results.passed = false;
          results.violations.push({
            element: img,
            message: 'Image missing alt text or aria-label'
          });
        }
      });

      // Test for proper form labels
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const id = input.id;
        const label = document.querySelector(`label[for="${id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        
        if (!label && !ariaLabel && !ariaLabelledby) {
          results.passed = false;
          results.violations.push({
            element: input,
            message: 'Form element missing label or aria-label'
          });
        }
      });

      // Test for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > previousLevel + 1) {
          results.passed = false;
          results.violations.push({
            element: heading,
            message: `Heading level ${level} skips level ${previousLevel + 1}`
          });
        }
        previousLevel = level;
      });
      
      if (results.violations.length === 0) {
        results.recommendations.push('ARIA implementation is compliant');
      } else {
        results.recommendations.push(`Fix ${results.violations.length} ARIA violations`);
      }
      
    } catch (error) {
      results.passed = false;
      results.violations.push({
        error: error.message,
        message: 'Error testing ARIA implementation'
      });
    }

    return results;
  }

  /**
   * Test screen reader compatibility
   */
  _testScreenReaderCompatibility() {
    const results = {
      passed: true,
      violations: [],
      recommendations: []
    };

    try {
      // Test for proper semantic HTML
      const semanticElements = document.querySelectorAll('main, nav, section, article, aside, header, footer');
      if (semanticElements.length === 0) {
        results.passed = false;
        results.violations.push({
          message: 'No semantic HTML elements found'
        });
      }

      // Test for proper landmark roles
      const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
      if (landmarks.length === 0 && semanticElements.length === 0) {
        results.passed = false;
        results.violations.push({
          message: 'No landmark roles or semantic elements found'
        });
      }

      // Test for proper list structure
      const lists = document.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        if (items.length === 0) {
          results.passed = false;
          results.violations.push({
            element: list,
            message: 'List element has no list items'
          });
        }
      });
      
      if (results.violations.length === 0) {
        results.recommendations.push('Screen reader compatibility is good');
      } else {
        results.recommendations.push(`Fix ${results.violations.length} screen reader issues`);
      }
      
    } catch (error) {
      results.passed = false;
      results.violations.push({
        error: error.message,
        message: 'Error testing screen reader compatibility'
      });
    }

    return results;
  }

  /**
   * Test RTL support
   */
  _testRTLSupport() {
    const results = {
      passed: true,
      violations: [],
      recommendations: []
    };

    try {
      // Test for RTL language support
      const rtlElements = document.querySelectorAll('[dir="rtl"], [lang="he"], [lang="ar"]');
      if (rtlElements.length > 0) {
        // Test for proper RTL styling
        rtlElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          const direction = styles.direction;
          
          if (direction !== 'rtl') {
            results.passed = false;
            results.violations.push({
              element: element,
              message: 'RTL element does not have RTL direction'
            });
          }
        });
      }

      // Test for Hebrew/Arabic text support
      const hebrewText = document.querySelectorAll('*');
      let hasHebrewText = false;
      hebrewText.forEach(element => {
        if (element.textContent && /[\u0590-\u05FF]/.test(element.textContent)) {
          hasHebrewText = true;
        }
      });

      if (hasHebrewText) {
        const htmlDir = document.documentElement.getAttribute('dir');
        if (htmlDir !== 'rtl') {
          results.recommendations.push('Consider setting dir="rtl" on html element for Hebrew text');
        }
      }
      
      if (results.violations.length === 0) {
        results.recommendations.push('RTL support is properly implemented');
      } else {
        results.recommendations.push(`Fix ${results.violations.length} RTL issues`);
      }
      
    } catch (error) {
      results.passed = false;
      results.violations.push({
        error: error.message,
        message: 'Error testing RTL support'
      });
    }

    return results;
  }

  /**
   * Test keyboard navigation
   */
  _testKeyboardNavigation() {
    const results = {
      passed: true,
      violations: [],
      recommendations: []
    };

    try {
      const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const tabOrder = [];
      
      focusableElements.forEach(element => {
        const tabIndex = parseInt(element.getAttribute('tabindex')) || 0;
        tabOrder.push({ element, tabIndex });
      });

      // Sort by tab index
      tabOrder.sort((a, b) => a.tabIndex - b.tabIndex);

      // Test for logical tab order
      let previousPosition = { x: -1, y: -1 };
      tabOrder.forEach(({ element }) => {
        const rect = element.getBoundingClientRect();
        const currentPosition = { x: rect.left, y: rect.top };
        
        // Check if tab order follows visual order (roughly)
        if (currentPosition.y < previousPosition.y - 50) {
          results.passed = false;
          results.violations.push({
            element: element,
            message: 'Tab order may not follow visual order'
          });
        }
        
        previousPosition = currentPosition;
      });

      // Test for keyboard traps
      const modals = document.querySelectorAll('[role="dialog"], [role="modal"]');
      modals.forEach(modal => {
        const focusableInModal = modal.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableInModal.length === 0) {
          results.passed = false;
          results.violations.push({
            element: modal,
            message: 'Modal dialog has no focusable elements'
          });
        }
      });
      
      if (results.violations.length === 0) {
        results.recommendations.push('Keyboard navigation is properly implemented');
      } else {
        results.recommendations.push(`Fix ${results.violations.length} keyboard navigation issues`);
      }
      
    } catch (error) {
      results.passed = false;
      results.violations.push({
        error: error.message,
        message: 'Error testing keyboard navigation'
      });
    }

    return results;
  }
}
