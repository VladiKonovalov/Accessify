# Accessify

A comprehensive, modular web accessibility toolkit supporting WCAG 2.0/2.1 AA and Israeli Standard 5568 with full RTL support and multilingual capabilities.

## Features

### 🎨 Visual Accessibility
- **Text Size Adjustment**: 50%–300% zoom with smooth transitions
- **High Contrast Modes**: Normal, high, inverted, and grayscale
- **Brightness & Contrast Controls**: Fine-tuned visual adjustments
- **Colorblind-Friendly Themes**: Optimized color palettes
- **Link Highlighting**: Enhanced focus indicators
- **Custom Cursors**: Large, high-contrast cursor options

### ⌨️ Navigation & Interaction
- **Full Keyboard Navigation**: Complete tab order optimization
- **Skip-to-Content Links**: Quick navigation to main content
- **Focus Trapping**: Modal and popup focus management
- **Custom Keyboard Shortcuts**: Configurable hotkeys
- **Alternative Input Devices**: Switch navigation support
- **Voice Navigation**: Voice command integration

### 📖 Reading & Comprehension
- **Text-to-Speech**: High-quality speech synthesis
- **Reading Speed Control**: Adjustable speech rate and pitch
- **Dyslexia-Friendly Fonts**: OpenDyslexic, Lexend, Atkinson Hyperlegible
- **Line and Letter Spacing**: Customizable text spacing
- **Reading Guide/Ruler**: Visual reading assistance
- **Text Highlighting/Masking**: Enhanced text focus

### 🎯 Motor & Mobility
- **Large Click/Tap Targets**: Minimum 44px target size
- **Touch-Friendly Controls**: Optimized for touch devices
- **Gesture Alternatives**: Swipe and tap gesture support
- **Voice Command Support**: Hands-free navigation
- **Reduced Motion Options**: Respects user preferences
- **Configurable Interaction Delays**: Customizable timing

### 🌍 Multilingual & RTL Support
- **Full RTL Compatibility**: Hebrew, Arabic, and other RTL languages
- **Language Detection**: Automatic language and direction detection
- **Translation Support**: Built-in translation system
- **Cultural Adaptations**: RTL-specific navigation and gestures

## Installation

### NPM
```bash
npm install accessify
```

### CDN
```html
<script src="https://unpkg.com/accessify/dist/accessify.min.js"></script>
```

