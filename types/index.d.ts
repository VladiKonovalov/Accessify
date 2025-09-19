/**
 * TypeScript definitions for Accessify
 * A modular, reusable web accessibility toolkit
 */

declare class Accessify {
  constructor(options?: AccessifyOptions);
  
  readonly version: string;
  readonly isInitialized: boolean;
  
  // Core systems
  readonly eventEmitter: EventEmitter;
  readonly stateManager: StateManager;
  readonly configManager: ConfigManager;
  readonly pluginManager: PluginManager;
  readonly browserDetection: BrowserDetection;
  readonly errorHandler: ErrorHandler;
  
  // Components
  readonly visual: VisualAccessibility;
  readonly navigation: NavigationAccessibility;
  readonly reading: ReadingAccessibility;
  readonly motor: MotorAccessibility;
  readonly multilingual: MultilingualSupport;
  readonly aria: ARIAEnhancement;
  
  // Methods
  init(): Promise<Accessify>;
  destroy(): void;
  updateConfig(newConfig: Partial<AccessifyOptions>): void;
  getState(): Record<string, any>;
  setState(newState: Record<string, any>): void;
  on(event: string, callback: Function): Accessify;
  off(event: string, callback: Function): Accessify;
  emit(event: string, ...args: any[]): Accessify;
  getComponent(name: string): any;
  isFeatureEnabled(feature: string): boolean;
  enableFeature(feature: string): void;
  disableFeature(feature: string): void;
  getComplianceStatus(): ComplianceStatus;
}

interface AccessifyOptions {
  version?: string;
  language?: string;
  direction?: 'ltr' | 'rtl';
  theme?: string;
  debug?: boolean;
  visual?: VisualOptions;
  navigation?: NavigationOptions;
  reading?: ReadingOptions;
  motor?: MotorOptions;
  multilingual?: MultilingualOptions;
  plugins?: PluginOptions;
  testing?: TestingOptions;
}

interface VisualOptions {
  textSize?: {
    enabled?: boolean;
    current?: number;
    min?: number;
    max?: number;
    step?: number;
  };
  contrast?: {
    enabled?: boolean;
    current?: string;
    modes?: string[];
  };
  brightness?: {
    enabled?: boolean;
    current?: number;
    min?: number;
    max?: number;
    step?: number;
  };
  themes?: {
    enabled?: boolean;
    current?: string;
    available?: string[];
  };
  cursors?: {
    enabled?: boolean;
    current?: string;
    available?: string[];
  };
  focusIndicators?: {
    enabled?: boolean;
    style?: string;
    color?: string;
    thickness?: string;
  };
}

interface NavigationOptions {
  keyboard?: {
    enabled?: boolean;
    shortcuts?: {
      enabled?: boolean;
      skipToContent?: string;
      toggleMenu?: string;
      increaseTextSize?: string;
      decreaseTextSize?: string;
      toggleContrast?: string;
      toggleHighContrast?: string;
    };
  };
  focus?: {
    enabled?: boolean;
    trap?: boolean;
    visible?: boolean;
    order?: string;
  };
  skipLinks?: {
    enabled?: boolean;
    visible?: boolean;
  };
}

interface ReadingOptions {
  textToSpeech?: {
    enabled?: boolean;
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
  };
  fonts?: {
    enabled?: boolean;
    dyslexia?: boolean;
    current?: string;
    available?: string[];
  };
  spacing?: {
    enabled?: boolean;
    lineHeight?: number;
    letterSpacing?: string;
    wordSpacing?: string;
  };
  guides?: {
    enabled?: boolean;
    readingRuler?: boolean;
    textHighlighting?: boolean;
  };
}

interface MotorOptions {
  targets?: {
    enabled?: boolean;
    minSize?: number;
    padding?: number;
  };
  gestures?: {
    enabled?: boolean;
    alternatives?: boolean;
  };
  voice?: {
    enabled?: boolean;
    commands?: boolean;
  };
  motion?: {
    enabled?: boolean;
    reduced?: boolean;
  };
  delays?: {
    enabled?: boolean;
    interaction?: number;
    hover?: number;
  };
}

