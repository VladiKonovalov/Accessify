/**
 * State Manager for Accessify
 * Provides immutable state management with change tracking
 */

export class StateManager {
  constructor() {
    this.state = new Map();
    this.history = [];
    this.maxHistorySize = 50;
    this.listeners = new Map();
  }

  /**
   * Get current state
   */
  getState() {
    return Object.fromEntries(this.state);
  }

  /**
   * Get specific state value
   */
  get(key) {
    return this.state.get(key);
  }

  /**
   * Set state value
   */
  set(key, value) {
    const oldValue = this.state.get(key);
    
    // Only update if value has changed
    if (oldValue !== value) {
      this._addToHistory(key, oldValue, value);
      this.state.set(key, value);
      this._notifyListeners(key, value, oldValue);
    }
    
    return this;
  }

  /**
   * Set multiple state values
   */
  setState(newState) {
    if (typeof newState !== 'object' || newState === null) {
      throw new Error('State must be an object');
    }

    const changes = {};
    let hasChanges = false;

    // Update existing keys
    for (const [key, value] of Object.entries(newState)) {
      const oldValue = this.state.get(key);
      if (oldValue !== value) {
        changes[key] = { old: oldValue, new: value };
        this._addToHistory(key, oldValue, value);
        this.state.set(key, value);
        hasChanges = true;
      }
    }

    // Notify listeners if there were changes
    if (hasChanges) {
      this._notifyListeners('*', changes, null);
    }

    return this;
  }

  /**
   * Delete state key
   */
  delete(key) {
    const oldValue = this.state.get(key);
    if (this.state.has(key)) {
      this._addToHistory(key, oldValue, undefined);
      this.state.delete(key);
      this._notifyListeners(key, undefined, oldValue);
    }
    return this;
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.state.has(key);
  }

  /**
   * Clear all state
   */
  clear() {
    const oldState = this.getState();
    this._addToHistory('*', oldState, {});
    this.state.clear();
    this._notifyListeners('*', {}, oldState);
    return this;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    this.listeners.get(key).push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(key, callback);
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(key, callback) {
    if (!this.listeners.has(key)) {
      return;
    }

    const callbacks = this.listeners.get(key);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.listeners.delete(key);
    }
  }

  /**
   * Get state history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Undo last change
   */
  undo() {
    if (this.history.length === 0) {
      return false;
    }

    const lastChange = this.history.pop();
    
    if (lastChange.key === '*') {
      // Full state change
      this.state.clear();
      if (lastChange.oldValue) {
        this.setState(lastChange.oldValue);
      }
    } else {
      // Single key change
      if (lastChange.oldValue === undefined) {
        this.state.delete(lastChange.key);
      } else {
        this.state.set(lastChange.key, lastChange.oldValue);
      }
    }

    return true;
  }

  /**
   * Add change to history
   */
  _addToHistory(key, oldValue, newValue) {
    this.history.push({
      key,
      oldValue,
      newValue,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Notify listeners of state changes
   */
  _notifyListeners(key, newValue, oldValue) {
    // Notify specific key listeners
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key);
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error(`Error in state listener for "${key}":`, error);
        }
      });
    }

    // Notify wildcard listeners
    if (this.listeners.has('*')) {
      const callbacks = this.listeners.get('*');
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error('Error in wildcard state listener:', error);
        }
      });
    }
  }

  /**
   * Create a selector function for derived state
   */
  createSelector(selector) {
    if (typeof selector !== 'function') {
      throw new Error('Selector must be a function');
    }

    let lastResult = null;
    let lastState = null;

    return () => {
      const currentState = this.getState();
      
      // Check if state has changed
      if (currentState !== lastState) {
        lastState = currentState;
        lastResult = selector(currentState);
      }
      
      return lastResult;
    };
  }

  /**
   * Get state size
   */
  size() {
    return this.state.size;
  }

  /**
   * Get all keys
   */
  keys() {
    return Array.from(this.state.keys());
  }

  /**
   * Get all values
   */
  values() {
    return Array.from(this.state.values());
  }

  /**
   * Get all entries
   */
  entries() {
    return Array.from(this.state.entries());
  }
}