### Direct Download
Download the latest release from the [releases page](https://github.com/accessify/accessify/releases).

## Quick Start

### Basic Usage
```javascript
// Initialize Accessify
const accessify = new Accessify({
  language: 'en',
  direction: 'ltr',
  theme: 'default'
});

// Initialize the toolkit
await accessify.init();

// Enable specific features
accessify.enableFeature('textSizeAdjustment');
accessify.enableFeature('highContrast');
accessify.enableFeature('keyboardNavigation');
```

### Advanced Configuration
```javascript
const accessify = new Accessify({
  language: 'he',
  direction: 'rtl',
  theme: 'dark',
  visual: {
    textSize: {
      enabled: true,
      current: 1.2,
      min: 0.5,
      max: 3.0
    },
    contrast: {
      enabled: true,
      current: 'high',
      modes: ['normal', 'high', 'inverted', 'grayscale']
    }
  },
  navigation: {
    keyboard: {
      enabled: true,
      shortcuts: {
        enabled: true,
        skipToContent: 'Alt+S',
        increaseTextSize: 'Alt+Plus',
        toggleContrast: 'Alt+C'
      }
    }
  },
  reading: {
    textToSpeech: {
      enabled: true,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    },
    fonts: {
      enabled: true,
      dyslexia: true,
      current: 'opendyslexic'
    }
  },
  motor: {
    targets: {
      enabled: true,
      minSize: 44,
      padding: 8
    },
    voice: {
      enabled: true,
      commands: true
    }
  },
  multilingual: {
    enabled: true,
    autoDetect: true,
    rtl: {
      enabled: true,
      autoDetect: true
    }
  }
});

await accessify.init();
```

## API Reference

### Core Methods

#### `init()`
Initialize the Accessify toolkit.
```javascript
await accessify.init();
```

#### `destroy()`
Destroy the Accessify instance and clean up resources.
```javascript
accessify.destroy();
```

#### `updateConfig(newConfig)`
Update the configuration.
```javascript
accessify.updateConfig({
  visual: {
    textSize: { current: 1.5 }
  }
});
```

### Visual Accessibility

#### Text Size
```javascript
// Set text size
accessify.visual.setTextSize(1.5);

// Increase/decrease text size
accessify.visual.increaseTextSize();
accessify.visual.decreaseTextSize();

// Reset to default
accessify.visual.resetTextSize();
```

#### Contrast and Themes
```javascript
// Set contrast mode
accessify.visual.setContrastMode('high');

// Toggle contrast
accessify.visual.toggleContrastMode();

// Set theme
accessify.visual.setTheme('dark');

// Set brightness
accessify.visual.setBrightness(1.2);
```

### Navigation Accessibility

#### Keyboard Shortcuts
```javascript
// Register custom shortcut
accessify.navigation.registerShortcut('Ctrl+Shift+A', () => {
  console.log('Custom shortcut activated');
});

// Unregister shortcut
accessify.navigation.unregisterShortcut('Ctrl+Shift+A');
```

#### Focus Management
```javascript
// Set focus trap for modal
const modal = document.getElementById('modal');
accessify.navigation.setFocusTrap(modal);
```

### Reading Accessibility

#### Text-to-Speech
```javascript
// Speak text
accessify.reading.speak('Hello, world!');

// Speak with options
accessify.reading.speak('Hello, world!', {
  rate: 1.2,
  pitch: 1.1,
  volume: 0.8
});

// Control playback
accessify.reading.pauseSpeech();
accessify.reading.resumeSpeech();
accessify.reading.stop();
```

#### Fonts and Spacing
```javascript
// Set dyslexia-friendly font
accessify.reading.setFont('opendyslexic');

// Adjust spacing
accessify.reading.setLineHeight(1.8);
accessify.reading.setLetterSpacing('0.1em');
accessify.reading.setWordSpacing('0.2em');
```

### Motor Accessibility

#### Voice Commands
```javascript
// Start voice recognition
accessify.motor.startVoiceRecognition();

// Stop voice recognition
accessify.motor.stopVoiceRecognition();
```

### Multilingual Support

#### Language and Direction
```javascript
// Set language
accessify.multilingual.setLanguage('he');

// Set direction
accessify.multilingual.setDirection('rtl');

// Get translation
const translation = accessify.multilingual.getTranslation('skipToContent', 'he');
```

## Plugin System

### Built-in Plugins

#### Text-to-Speech Plugin
```javascript
// Get plugin instance
const ttsPlugin = accessify.pluginManager.getPlugin('textToSpeech');

// Use plugin methods
ttsPlugin.speak('Hello, world!');
ttsPlugin.setRate(1.2);
ttsPlugin.setVolume(0.8);
```

#### Voice Commands Plugin
```javascript
// Get plugin instance
const voicePlugin = accessify.pluginManager.getPlugin('voiceCommands');

// Register custom command
voicePlugin.registerCommand('open menu', () => {
  document.getElementById('menu').click();
});

// Start listening
voicePlugin.startListening();
```

#### Switch Navigation Plugin
```javascript
// Get plugin instance
const switchPlugin = accessify.pluginManager.getPlugin('switchNavigation');

// Start scanning
switchPlugin.startScanning();

// Set scan speed
switchPlugin.setScanSpeed(1500);
```

### Custom Plugins

```javascript
class CustomPlugin {
  constructor(accessify, config) {
    this.accessify = accessify;
    this.config = config;
  }

  async init() {
    // Initialize plugin
  }

  destroy() {
    // Clean up plugin
  }
}

// Register custom plugin
accessify.pluginManager.register('customPlugin', CustomPlugin, {
  option1: 'value1'
});

// Initialize plugin
await accessify.pluginManager.initPlugin('customPlugin');
```

## Testing and Compliance

### Automated Testing
```javascript
// Run comprehensive accessibility tests
const results = await accessify.testing.runAccessibilityTests();

// Run specific tests
const wcagResults = await accessify.testing.runWCAGTests();
const israeliStandardResults = await accessify.testing.runIsraeliStandardTests();

// Generate compliance report
const report = accessify.testing.generateComplianceReport();
```

### Manual Testing
```javascript
// Test keyboard accessibility
const keyboardTest = accessify.testing.runManualTests().keyboard;

// Test screen reader accessibility
const screenReaderTest = accessify.testing.runManualTests().screenReader;
```

## Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## Compliance Standards

### WCAG 2.1 AA
Accessify helps achieve compliance with:
- **Perceivable**: Text size adjustment, high contrast, alt text
- **Operable**: Keyboard navigation, focus management, voice commands
- **Understandable**: Clear navigation, consistent behavior
- **Robust**: Cross-browser compatibility, progressive enhancement

### Israeli Standard 5568
Accessify supports:
- **RTL Support**: Hebrew and Arabic language support
- **Text Size Adjustment**: Minimum 200% zoom capability
- **High Contrast**: Enhanced contrast modes
- **Keyboard Navigation**: Full keyboard accessibility
- **Voice Commands**: Hebrew and Arabic voice recognition

## Events

Accessify emits events for integration and monitoring:

```javascript
// Listen for events
accessify.on('initialized', () => {
  console.log('Accessify initialized');
});

accessify.on('textSizeChanged', (newSize) => {
  console.log('Text size changed to:', newSize);
});

accessify.on('voiceCommand', (command) => {
  console.log('Voice command:', command);
});

accessify.on('accessibilityTestsCompleted', (results) => {
  console.log('Test results:', results);
});
```

## Configuration Options

### Complete Configuration
```javascript
const config = {
  version: '1.0.0',
  language: 'en',
  direction: 'ltr',
  theme: 'default',
  debug: false,
  
  visual: {
    textSize: {
      enabled: true,
      current: 1.0,
      min: 0.5,
      max: 3.0,
      step: 0.1
    },
    contrast: {
      enabled: true,
      current: 'normal',
      modes: ['normal', 'high', 'inverted', 'grayscale']
    },
    brightness: {
      enabled: true,
      current: 1.0,
      min: 0.3,
      max: 2.0,
      step: 0.1
    },
    themes: {
      enabled: true,
      current: 'default',
      available: ['default', 'dark', 'light', 'colorblind-friendly']
    },
    cursors: {
      enabled: true,
      current: 'default',
      available: ['default', 'large', 'high-contrast']
    },
    focusIndicators: {
      enabled: true,
      style: 'outline',
      color: '#0066cc',
      thickness: '2px'
    }
  },
  
  navigation: {
    keyboard: {
      enabled: true,
      shortcuts: {
        enabled: true,
        skipToContent: 'Alt+S',
        toggleMenu: 'Alt+M',
        increaseTextSize: 'Alt+Plus',
        decreaseTextSize: 'Alt+Minus',
        toggleContrast: 'Alt+C',
        toggleHighContrast: 'Alt+H'
      }
    },
    focus: {
      enabled: true,
      trap: true,
      visible: true,
      order: 'logical'
    },
    skipLinks: {
      enabled: true,
      visible: true
    }
  },
  
  reading: {
    textToSpeech: {
      enabled: true,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voice: 'auto'
    },
    fonts: {
      enabled: true,
      dyslexia: true,
      current: 'default',
      available: ['default', 'opendyslexic', 'lexend', 'atkinson']
    },
    spacing: {
      enabled: true,
      lineHeight: 1.5,
      letterSpacing: 'normal',
      wordSpacing: 'normal'
    },
    guides: {
      enabled: true,
      readingRuler: true,
      textHighlighting: true
    }
  },
  
  motor: {
    targets: {
      enabled: true,
      minSize: 44,
      padding: 8
    },
    gestures: {
      enabled: true,
      alternatives: true
    },
    voice: {
      enabled: true,
      commands: true
    },
    motion: {
      enabled: true,
      reduced: false
    },
    delays: {
      enabled: true,
      interaction: 0,
      hover: 0
    }
  },
  
  multilingual: {
    enabled: true,
    autoDetect: true,
    fallback: 'en',
    rtl: {
      enabled: true,
      autoDetect: true
    }
  },
  
  plugins: {
    enabled: true,
    autoLoad: true,
    builtIn: ['textToSpeech', 'voiceCommands', 'switchNavigation']
  },
  
  testing: {
    enabled: false,
    axe: true,
    lighthouse: true,
    manual: true
  }
};
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/accessify/accessify.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [https://accessify.dev/docs](https://accessify.dev/docs)
- **Issues**: [GitHub Issues](https://github.com/accessify/accessify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/accessify/accessify/discussions)
- **Email**: support@accessify.dev

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## Acknowledgments

- WCAG 2.1 guidelines and community
- Israeli Standard 5568 working group
- Open source accessibility tools and libraries
- Accessibility community contributors
# Accessify
