# Accessibility Toolbar — Structured Summary for Implementation

Structured reference for implementing the Accesify Figma accessibility toolbar in a new agent or codebase.

---

## 1. Components: Features and Sub-elements

### 1.1 Entry (Floating Trigger)
- **Type:** Single `<button>`
- **Content:** Accessibility icon only (no visible text)
- **Role:** Opens/closes the main panel
- **Sub-elements:** One icon (Lucide `Accessibility`), 24×24px equivalent

### 1.2 Panel Container
- **Type:** Fixed-position container (shown only when open)
- **Sub-elements:**
  - **Header** (bar at top)
  - **Body** (scrollable content area with all controls)

### 1.3 Header
- **Left:** Accessibility icon (20×20px) + text "Accessibility"
- **Right:** Close button (X icon only, 20×20px)
- **Sub-elements:** Icon, heading, one icon-only close button

### 1.4 Control Sections (in order, top to bottom)

| Section      | Sub-elements | Control type |
|-------------|--------------|--------------|
| **Text Size** | Label "TEXT SIZE", decrease button, value display, increase button | Two buttons + one read-only value |
| **Contrast**  | Label "CONTRAST", one button (icon + label) | Single cycle button |
| **Spacing**   | Label "SPACING", one button (icon + "Normal"/"Wide") | Toggle button |
| **Font**      | Label "FONT", one button ("D" badge + "Default"/"Dyslexia") | Toggle button |
| **Links**     | Label "LINKS", one button (icon + "OFF"/"ON") | Toggle button |
| **Cursor**    | Label "CURSOR", one button (icon + "OFF"/"ON") | Toggle button |
| **Reset**     | One full-width button (icon + "Reset") | Action button |

### 1.5 Buttons (by kind)
- **Text size decrease:** Icon `Type` (small "A" style), label "A" (small), disabled at 80%
- **Text size increase:** Icon `Type` (larger "A" style), label "A" (larger), disabled at 200%
- **Contrast:** Icon = Sun | Contrast | Moon by state; label = "Normal" | "High" | "Dark"
- **Spacing:** Icon `AlignJustify`; label "Normal" or "Wide"
- **Font:** Custom "D" badge (no Lucide); label "Default" or "Dyslexia"
- **Links:** Icon `LinkIcon`; label "OFF" or "ON"
- **Cursor:** Icon `MousePointer`; label "OFF" or "ON"
- **Reset:** Icon `RotateCcw`; label "Reset"
- **Close:** Icon `X` only

### 1.6 Icons (all Lucide React except Font "D")
- **Accessibility** — trigger, header
- **Type** — text size (two sizes for decrease/increase)
- **Sun** — contrast "Normal"
- **Contrast** — contrast "High"
- **Moon** — contrast "Dark"
- **AlignJustify** — spacing
- **LinkIcon** — links
- **MousePointer** — cursor
- **RotateCcw** — reset
- **X** — close  
- **Font "D"** — custom "D" in a small rounded block (not Lucide)

### 1.7 Auxiliary Component (Cursor Mode)
- **ReadingGuide:** Fixed, pointer-events-none circle (e.g. 60×60px) that follows mouse when Cursor is ON; blue border and light blue fill; z-index below panel.

---

## 2. Layout & Styling

### 2.1 Alignment
- **Trigger:** Fixed top-right (e.g. `top: 1rem`, `right: 1rem`).
- **Panel:** Fixed below trigger (e.g. `top: 5rem`, `right: 1rem`), right-aligned.
- **Header:** Horizontal flex; space-between; items vertically centered.
- **Body:** Single column; each section = vertical stack (label above control(s)); controls full width within panel.
- **Text size row:** Horizontal: [Decrease button] [Value] [Increase button]; value centered; buttons equal flex width.
- **All other controls:** Full-width single button per section; content (icon + label) centered.

