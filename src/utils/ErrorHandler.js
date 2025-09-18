/**
 * Error Handler for Accessify
 * Provides centralized error handling and logging
 */

export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.errorTypes = {
      INITIALIZATION: 'initialization',
      RUNTIME: 'runtime',
      CONFIGURATION: 'configuration',
      PLUGIN: 'plugin',
      COMPONENT: 'component',
      NETWORK: 'network',
      PERMISSION: 'permission',
      COMPATIBILITY: 'compatibility'
    };
  }

  /**
   * Handle error
   */
  handle(error, context = '', type = this.errorTypes.RUNTIME) {
    const errorInfo = this._createErrorInfo(error, context, type);
    
    // Add to errors array
    this.addError(errorInfo);
    
    // Log error
    this._logError(errorInfo);
    
    // Emit error event if available
    if (typeof window !== 'undefined' && window.Accessify && window.Accessify.prototype) {
      // Try to emit on the global instance if it exists
      if (window.accessifyInstance && typeof window.accessifyInstance.emit === 'function') {
        window.accessifyInstance.emit('error', errorInfo);
      }
    }
    
    return errorInfo;
  }

  /**
   * Add error to collection
   */
  addError(errorInfo) {
    this.errors.push(errorInfo);
    
    // Limit error collection size
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  /**
   * Create error info object
   */
  _createErrorInfo(error, context, type) {
    return {
      id: this._generateErrorId(),
      timestamp: new Date().toISOString(),
      type,
      context,
      message: error.message || String(error),
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: this._determineSeverity(error, type),
      recoverable: this._isRecoverable(error, type)
    };
  }

  /**
   * Generate unique error ID
   */
  _generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determine error severity
   */
  _determineSeverity(error, type) {
    const severityMap = {
      [this.errorTypes.INITIALIZATION]: 'high',
      [this.errorTypes.CONFIGURATION]: 'medium',
      [this.errorTypes.PLUGIN]: 'medium',
      [this.errorTypes.COMPONENT]: 'medium',
      [this.errorTypes.NETWORK]: 'low',
      [this.errorTypes.PERMISSION]: 'high',
      [this.errorTypes.COMPATIBILITY]: 'high',
      [this.errorTypes.RUNTIME]: 'medium'
    };
    
    return severityMap[type] || 'medium';
  }

  /**
   * Check if error is recoverable
   */
  _isRecoverable(error, type) {
    const recoverableTypes = [
      this.errorTypes.NETWORK,
      this.errorTypes.PLUGIN,
      this.errorTypes.COMPONENT
    ];
    
    return recoverableTypes.includes(type);
  }

  /**
   * Log error
   */
  _logError(errorInfo) {
    const logLevel = this._getLogLevel(errorInfo.severity);
    const logMessage = this._formatLogMessage(errorInfo);
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, errorInfo);
        break;
      case 'warn':
        console.warn(logMessage, errorInfo);
        break;
      case 'info':
        console.info(logMessage, errorInfo);
        break;
      default:
        console.log(logMessage, errorInfo);
    }
  }

  /**
   * Get log level based on severity
   */
  _getLogLevel(severity) {
    const levelMap = {
      high: 'error',
      medium: 'warn',
      low: 'info'
    };
    
    return levelMap[severity] || 'log';
  }

  /**
   * Format log message
   */
  _formatLogMessage(errorInfo) {
    return `[Accessify ${errorInfo.type.toUpperCase()}] ${errorInfo.context}: ${errorInfo.message}`;
  }

  /**
   * Get all errors
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type) {
    return this.errors.filter(error => error.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity) {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      bySeverity: {},
      recent: this.getRecentErrors(5).length
    };
    
    // Count by type
    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });
    
    // Count by severity
    this.errors.forEach(error => {
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Check if there are critical errors
   */
  hasCriticalErrors() {
    return this.errors.some(error => error.severity === 'high');
  }

  /**
   * Get critical errors
   */
  getCriticalErrors() {
    return this.errors.filter(error => error.severity === 'high');
  }

  /**
   * Create error report
   */
  createErrorReport() {
    const stats = this.getErrorStats();
    const criticalErrors = this.getCriticalErrors();
    
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stats,
      criticalErrors,
      allErrors: this.errors,
      recommendations: this._getErrorRecommendations()
    };
  }

  /**
   * Get error recommendations
   */
  _getErrorRecommendations() {
    const recommendations = [];
    const stats = this.getErrorStats();
    
    if (stats.byType[this.errorTypes.COMPATIBILITY] > 0) {
      recommendations.push('Consider updating your browser or using a supported browser');
    }
    
    if (stats.byType[this.errorTypes.PERMISSION] > 0) {
      recommendations.push('Check browser permissions for microphone, camera, and storage access');
    }
    
    if (stats.byType[this.errorTypes.NETWORK] > 0) {
      recommendations.push('Check your internet connection and try again');
    }
    
    if (stats.byType[this.errorTypes.PLUGIN] > 0) {
      recommendations.push('Some accessibility plugins may not be working correctly');
    }
    
    return recommendations;
  }

  /**
   * Wrap function with error handling
   */
  wrapFunction(fn, context = '', type = this.errorTypes.RUNTIME) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, context, type);
        throw error;
      }
    };
  }

  /**
   * Wrap async function with error handling
   */
  wrapAsyncFunction(fn, context = '', type = this.errorTypes.RUNTIME) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, context, type);
        throw error;
      }
    };
  }

  /**
   * Create error boundary for components
   */
  createErrorBoundary(componentName) {
    return {
      catch: (error, context = '') => {
        this.handle(error, `${componentName}: ${context}`, this.errorTypes.COMPONENT);
      },
      
      wrap: (fn) => {
        return this.wrapFunction(fn, componentName, this.errorTypes.COMPONENT);
      },
      
      wrapAsync: (fn) => {
        return this.wrapAsyncFunction(fn, componentName, this.errorTypes.COMPONENT);
      }
    };
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    // Unhandled errors
    window.addEventListener('error', (event) => {
      this.handle(event.error, 'Global error', this.errorTypes.RUNTIME);
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handle(event.reason, 'Unhandled promise rejection', this.errorTypes.RUNTIME);
    });
    
    // Console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Check if it's an Accessify-related error
      const message = args.join(' ');
      if (message.includes('Accessify') || message.includes('accessibility')) {
        this.handle(new Error(message), 'Console error', this.errorTypes.RUNTIME);
      }
    };
  }

  /**
   * Remove global error handlers
   */
  removeGlobalHandlers() {
    // Note: This is a simplified version. In a real implementation,
    // you'd need to store references to the original handlers
    console.warn('Global error handlers cannot be easily removed. Consider restarting the page.');
  }
}