interface MultilingualOptions {
  enabled?: boolean;
  autoDetect?: boolean;
  fallback?: string;
  rtl?: {
    enabled?: boolean;
    autoDetect?: boolean;
  };
}

interface PluginOptions {
  enabled?: boolean;
  autoLoad?: boolean;
  builtIn?: string[];
}

interface TestingOptions {
  enabled?: boolean;
  axe?: boolean;
  lighthouse?: boolean;
  manual?: boolean;
}

interface ComplianceStatus {
  wcag: {
    level: string;
    version: string;
    compliant: boolean;
    score: number;
  };
  israeliStandard: {
    compliant: boolean;
    score: number;
  };
  features: {
    visual: any;
    navigation: any;
    reading: any;
    motor: any;
    multilingual: any;
  };
}

declare class EventEmitter {
  on(event: string, callback: Function): EventEmitter;
  off(event: string, callback: Function): EventEmitter;
  emit(event: string, ...args: any[]): EventEmitter;
  once(event: string, callback: Function): EventEmitter;
  removeAllListeners(event?: string): EventEmitter;
  eventNames(): string[];
  listenerCount(event: string): number;
  hasListeners(event: string): boolean;
}

declare class StateManager {
  getState(): Record<string, any>;
  get(key: string): any;
  set(key: string, value: any): StateManager;
  setState(newState: Record<string, any>): StateManager;
  delete(key: string): StateManager;
  has(key: string): boolean;
  clear(): StateManager;
  subscribe(key: string, callback: Function): Function;
  unsubscribe(key: string, callback: Function): void;
  getHistory(): any[];
  clearHistory(): void;
  undo(): boolean;
  createSelector(selector: Function): Function;
  size(): number;
  keys(): string[];
  values(): any[];
  entries(): [string, any][];
}

declare class ConfigManager {
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): ConfigManager;
  update(newConfig: Record<string, any>): void;
  getAll(): Record<string, any>;
  isFeatureEnabled(feature: string): boolean;
  enableFeature(feature: string): void;
  disableFeature(feature: string): void;
  toggleFeature(feature: string): void;
  getEnabledFeatures(): string[];
  getDisabledFeatures(): string[];
  reset(): void;
  validate(): { valid: boolean; errors: string[] };
}

declare class PluginManager {
  register(name: string, pluginClass: Function, config?: any): PluginManager;
  unregister(name: string): PluginManager;
  init(): Promise<void>;
  initPlugin(name: string): Promise<void>;
  destroy(): void;
  destroyPlugin(name: string): void;
  getPlugin(name: string): any;
  isInitialized(name: string): boolean;
  getRegisteredPlugins(): string[];
  getInitializedPlugins(): string[];
  updatePluginConfig(name: string, newConfig: any): void;
  enablePlugin(name: string): void;
  disablePlugin(name: string): void;
  loadExternalPlugin(url: string, name: string, config?: any): Promise<any>;
  getPluginStatus(): Record<string, any>;
  validatePlugin(pluginClass: Function): { valid: boolean; errors: string[] };
  createPluginAPI(pluginName: string): any;
}

declare class BrowserDetection {
  readonly userAgent: string;
  readonly browser: string;
  readonly version: string | number;
  readonly features: Record<string, boolean>;
  readonly isSupported: boolean;
  
  getInfo(): BrowserInfo;
  hasFeature(feature: string): boolean;
  getUnsupportedFeatures(): string[];
  getCapabilitiesScore(): number;
  getAccessibilitySupport(): Record<string, boolean>;
  getRecommendedFeatures(): string[];
  getOptimizations(): Record<string, any>;
}

