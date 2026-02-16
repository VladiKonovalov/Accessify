# Accessify — Web Accessibility Toolbar V2

A modular accessibility toolbar for the web. Supports WCAG 2.1 AA, RTL (e.g. Hebrew), and multiple languages.

**Note:** Legacy Toolbar V1 has been removed. This library is v2-only.

live demo to see - https://vladikonovalov.github.io/Accessify/example.html

VERSION DIFFERENCE  
<img width="500" height="500" alt="photo-collage png" src="https://github.com/user-attachments/assets/68ade9dd-c951-4d0b-91cb-8a03c15bf86d" />


## Installation

### npm

```bash
npm install accessify
```

### Script tag

```html
<script src="path/to/accessify.min.js"></script>
```

## Quick start

```javascript
var toolbar = new Accessify.ToolbarV2();
toolbar.init();
```

## API

### ToolbarV2Options

| Option | Type | Description |
|--------|------|-------------|
| `availableControls` | `string[]` | If provided, only these control ids are available; otherwise all. |
| `syncWithPageLanguage` | `boolean` | If `true`, toolbar language syncs with `document.documentElement.lang` and `dir` in both directions. |

### ToolbarV2Settings

| Setting | Type | Description |
|---------|------|-------------|
| `textSize` | `number` | Text size multiplier |
| `contrast` | `string` | Contrast mode |
| `spacing` | `string` | Spacing mode |
| `font` | `string` | Font preference |
| `links` | `boolean` | Link underline |
| `cursor` | `boolean` | Cursor enhancement |
| `colorAdjustments` | `string` | Color filter |
| `language` | `string` | UI language |
| `visibleControls` | `Record<string, boolean>` | Per-control visibility |

### Example with options

```javascript
// Limit controls and sync with page language
var toolbar = new Accessify.ToolbarV2({
  availableControls: ['textSize', 'contrast', 'reset'],
  syncWithPageLanguage: true
});
toolbar.init();
```

## Examples

- [example.html](example.html)
- [example-toolbar-v2-hebrew.html](example-toolbar-v2-hebrew.html)

## License

MIT