### 2.2 Spacing
- **Between sections:** 16px (e.g. `gap-4`).
- **Within section (label to control):** 8px (e.g. `gap-2`).
- **Panel padding:** Header horizontal 16px, vertical 12px; body padding 16px.
- **Buttons:** Horizontal padding 16px, vertical 12px (e.g. `px-4 py-3`); internal gap between icon and text 8px.
- **Reset:** Top padding 8px and a top border above it to separate from other sections.

### 2.3 Button Sizes
- **Trigger:** Circular; padding ~12px; icon ~24px.
- **Panel buttons:** Minimum touch-friendly height (aim ≥44px); full width of panel content.
- **Text size buttons:** Same padding as others; flex-1 so they share space with the value.
- **Icons in panel:** 20×20px standard; text size icons 16px (decrease) and 24px (increase).

### 2.4 Colors
- **Trigger:** Background blue-600; text/icon white; hover blue-700; focus ring blue-300.
- **Panel container:** White background; border gray-200 (2px).
- **Header:** Light blue background (e.g. blue-50); bottom border gray-200; title gray-900; header icon blue-600; close icon gray-500, hover gray-700.
- **Section labels:** Gray-600, small, uppercase, semibold.
- **Default button:** White bg; border gray-300 (2px); hover border blue-500, bg blue-50.
- **Active/on state (toggles):** Border blue-500; background blue-50; text blue-700.
- **Value (text size %):** Blue-600, semibold.
- **Disabled (text size at limits):** Border gray-200; bg gray-50; text gray-400; cursor not-allowed.
- **Reset:** Background red-50; border red-300 (2px); text red-700; hover bg red-100, border red-400; focus ring red-500.
- **Cursor circle:** Blue-500 border and light blue fill (e.g. blue-500/10).

### 2.5 Typography
- **Header title:** Semibold; gray-900; size consistent with "heading" for the panel.
- **Section labels:** Extra-small; semibold; gray-600; uppercase; wide letter-spacing.
- **Button labels:** Semibold; default black/gray; active state blue-700.
- **Text size "A" labels:** Bold; small and medium sizes for decrease/increase.
- **Font stack (when Dyslexia ON):** e.g. Comic Sans MS, OpenDyslexic, Arial, sans-serif (applied via body class, not only in toolbar).

### 2.6 Grouping and Symmetry
- **Grouping:** One logical group per section (label + control(s)); 16px gap between groups; reset visually separated by border and padding.
- **Symmetry:** Text size: two equal-width buttons around a centered value. All other sections: one full-width button each. Consistent padding and gap pattern across sections.

### 2.7 WCAG 2.1 AA Considerations (Layout & Styling)
- **Contrast:** Text and UI use sufficient contrast (e.g. gray-900 on white, blue-600/700 on blue-50); disabled state clearly distinguishable.
- **Touch targets:** Buttons sized for ≥44×44px (enforced in CSS for small viewports and by padding in panel).
- **Focus visible:** All interactive elements have a visible focus style (e.g. 2px or 3px ring, blue for primary, red for reset); focus outline not removed without a visible replacement.
- **Text scaling:** Page respects root font-size (80%–200%); toolbar can use rem/em so it scales with user settings.
- **No information by color alone:** State shown by border, background, and text (e.g. "ON"/"OFF", "Wide"/"Normal") in addition to color.
- **Reduced motion:** Respect `prefers-reduced-motion: reduce` for transitions/animations (cursor circle, panel, buttons).

---

## 3. Interactions & Logic

### 3.1 Trigger Button
- **Action:** Toggle panel open/closed.
- **Hover:** Background darkens (e.g. blue-700).
- **Focus:** Visible focus ring (e.g. 4px blue-300).
- **Keyboard:** Activatable with Enter/Space.
- **ARIA:** `aria-label="Toggle Accessibility Controls"`, `aria-expanded={true|false}`.

### 3.2 Close Button
- **Action:** Close panel (same as toggling trigger off).
- **Hover:** Icon color darkens (e.g. gray-700).
- **Focus:** Visible focus style.
- **ARIA:** `aria-label="Close"`.

