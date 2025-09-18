/**
 * Plugin Manager for Accessify
 * Handles plugin registration, loading, and lifecycle management
 */

export class PluginManager {
  constructor(accessify) {
    this.accessify = accessify;
    this.plugins = new Map();
    this.initializedPlugins = new Set();
    this.pluginConfigs = new Map();
  }

  /**
   * Register a plugin
   */
  register(name, pluginClass, config = {}) {
    if (typeof pluginClass !== 'function') {
      throw new Error('Plugin must be a class or constructor function');
    }

    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already registered`);
      return this;
    }

    this.plugins.set(name, pluginClass);
    this.pluginConfigs.set(name, config);
    
    console.log(`Plugin "${name}" registered successfully`);
    return this;
  }

  /**
   * Unregister a plugin
   */
  unregister(name) {
    if (this.plugins.has(name)) {
      // Destroy if initialized
      if (this.initializedPlugins.has(name)) {
        this.destroy(name);
      }
      
      this.plugins.delete(name);
      this.pluginConfigs.delete(name);
      console.log(`Plugin "${name}" unregistered`);
    }
    return this;
  }

  /**
   * Initialize all registered plugins
   */
  async init() {
    const enabledPlugins = this.accessify.configManager.get('plugins.builtIn', []);
    
    for (const pluginName of enabledPlugins) {
      if (this.plugins.has(pluginName)) {
        await this.initPlugin(pluginName);
      }
    }
  }

  /**
   * Initialize a specific plugin
   */
  async initPlugin(name) {
    if (!this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    if (this.initializedPlugins.has(name)) {
      console.warn(`Plugin "${name}" is already initialized`);
      return this;
    }

    try {
      const PluginClass = this.plugins.get(name);
      const config = this.pluginConfigs.get(name);
      
      // Create plugin instance
      const plugin = new PluginClass(this.accessify, config);
      
      // Initialize plugin
      if (typeof plugin.init === 'function') {
        await plugin.init();
      }
      
      // Store initialized plugin
      this.plugins.set(name, plugin);
      this.initializedPlugins.add(name);
      
      this.accessify.emit('pluginInitialized', { name, plugin });
      console.log(`Plugin "${name}" initialized successfully`);
      
    } catch (error) {
      console.error(`Failed to initialize plugin "${name}":`, error);
      throw error;
    }
  }

  /**
   * Destroy all initialized plugins
   */
  destroy() {
    for (const name of this.initializedPlugins) {
      this.destroyPlugin(name);
    }
  }

  /**
   * Destroy a specific plugin
   */
  destroyPlugin(name) {
    if (!this.initializedPlugins.has(name)) {
      return;
    }

    try {
      const plugin = this.plugins.get(name);
      
      if (plugin && typeof plugin.destroy === 'function') {
        plugin.destroy();
      }
      
      this.initializedPlugins.delete(name);
      this.accessify.emit('pluginDestroyed', { name });
      console.log(`Plugin "${name}" destroyed`);
      
    } catch (error) {
      console.error(`Failed to destroy plugin "${name}":`, error);
    }
  }

  /**
   * Get plugin instance
   */
  getPlugin(name) {
    if (!this.initializedPlugins.has(name)) {
      return null;
    }
    return this.plugins.get(name);
  }

  /**
   * Check if plugin is initialized
   */
  isInitialized(name) {
    return this.initializedPlugins.has(name);
  }

  /**
   * Get all registered plugins
   */
  getRegisteredPlugins() {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get all initialized plugins
   */
  getInitializedPlugins() {
    return Array.from(this.initializedPlugins);
  }

  /**
   * Update plugin configuration
   */
  updatePluginConfig(name, newConfig) {
    if (!this.pluginConfigs.has(name)) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    const currentConfig = this.pluginConfigs.get(name);
    const updatedConfig = { ...currentConfig, ...newConfig };
    this.pluginConfigs.set(name, updatedConfig);

    // Update plugin if initialized
    if (this.initializedPlugins.has(name)) {
      const plugin = this.plugins.get(name);
      if (plugin && typeof plugin.updateConfig === 'function') {
        plugin.updateConfig(updatedConfig);
      }
    }

    this.accessify.emit('pluginConfigUpdated', { name, config: updatedConfig });
  }

  /**
   * Enable plugin
   */
  enablePlugin(name) {
    const builtInPlugins = this.accessify.configManager.get('plugins.builtIn', []);
    if (!builtInPlugins.includes(name)) {
      builtInPlugins.push(name);
      this.accessify.configManager.set('plugins.builtIn', builtInPlugins);
    }
  }

  /**
   * Disable plugin
   */
  disablePlugin(name) {
    const builtInPlugins = this.accessify.configManager.get('plugins.builtIn', []);
    const index = builtInPlugins.indexOf(name);
    if (index > -1) {
      builtInPlugins.splice(index, 1);
      this.accessify.configManager.set('plugins.builtIn', builtInPlugins);
      
      // Destroy if initialized
      if (this.initializedPlugins.has(name)) {
        this.destroyPlugin(name);
      }
    }
  }

  /**
   * Load external plugin
   */
  async loadExternalPlugin(url, name, config = {}) {
    try {
      // Dynamic import of external plugin
      const module = await import(url);
      const PluginClass = module.default || module[name];
      
      if (!PluginClass) {
        throw new Error(`Plugin class not found in module: ${url}`);
      }
      
      this.register(name, PluginClass, config);
      await this.initPlugin(name);
      
      return this.getPlugin(name);
      
    } catch (error) {
      console.error(`Failed to load external plugin from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get plugin status
   */
  getPluginStatus() {
    const status = {};
    
    for (const name of this.plugins.keys()) {
      status[name] = {
        registered: true,
        initialized: this.initializedPlugins.has(name),
        config: this.pluginConfigs.get(name)
      };
    }
    
    return status;
  }

  /**
   * Validate plugin
   */
  validatePlugin(pluginClass) {
    const errors = [];
    
    if (typeof pluginClass !== 'function') {
      errors.push('Plugin must be a class or constructor function');
    }
    
    // Check for required methods
    const requiredMethods = ['init', 'destroy'];
    requiredMethods.forEach(method => {
      if (typeof pluginClass.prototype[method] !== 'function') {
        errors.push(`Plugin must implement ${method}() method`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create plugin API
   */
  createPluginAPI(pluginName) {
    return {
      name: pluginName,
      accessify: this.accessify,
      config: this.pluginConfigs.get(pluginName),
      
      // Event system
      on: (event, callback) => this.accessify.on(event, callback),
      off: (event, callback) => this.accessify.off(event, callback),
      emit: (event, ...args) => this.accessify.emit(event, ...args),
      
      // State management
      getState: () => this.accessify.getState(),
      setState: (state) => this.accessify.setState(state),
      
      // Configuration
      getConfig: (key, defaultValue) => this.accessify.configManager.get(key, defaultValue),
      setConfig: (key, value) => this.accessify.configManager.set(key, value),
      
      // Utilities
      log: (message, ...args) => console.log(`[${pluginName}]`, message, ...args),
      warn: (message, ...args) => console.warn(`[${pluginName}]`, message, ...args),
      error: (message, ...args) => console.error(`[${pluginName}]`, message, ...args)
    };
  }
}
