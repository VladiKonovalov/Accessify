# Changelog

All notable changes to Accessify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added
- Initial release of Accessify accessibility toolkit
- Comprehensive visual accessibility features
  - Text size adjustment (50%-300% zoom)
  - High contrast modes (normal, high, inverted, grayscale)
  - Brightness and contrast controls
  - Colorblind-friendly themes
  - Custom cursors (large, high-contrast)
  - Enhanced focus indicators
- Complete navigation accessibility
  - Full keyboard navigation support
  - Skip-to-content links
  - Focus trapping for modals
  - Custom keyboard shortcuts
  - Tab order optimization
- Reading and comprehension tools
  - Text-to-speech with multiple voices
  - Reading speed and pitch control
  - Dyslexia-friendly fonts (OpenDyslexic, Lexend, Atkinson Hyperlegible)
  - Line and letter spacing controls
  - Reading guide/ruler
  - Text highlighting and masking
- Motor and mobility support
  - Large click/tap targets (minimum 44px)
  - Touch-friendly controls
  - Gesture alternatives (swipe, tap)
  - Voice command support
  - Reduced motion options
  - Configurable interaction delays
- Multilingual and RTL support
  - Full RTL compatibility (Hebrew, Arabic)
  - Language detection and switching
  - Translation support
  - Cultural adaptations for RTL layouts
- Modular plugin system
  - Built-in plugins (Text-to-Speech, Voice Commands, Switch Navigation)
  - Custom plugin support
  - Plugin lifecycle management
- Comprehensive testing and compliance
  - WCAG 2.1 AA compliance testing
  - Israeli Standard 5568 compliance testing
  - Axe integration support
  - Lighthouse integration support
  - Manual testing tools
  - Compliance reporting
- Browser compatibility
  - Chrome 60+
  - Firefox 55+
  - Safari 12+
  - Edge 79+
  - Progressive enhancement for older browsers
- TypeScript definitions
- Comprehensive documentation
- Example implementation

### Technical Features
- Vanilla JavaScript (ES6+) with optional jQuery support
- ES6 modules and CommonJS support
- Self-contained with no external CDN dependencies
- Component-based, event-driven architecture
- Configuration-driven design
- Clean separation of concerns
- Immutable state management
- Built-in error handling and graceful fallbacks
- Event system for integration
- State management with change tracking
- Plugin system for extensions
- Browser detection and feature detection
- Error handling and logging
- Testing utilities and compliance validation

### Standards Compliance
- WCAG 2.0/2.1 AA compliance
- Israeli Standard 5568 compliance
- Section 508 compliance
- EN 301 549 compliance
- Accessibility best practices

### Documentation
- Complete API documentation
- Usage examples
- Configuration guide
- Plugin development guide
- Testing guide
- Compliance guide
- Browser support information
- Troubleshooting guide

## [2.0.0] - 2025-02-15

### Changed
- **BREAKING**: Replaced legacy Toolbar V1 with Toolbar V2
- Simplified API: `new Accessify.ToolbarV2()` with `init()` and `destroy()`
- Streamlined feature set focused on WCAG 2.1 AA–oriented controls

### Added
- Figma-based Toolbar V2 with modern UI
- Text size control (80%–200%)
- Contrast modes: Normal, High, Dark
- Text spacing: Normal / Wide
- Dyslexia-friendly font toggle
- Link highlighting toggle
- Cursor highlight (focus circle)
- Color adjustments: grayscale, invert
- Language control (English, Hebrew)
- Customize section: show/hide individual controls
- Settings persisted in `localStorage`
- RTL support (Hebrew)
- `syncWithPageLanguage` option for lang/dir sync
- `availableControls` option to limit which controls are available
- `getSettings()` API for integration
- TypeScript definitions for ToolbarV2

### Removed
- Legacy Toolbar V1
- Plugin system (Text-to-Speech, Voice Commands, Switch Navigation)
- accessify-integration.html
- Previous component architecture (VisualAccessibility, NavigationAccessibility, etc.)

### Technical
- Vanilla JavaScript ES6+ modules
- Rollup build: UMD, ESM, CJS
- npm, Maven, Gradle packaging
- Jest tests for ToolbarV2

## [Unreleased]

### Planned
- Additional languages
- More accessibility controls
