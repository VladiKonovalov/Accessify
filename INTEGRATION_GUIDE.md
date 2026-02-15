# Accessify Integration Guide (Toolbar V2)

This guide explains how to integrate the Accessify accessibility toolbar into any website.

## Quick Start

1. Include the Accessify script
2. Create and initialize the toolbar
3. (Optional) Customize with options

## Installation

### Script tag

Add the script before the closing `</body>` tag:

```html
<script src="path/to/accessify.min.js"></script>
```

### npm

```bash
npm install accessify
```

Then bundle with your build tool (Rollup, Webpack, etc.) or copy `dist/accessify.min.js` to your project.

## Basic Integration

### Minimal setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Site</title>
</head>
<body>
  <!-- Your page content -->

  <script src="path/to/accessify.min.js"></script>
  <script>
    var toolbar = new Accessify.ToolbarV2();
    toolbar.init();
  </script>
</body>
</html>
```

That's it. The toolbar appears as a floating button (usually top-right). Click it to open the panel and adjust accessibility settings.

## Options

### Limit available controls

Show only specific controls:

```javascript
var toolbar = new Accessify.ToolbarV2({
  availableControls: ['textSize', 'contrast', 'spacing', 'font', 'links', 'cursor', 'reset']
});
toolbar.init();
```

### Sync with page language

If your page has `lang` and `dir` on `<html>`, the toolbar can sync with it in both directions:

```javascript
var toolbar = new Accessify.ToolbarV2({
  syncWithPageLanguage: true
});
toolbar.init();
```

- On load, the toolbar reads `document.documentElement.lang` (or `dir="rtl"`) and sets its language.
- When the user changes language in the toolbar, it updates `html` `lang` and `dir`.

## API

| Method        | Description                              |
|---------------|------------------------------------------|
| `init()`      | Mount the toolbar and start applying settings |
| `destroy()`   | Remove the toolbar and restore the page  |
| `getSettings()` | Return current settings (textSize, contrast, etc.) |
| `open()`      | Open the panel                           |
| `close()`     | Close the panel                          |
| `toggle()`    | Toggle the panel                         |

### Example: programmatic control

```javascript
var toolbar = new Accessify.ToolbarV2();
toolbar.init();

// Read settings
var settings = toolbar.getSettings();
console.log(settings.textSize, settings.contrastMode);

// Open/close panel
toolbar.open();
toolbar.close();

// Clean up (e.g. on SPA route change)
toolbar.destroy();
```

## Features

| Control           | Description                                   |
|-------------------|-----------------------------------------------|
| Text size         | 80%–200% of base size                         |
| Contrast          | Normal, High, Dark                            |
| Spacing           | Normal or Wide                                |
| Font              | Default or Dyslexia-friendly                  |
| Links             | Highlight links on/off                        |
| Cursor            | Focus circle following pointer on/off         |
| Color adjustments | None, Grayscale, Invert (via Customize)       |
| Reset             | Restore all settings to defaults              |

Settings are stored in `localStorage` under the key `accessify-settings`.

## RTL and multilingual

- Supported UI languages: English, Hebrew
- For RTL (e.g. Hebrew), use `syncWithPageLanguage: true` or set `<html lang="he" dir="rtl">` before init
- The trigger button positions itself on the correct side for LTR/RTL

## Styling

The toolbar injects its own styles. It uses CSS custom properties and follows WCAG 2.1 AA. Your page styles may need to support:

- `.contrast-dark` — applied to the content wrapper in Dark contrast mode
- `.contrast-high` — applied in High contrast mode
- `.text-spacing-wide` — when Wide spacing is enabled
- `.font-dyslexia` — when Dyslexia font is selected
- `.highlight-links` — when link highlighting is on
- `.highlight-cursor` — when cursor highlight is on
- `.color-filter-grayscale`, `.color-filter-invert` — for color adjustments

See `example.html` for a page that handles these classes.

## Browser support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

**Toolbar does not appear**

- Ensure `accessify.min.js` loads without errors
- Call `toolbar.init()` after the DOM is ready (e.g. after `DOMContentLoaded` or at end of body)

**Settings not persisting**

- Check that `localStorage` is available and not disabled
- Storage key: `accessify-settings`

**Contrast/Dark mode looks wrong**

- Add page-specific overrides for `.contrast-dark` (and `.contrast-high`) if your page uses custom backgrounds or colors

## License

MIT — same as the Accessify project.