interface BrowserInfo {
  browser: string;
  version: string | number;
  userAgent: string;
  isSupported: boolean;
  features: Record<string, boolean>;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

declare class ErrorHandler {
  handle(error: Error, context?: string, type?: string): ErrorInfo;
  addError(errorInfo: ErrorInfo): void;
  getErrors(): ErrorInfo[];
  getErrorsByType(type: string): ErrorInfo[];
  getErrorsBySeverity(severity: string): ErrorInfo[];
  getRecentErrors(count?: number): ErrorInfo[];
  clearErrors(): void;
  getErrorStats(): ErrorStats;
  hasCriticalErrors(): boolean;
  getCriticalErrors(): ErrorInfo[];
  createErrorReport(): ErrorReport;
  wrapFunction(fn: Function, context?: string, type?: string): Function;
  wrapAsyncFunction(fn: Function, context?: string, type?: string): Function;
  createErrorBoundary(componentName: string): any;
  setupGlobalHandlers(): void;
  removeGlobalHandlers(): void;
}

interface ErrorInfo {
  id: string;
  timestamp: string;
  type: string;
  context: string;
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  severity: string;
  recoverable: boolean;
}

interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recent: number;
}

interface ErrorReport {
  timestamp: string;
  userAgent: string;
  url: string;
  stats: ErrorStats;
  criticalErrors: ErrorInfo[];
  allErrors: ErrorInfo[];
  recommendations: string[];
}

declare class VisualAccessibility {
  constructor(accessify: Accessify);
  
  readonly isInitialized: boolean;
  
  init(): Promise<void>;
  destroy(): void;
  setTextSize(size: number): void;
  increaseTextSize(): void;
  decreaseTextSize(): void;
  resetTextSize(): void;
  setContrastMode(mode: string): void;
  toggleContrastMode(): void;
  setBrightness(level: number): void;
  setTheme(theme: string): void;
  setCursor(cursorType: string): void;
  setFocusIndicator(style: string): void;
  getComplianceStatus(): any;
  getCurrentSettings(): any;
  reset(): void;
}

declare class NavigationAccessibility {
  constructor(accessify: Accessify);
  
  readonly isInitialized: boolean;
  
  init(): Promise<void>;
  destroy(): void;
  registerShortcut(shortcut: string, callback: Function): void;
  unregisterShortcut(shortcut: string): void;
  setFocusTrap(element: HTMLElement): void;
  getComplianceStatus(): any;
  getCurrentSettings(): any;
}

declare class ReadingAccessibility {
  constructor(accessify: Accessify);
  
  readonly isInitialized: boolean;
  readonly speechSynthesis: SpeechSynthesis | null;
  readonly currentUtterance: SpeechSynthesisUtterance | null;
  
  init(): Promise<void>;
  destroy(): void;
  speak(text: string, options?: any): void;
  pauseSpeech(): void;
  resumeSpeech(): void;
  getAvailableVoices(): VoiceInfo[];
  setFont(fontName: string): void;
  setLineHeight(height: number): void;
  setLetterSpacing(spacing: string): void;
  setWordSpacing(spacing: string): void;
  getComplianceStatus(): any;
  getCurrentSettings(): any;
  reset(): void;
}

interface VoiceInfo {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

declare class MotorAccessibility {
  constructor(accessify: Accessify);
  
  readonly isInitialized: boolean;
  readonly voiceRecognition: any;
  readonly gestureRecognizer: any;
  readonly motionSensor: any;
  readonly targetEnlarger: HTMLElement | null;
  
  init(): Promise<void>;
  destroy(): void;
  startVoiceRecognition(): void;
  stopVoiceRecognition(): void;
  getComplianceStatus(): any;
  getCurrentSettings(): any;
  reset(): void;
}

declare class MultilingualSupport {
  constructor(accessify: Accessify);
  
  readonly isInitialized: boolean;
  readonly currentLanguage: string;
  readonly currentDirection: string;
  readonly rtlLanguages: string[];
  readonly translations: Map<string, any>;
  readonly directionObserver: MutationObserver | null;
  
