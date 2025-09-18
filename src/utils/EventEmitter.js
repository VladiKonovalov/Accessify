/**
 * Event Emitter for Accessify
 * Provides a simple event system for component communication
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    this.events.get(event).push(callback);
    return this;
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.events.has(event)) {
      return this;
    }

    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.events.delete(event);
    }

    return this;
  }

  /**
   * Emit event
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return this;
    }

    const callbacks = this.events.get(event);
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });

    return this;
  }

  /**
   * Add one-time event listener
   */
  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };

    return this.on(event, onceCallback);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * Get all event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event) {
    if (!this.events.has(event)) {
      return 0;
    }
    return this.events.get(event).length;
  }

  /**
   * Check if event has listeners
   */
  hasListeners(event) {
    return this.listenerCount(event) > 0;
  }
}
