# Toolbar V2

Version 2 of the Accessify accessibility toolbar, based on the Figma design. Minimal, symmetric, and WCAG 2.1 AA–oriented.

## Features

- **Text size** — 80%–200% in 10% steps (decrease / value / increase).
- **Contrast** — Cycle: Normal → High → Dark.
- **Spacing** — Toggle Normal / Wide (line-height, letter-spacing, word-spacing).
- **Font** — Toggle Default / Dyslexia-friendly.
- **Links** — Toggle link highlighting (underline + background).
- **Cursor** — Toggle cursor highlight (follow circle).
- **Reset** — Restore all settings to defaults.

## Structure (reusable files)

- `constants.js` — Defaults, storage key, limits.
- `storage.js` — Load/save settings to `localStorage` (`accessify-settings`).
- `icons.js` — Inline SVG icons + “D” badge.
- `styles.js` — Injected CSS (toolbar UI + body classes for contrast, spacing, font, links, cursor).
- `CursorHighlight.js` — Cursor-follow circle when Cursor is ON.
- `ToolbarSection.js` — Section wrapper (label + controls).
- `TextSizeControl.js`, `ContrastControl.js`, `SpacingControl.js`, `FontControl.js`, `LinksControl.js`, `CursorControl.js`, `ResetControl.js` — One file per control.
- `ToolbarHeader.js`, `ToolbarPanel.js`, `ToolbarTrigger.js` — Panel structure.
- `ToolbarV2.js` — Main component: state, persistence, DOM application, composition.
- `index.js` — Public API.

## Usage

### With the built bundle (UMD)

After `npm run build`:

```html
<script src="dist/accessify.min.js"></script>
<script>
  var toolbar = new Accessify.ToolbarV2();
  toolbar.init();
  // toolbar.destroy(); when tearing down
  // toolbar.getSettings(); for current state
</script>
```

### With ES modules

```js
import Accessify from 'dist/accessify.esm.js';
// or from the main package

const toolbar = new Accessify.ToolbarV2();
toolbar.init();
```

To use only the toolbar-v2 source (e.g. in a custom bundle):

```js
import { ToolbarV2 } from './src/toolbar-v2/index.js';
const toolbar = new ToolbarV2();
toolbar.init();
```

### Integration with existing Accessify

Toolbar V2 is standalone: it applies `document.documentElement.style.fontSize` and body classes (`contrast-*`, `text-spacing-wide`, `font-dyslexia`, `highlight-links`, `highlight-cursor`). It does not call into the existing Accessify instance. To avoid conflicts you can either:

- Use **only** Toolbar V2 for these features (no Visual/Reading toolbar), or
- Sync state: read/write the same `accessify-settings` key and align body classes / root font-size with your existing components.

## WCAG 2.1 AA notes

- Contrast: Text and UI use sufficient contrast; disabled state is distinguishable.
- Keyboard: Trigger and all panel controls are focusable; Escape closes the panel.
- Labels: All controls have `aria-label`; toggles use `aria-pressed`.
- Focus: Visible focus ring (`:focus-visible`) on trigger and buttons; reset uses a distinct focus style.
- Touch: Buttons meet minimum touch target size (e.g. 44px).
- Motion: `prefers-reduced-motion: reduce` disables transitions on the toolbar and cursor circle.

## Persistence

Settings are stored in `localStorage` under the key `accessify-settings`. Rehydration happens on `init()`.
