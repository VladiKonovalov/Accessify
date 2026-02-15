/**
 * Accessify - Web Accessibility Toolkit (Toolbar V2)
 *
 * Exposes the Figma-based accessibility toolbar supporting WCAG 2.1 AA,
 * RTL, and multilingual (e.g. English, Hebrew).
 *
 * Usage:
 *   var toolbar = new Accessify.ToolbarV2();
 *   toolbar.init();
 */

import { ToolbarV2 } from './ToolbarV2.js';

// Namespace for UMD/global so scripts can use new Accessify.ToolbarV2()
const Accessify = { ToolbarV2 };

export { ToolbarV2 };
export default Accessify;

if (typeof window !== 'undefined') {
  window.Accessify = Accessify;
}
