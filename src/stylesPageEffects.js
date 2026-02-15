/**
 * Toolbar V2 — Page effect classes (body/root accessibility)
 * Contrast, text spacing, dyslexia font, link highlight, cursor hide.
 */

export function getPageEffectsStyles() {
  return `
/* ---- Body/Root accessibility classes (page effects) ---- */
/* Contrast applied to content wrapper (not body) so filter does not break toolbar position:fixed */
.contrast-normal {
  /* default */
}
.contrast-high {
  filter: contrast(150%) brightness(1.1);
}
.contrast-high *:not(button):not(a) {
  border-color: #000 !important;
}
.contrast-high button,
.contrast-high a {
  border: 2px solid currentColor !important;
}
.contrast-high {
  font-weight: 500;
}
.contrast-high h1, .contrast-high h2, .contrast-high h3,
.contrast-high h4, .contrast-high h5, .contrast-high h6 {
  font-weight: 700;
}
.contrast-dark {
  background-color: #1a1a1a !important;
  color: #e5e7eb !important;
  min-height: 100vh;
}
.contrast-dark a {
  color: #93c5fd !important;
}
.text-spacing-wide p,
.text-spacing-wide h1, .text-spacing-wide h2, .text-spacing-wide h3,
.text-spacing-wide h4, .text-spacing-wide h5, .text-spacing-wide h6,
.text-spacing-wide li, .text-spacing-wide span, .text-spacing-wide div {
  line-height: 2 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
.text-spacing-wide button,
.text-spacing-wide a {
  padding-top: 0.75em !important;
  padding-bottom: 0.75em !important;
}
.font-dyslexia,
.font-dyslexia * {
  font-family: 'Comic Sans MS', 'OpenDyslexic', Arial, sans-serif !important;
}
.highlight-links a {
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 3px !important;
  font-weight: 600 !important;
  background-color: rgba(255, 255, 0, 0.2) !important;
  padding: 2px 4px !important;
  border-radius: 2px !important;
}
.highlight-links a:hover {
  background-color: rgba(255, 255, 0, 0.4) !important;
}
.highlight-cursor,
.highlight-cursor * {
  cursor: none !important;
}

/* Color adjustments (applied to content wrapper) */
.color-filter-none {
  /* default */
}
.color-filter-grayscale,
.color-filter-grayscale * {
  filter: grayscale(100%) !important;
}
.color-filter-invert,
.color-filter-invert * {
  filter: invert(100%) !important;
}
`;
}
