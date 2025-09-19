# Accessify Integration Guide

This guide provides step-by-step instructions for integrating the Accessify accessibility tool into any website.

## Quick Start

1. **Download the integration file**: `accessify-integration.html`
2. **Include the Accessify library**: Add `<script src="path/to/accessify.min.js"></script>` to your website
3. **Copy the code sections** as described below
4. **Test the integration**

## Integration Steps

### Step 1: Copy CSS Styles

Copy the CSS section marked with `ACCESSIFY INTEGRATION STYLES` from `accessify-integration.html` to your website's CSS file or `<style>` block.

**Key CSS Classes:**
- `.accessify-toggle` - The floating accessibility button
- `.accessify-panel` - The accessibility controls panel
- `.accessify-control-group` - Individual control sections
- `.accessify-rtl` - RTL language support

### Step 2: Copy HTML Structure

Copy the HTML section marked with `ACCESSIFY INTEGRATION HTML` from `accessify-integration.html` to your website's HTML.

**Required HTML Elements:**
- Dashboard toggle button with ID `accessify-toggle`
- Accessibility panel with ID `accessify-panel`
- All control groups with their respective IDs

### Step 3: Copy JavaScript Code

Copy the JavaScript section marked with `ACCESSIFY INTEGRATION JAVASCRIPT` from `accessify-integration.html` to your website's JavaScript.

**Key Functions:**
- `accessifyInit()` - Initializes the accessibility tool
- `accessifyToggleDashboard()` - Shows/hides the controls panel
- `accessifyChangeLanguage()` - Changes interface language
- All control functions (text size, contrast, theme, etc.)

### Step 4: Include Accessify Library

Add the Accessify library to your website:

```html
<script src="path/to/accessify.min.js"></script>
```

### Step 5: Initialize

The tool will automatically initialize when the page loads. No additional setup required.

## Features

### Visual Accessibility
- **Text Size**: Adjustable from 50% to 300% of original size
- **Contrast Modes**: Normal, High, Inverted, Grayscale
- **Themes**: Default, Dark, Light, Colorblind Friendly

### Navigation & Interaction
- **Keyboard Navigation**: Full keyboard support
- **Voice Commands**: Voice control for all functions
- **Switch Navigation**: Alternative input method support

### Multilingual Support
- **Languages**: English, Hebrew, Arabic, Spanish, French, German
- **RTL Support**: Full right-to-left layout support
- **Dynamic Translation**: All interface elements translate automatically

### Testing & Compliance
- **Accessibility Testing**: Built-in WCAG 2.1 AA compliance testing
- **Compliance Reports**: Detailed accessibility reports
- **Israeli Standard 5568**: Support for Israeli accessibility standards

## Customization

### Adding New Languages

To add support for a new language, add a new object to the `accessifyTranslations` object:

```javascript
const accessifyTranslations = {
    // ... existing languages ...
    your_language_code: {
        title: "Your Language Title",
        textSize: "Your Language Text Size",
        contrast: "Your Language Contrast",
        // ... add all required keys from the English object
    }
};
```

### Styling Customization

The CSS uses CSS custom properties (variables) for easy theming:

```css
:root {
    --accessify-primary-color: #007AFF;
    --accessify-background: #ffffff;
    --accessify-border-color: rgba(0, 0, 0, 0.15);
    --accessify-text-color: #1a1a1a;
}
```

### Positioning

To change the position of the accessibility controls, modify the CSS:

```css
.accessify-toggle,
.accessify-panel {
    top: 20px;        /* Distance from top */
    right: 20px;      /* Distance from right */
    /* Change to 'left: 20px;' for left positioning */
}
```

## Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## Accessibility Features

### WCAG 2.1 AA Compliance
- ✅ Perceivable: Text size, contrast, color themes
- ✅ Operable: Keyboard navigation, voice commands
- ✅ Understandable: Clear labels, multilingual support
- ✅ Robust: Cross-browser compatibility

### Israeli Standard 5568 Compliance
- ✅ RTL language support
- ✅ Hebrew and Arabic language support
- ✅ High contrast modes
- ✅ Text size adjustment

## Troubleshooting

### Common Issues

**1. Accessify library not found**
- Ensure `accessify.min.js` is properly included
- Check the file path is correct
- Verify the script tag is placed before the integration script

**2. Controls not working**
- Check browser console for JavaScript errors
- Ensure all required HTML elements are present
- Verify the Accessify library loaded successfully

**3. Styling issues**
- Ensure all CSS classes are copied correctly
- Check for CSS conflicts with existing styles
- Verify the CSS is loaded after any conflicting styles

**4. Language not changing**
- Ensure the language code exists in `accessifyTranslations`
- Check that all required translation keys are present
- Verify the language change function is called correctly

### Debug Mode

To enable debug mode, modify the initialization:

```javascript
accessifyInstance = new Accessify({
    // ... other options ...
    debug: true  // Enable debug logging
});
```

## Performance Considerations

- The tool is lightweight and has minimal impact on page load time
- CSS and JavaScript are optimized for performance
- Lazy loading of features when needed
- Efficient event handling and DOM manipulation

## Security Considerations

- No external dependencies or CDN calls
- All functionality runs client-side
- No data collection or tracking
- Safe for use on any website

## Support

For technical support or feature requests, please refer to the main Accessify documentation or contact the development team.

## License

This integration template is provided under the same license as the main Accessify project.

---

**Note**: This integration template is designed to be self-contained and easy to implement. All necessary code is included in the `accessify-integration.html` file with clear markers for each section.