  init(): Promise<void>;
  destroy(): void;
  setLanguage(language: string): void;
  setDirection(direction: string): void;
  getTranslation(key: string, language?: string): string;
  isRTLLanguage(language?: string): boolean;
  getCurrentLanguage(): string;
  getCurrentDirection(): string;
  getSupportedLanguages(): string[];
  getComplianceStatus(): any;
  getCurrentSettings(): any;
  reset(): void;
}

declare class TextToSpeechPlugin {
  constructor(accessify: Accessify, config?: any);
  
  readonly isInitialized: boolean;
  readonly speechSynthesis: SpeechSynthesis | null;
  readonly currentUtterance: SpeechSynthesisUtterance | null;
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  
  init(): Promise<void>;
  destroy(): void;
  speak(text: string, options?: any): void;
  pause(): void;
  resume(): void;
  stop(): void;
  setRate(rate: number): void;
  setVolume(volume: number): void;
  setVoice(voiceName: string): void;
  getAvailableVoices(): VoiceInfo[];
  getStatus(): any;
  updateConfig(newConfig: any): void;
}

declare class VoiceCommandsPlugin {
  constructor(accessify: Accessify, config?: any);
  
  readonly isInitialized: boolean;
  readonly voiceRecognition: any;
  readonly isListening: boolean;
  readonly commands: Map<string, Function>;
  
  init(): Promise<void>;
  destroy(): void;
  registerCommand(command: string, callback: Function): void;
  unregisterCommand(command: string): void;
  startListening(): void;
  stopListening(): void;
  toggleListening(): void;
  getStatus(): any;
  updateConfig(newConfig: any): void;
}

declare class SwitchNavigationPlugin {
  constructor(accessify: Accessify, config?: any);
  
  readonly isInitialized: boolean;
  readonly switchElements: HTMLElement[];
  readonly currentIndex: number;
  readonly isScanning: boolean;
  readonly scanSpeed: number;
  
  init(): Promise<void>;
  destroy(): void;
  startScanning(): void;
  stopScanning(): void;
  toggleScanning(): void;
  nextElement(): void;
  previousElement(): void;
  activateCurrentElement(): void;
  setScanSpeed(speed: number): void;
  getStatus(): any;
  updateConfig(newConfig: any): void;
}

declare class ARIAEnhancement {
  constructor(accessify: Accessify);
  
  readonly isInitialized: boolean;
  readonly enhancedElements: Set<HTMLElement>;
  readonly ariaObserver: MutationObserver | null;
  
  init(): Promise<void>;
  destroy(): void;
  enhanceElement(element: HTMLElement, attributes: Record<string, string>): void;
  removeEnhancement(element: HTMLElement, attributes: string | string[]): void;
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  getComplianceStatus(): {
    enhancedElements: number;
    liveRegions: {
      polite: boolean;
      assertive: boolean;
    };
    wcagCompliant: boolean;
    israeliStandardCompliant: boolean;
  };
  reset(): void;
}

declare class TestingUtils {
  constructor(accessify: Accessify);
  
  readonly testResults: Map<string, any>;
  readonly complianceChecks: Map<string, any>;
  readonly axeResults: any;
  readonly lighthouseResults: any;
  
  runAccessibilityTests(): Promise<any>;
  runWCAGTests(): Promise<any>;
  runIsraeliStandardTests(): Promise<any>;
  runAxeTests(): Promise<any>;
  runLighthouseTests(): Promise<any>;
  runManualTests(): Promise<any>;
  getTestResults(testName?: string): any;
  clearTestResults(): void;
  generateComplianceReport(): any;
}

// Global declarations
declare global {
  interface Window {
    Accessify: typeof Accessify;
    axe?: any;
    lighthouse?: any;
  }
}

export = Accessify;
export as namespace Accessify;
