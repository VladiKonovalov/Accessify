## Accessify ♿
Make any website more accessible in minutes.

A lightweight open-source accessibility widget supporting:

✅ WCAG 2.1 AA improvements

✅ Font scaling

✅ Contrast modes

✅ Keyboard navigation

✅ RTL support]

✅ Screen-reader friendly controls


Demo:
[[Live Demo]
](https://vladikonovalov.github.io/)

## Installation

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
Star this repo ⭐ if you find it useful