### 3.3 Text Size – Decrease
- **Action:** Decrease root font-size by 10%; minimum 80%.
- **Disabled:** When `textSize === 80`; visual disabled state; not focusable or clickable.
- **Hover/Focus:** Only when enabled; same as other panel buttons (border blue, bg blue-50, ring).
- **ARIA:** `aria-label="Decrease text size"`.

### 3.4 Text Size – Increase
- **Action:** Increase root font-size by 10%; maximum 200%.
- **Disabled:** When `textSize === 200`.
- **Hover/Focus:** Same as decrease when enabled.
- **ARIA:** `aria-label="Increase text size"`.

### 3.5 Text Size – Value
- **Behavior:** Read-only display of current percentage (e.g. `{textSize}%`).
- **Updates:** Whenever `textSize` changes from increase/decrease or reset.

### 3.6 Contrast
- **Action:** Cycle contrast mode: Normal → High → Dark → Normal.
- **Dynamic behavior:** Icon and label change with state (Sun/"Normal", Contrast/"High", Moon/"Dark"). Body gets class `contrast-normal` | `contrast-high` | `contrast-dark`; CSS applies filter/colors.
- **Hover/Focus:** Same as other full-width panel buttons.
- **ARIA:** `aria-label="Toggle contrast mode"`.

### 3.7 Spacing
- **Action:** Toggle text spacing: Normal ↔ Wide.
- **Dynamic behavior:** When Wide, body gets `text-spacing-wide` (e.g. line-height, letter-spacing, word-spacing increased). Button shows "Wide" and active styling when on.
- **Hover/Focus:** Default and active styles as above.
- **ARIA:** `aria-label="Toggle text spacing"`, `aria-pressed={true|false}`.

### 3.8 Font
- **Action:** Toggle font: Default ↔ Dyslexia.
- **Dynamic behavior:** When Dyslexia, body gets `font-dyslexia` (specific font stack). Button shows "Dyslexia" and active styling when on.
- **Hover/Focus:** Same pattern as other toggles.
- **ARIA:** `aria-label="Toggle dyslexia-friendly font"`, `aria-pressed={true|false}`.

### 3.9 Links
- **Action:** Toggle link highlighting on/off.
- **Dynamic behavior:** When on, body gets `highlight-links`; CSS underlines and highlights links. Button shows "ON" and active styling.
- **ARIA:** `aria-label="Toggle link highlighting"`, `aria-pressed={true|false}`.

### 3.10 Cursor
- **Action:** Toggle cursor highlight on/off.
- **Dynamic behavior:** When on, body gets `highlight-cursor` (e.g. cursor:none); ReadingGuide circle is rendered and follows mouse; position updated on mousemove.
- **ARIA:** `aria-label="Toggle cursor highlighting"`, `aria-pressed={true|false}`.

### 3.11 Reset
- **Action:** Restore all settings to defaults (e.g. textSize 100%, contrast normal, spacing normal, font default, links off, cursor off).
- **Dynamic behavior:** State and DOM/body classes update immediately; localStorage updated.
- **Hover/Focus:** Red hover/focus styling as above.
- **ARIA:** `aria-label="Reset all settings"`.

### 3.12 Persistence and Application
- **Persistence:** All settings saved to localStorage (e.g. key `accessify-settings`); rehydrated on load.
- **Application:**  
  - Text size: set `document.documentElement.style.fontSize` to the current `textSize` value plus `%`.  
  - All others: add/remove body classes; no inline styles on body for contrast/spacing/font/links/cursor.

### 3.13 Accessibility Feedback (Summary)
- **Focus:** Every control has visible focus ring (blue or red for reset); use `:focus-visible` where appropriate so mouse users don't get a redundant outline.
- **State:** Toggles use `aria-pressed`; active state shown with border, background, and label text.
- **Disabled:** Text size buttons use `disabled` and muted styling when at min/max.
- **Panel:** `aria-expanded` on trigger reflects open/closed. No focus trap or Escape-to-close in current spec; both are recommended for full WCAG 2.1 AA (keyboard and focus management).

---

*This document can be used as the single reference for an agent implementing the same accessibility toolbar in another context (e.g. vanilla JS, different framework, or different page).*
