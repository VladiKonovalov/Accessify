/**
 * Toolbar V2 — Toolbar UI styles (.accessify-toolbar-v2-*)
 * WCAG 2.1 AA: contrast ≥4.5:1 for text/UI, focus-visible, touch targets (≥44px), reduced motion.
 */

export function getToolbarStyles() {
  return `
/* ---- Toolbar V2: Trigger (bottom; left for RTL/hebrew, right for LTR/english) ---- */
.accessify-toolbar-v2-trigger {
  position: fixed;
  bottom: 1rem;
  inset-inline-end: 1rem;
  z-index: 10002;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  padding: 12px;
  border: none;
  border-radius: 50%;
  background-color: #2563eb;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  transition: transform 0.3s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}
.accessify-toolbar-v2-trigger[aria-expanded="false"] {
  transform: rotate(180deg);
}
.accessify-toolbar-v2-trigger[aria-expanded="true"] {
  transform: rotate(0deg);
}
.accessify-toolbar-v2-trigger:hover {
  background-color: #1d4ed8;
}
.accessify-toolbar-v2-trigger:focus {
  outline: none;
}
.accessify-toolbar-v2-trigger:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
}
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-icon,
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-trigger-icon-img {
  display: flex;
  align-items: center;
  justify-content: center;
}
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-trigger-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-icon svg {
  width: 24px;
  height: 24px;
}
.accessify-toolbar-v2-trigger .accessify-toolbar-v2-trigger-fallback {
  display: none;
}
.accessify-toolbar-v2-trigger:not(:has(.accessify-toolbar-v2-trigger-icon-img)) .accessify-toolbar-v2-trigger-fallback {
  display: flex;
}

/* ---- Toolbar V2: Panel (bottom, same side as trigger; dir set in JS for inset-inline-end) ---- */
.accessify-toolbar-v2-panel {
  position: fixed;
  bottom: 5rem;
  inset-inline-end: 1rem;
  z-index: 10001;
  width: 260px;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 7rem);
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.accessify-toolbar-v2-panel-body {
  padding: 16px 8px 4px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ---- Toolbar V2: Header ---- */
.accessify-toolbar-v2-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  background-color: #eff6ff;
  border-bottom: 2px solid #e5e7eb;
}
.accessify-toolbar-v2-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon-fallback {
  display: none;
  color: #2563eb;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon-fallback svg {
  width: 20px;
  height: 20px;
}
.accessify-toolbar-v2-header-title .accessify-toolbar-v2-header-title-icon:not(:has(.accessify-toolbar-v2-header-title-icon-img)) .accessify-toolbar-v2-header-title-icon-fallback {
  display: flex;
}
.accessify-toolbar-v2-close {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.accessify-toolbar-v2-close:hover {
  color: #374151;
  background: rgba(0, 0, 0, 0.05);
}
.accessify-toolbar-v2-close:focus {
  outline: none;
}
.accessify-toolbar-v2-close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #2563eb;
}
.accessify-toolbar-v2-close .accessify-toolbar-v2-icon svg {
  width: 20px;
  height: 20px;
}

/* ---- Toolbar V2: Section ---- */
.accessify-toolbar-v2-section {
  margin-bottom: 16px;
}
.accessify-toolbar-v2-section:last-child {
  margin-bottom: 0;
}
.accessify-toolbar-v2-section-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.accessify-toolbar-v2-section-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.accessify-toolbar-v2-section-controls > .accessify-toolbar-v2-btn,
.accessify-toolbar-v2-section-controls > div {
  flex: 1;
  min-width: 0;
}

/* ---- Toolbar V2: Customize (show/hide tools, collapsible) ---- */
.accessify-toolbar-v2-customize {
  margin-bottom: 16px;
}
.accessify-toolbar-v2-customize-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #4b5563;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.accessify-toolbar-v2-customize-header:hover {
  border-color: #2563eb;
  background: #eff6ff;
}
.accessify-toolbar-v2-customize-header:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
.accessify-toolbar-v2-customize-header-label {
  flex: 1;
  text-align: left;
}
.accessify-toolbar-v2-customize-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.accessify-toolbar-v2-customize-open .accessify-toolbar-v2-customize-chevron {
  transform: rotate(180deg);
}
.accessify-toolbar-v2-customize-body {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 12px;
  padding: 0 2px;
}
.accessify-toolbar-v2-customize-body[hidden] {
  display: none;
}
.accessify-toolbar-v2-customize-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
.accessify-toolbar-v2-customize-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
  cursor: pointer;
}
.accessify-toolbar-v2-customize-label-text {
  user-select: none;
}
.accessify-toolbar-v2-section[data-control-id] {
  transition: opacity 0.15s ease;
}

/* ---- Toolbar V2: Buttons (default) ---- */
.accessify-toolbar-v2-btn {
  min-height: 48px;
  padding: 14px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}
.accessify-toolbar-v2-btn:hover:not(:disabled) {
  border-color: #2563eb;
  background-color: #eff6ff;
}
.accessify-toolbar-v2-btn:focus {
  outline: none;
}
.accessify-toolbar-v2-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #2563eb;
}
.accessify-toolbar-v2-btn:disabled {
  border-color: #e5e7eb;
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}
.accessify-toolbar-v2-btn[aria-pressed="true"] {
  border-color: #2563eb;
  background-color: #eff6ff;
  color: #1d4ed8;
}
.accessify-toolbar-v2-btn .accessify-toolbar-v2-icon {
  display: flex;
  flex-shrink: 0;
}
.accessify-toolbar-v2-btn .accessify-toolbar-v2-icon svg {
  width: 20px;
  height: 20px;
}

/* Text size value display */
.accessify-toolbar-v2-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2563eb;
  min-width: 3ch;
  text-align: center;
}

/* Font D badge */
.accessify-toolbar-v2-font-d-badge {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #111827;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 4px;
  flex-shrink: 0;
}

/* Language buttons */
.accessify-toolbar-v2-language-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
}
.accessify-toolbar-v2-language-btn {
  flex: 1;
  min-width: 0;
}

/* Reset button */
.accessify-toolbar-v2-reset {
  margin-top: 8px;
  margin-bottom: 0;
  padding-top: 10px;
  border-top: 2px solid #e5e7eb;
}
.accessify-toolbar-v2-reset .accessify-toolbar-v2-btn {
  width: 100%;
  background: #fef2f2;
  border-color: #fca5a5;
  color: #b91c1c;
}
.accessify-toolbar-v2-reset .accessify-toolbar-v2-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}
.accessify-toolbar-v2-reset .accessify-toolbar-v2-btn:focus-visible {
  box-shadow: 0 0 0 2px #ef4444;
}

/* Footer: Powered by Accessify link - no top padding so text sticks to border, no bottom padding to avoid scroll */
.accessify-toolbar-v2-footer {
  margin-top: 1px;
  padding: 0;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}
.accessify-toolbar-v2-footer a {
  display: inline-block;
  font-size: 11px;
  color: #6b7280;
  text-decoration: none;
  line-height: 1.2;
}
.accessify-toolbar-v2-footer a:hover {
  color: #2563eb;
  text-decoration: underline;
}
.accessify-toolbar-v2-footer a:focus {
  outline: none;
}
.accessify-toolbar-v2-footer a:focus-visible {
  outline: none;
  border-radius: 2px;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5);
}

/* Cursor highlight circle (centered on pointer) - above toolbar so it stays visible */
.accessify-toolbar-v2-cursor-circle {
  position: fixed;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 4px solid #2563eb;
  background: rgba(37, 99, 235, 0.1);
  pointer-events: none;
  z-index: 10003;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
}

/* Visually hidden live region for screen reader announcements */
.accessify-toolbar-v2-live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .accessify-toolbar-v2-trigger,
  .accessify-toolbar-v2-btn,
  .accessify-toolbar-v2-close {
    transition: none;
  }
  .accessify-toolbar-v2-cursor-circle {
    transition: none;
  }
}
`;
}
