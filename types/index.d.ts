/**
 * TypeScript definitions for Accessify (Toolbar V2)
 * Web accessibility toolbar — WCAG 2.1 AA oriented.
 */

export interface ToolbarV2Options {
  /** If provided, only these control ids are available; otherwise all. */
  availableControls?: string[];
  /** If true, toolbar language syncs with document lang/dir in both directions. */
  syncWithPageLanguage?: boolean;
  /**
   * How text size is applied. When omitted, auto-detects from page CSS:
   * - rootFontSize: html { font-size: N% } for rem-based pages
   * - contentZoom: zoom the content wrapper when page text is px-locked
   */
  textSizeStrategy?: 'rootFontSize' | 'contentZoom';
}

export interface ToolbarV2Settings {
  textSize?: number;
  contrast?: string;
  spacing?: string;
  font?: string;
  links?: boolean;
  cursor?: boolean;
  colorAdjustments?: string;
  language?: string;
  visibleControls?: Record<string, boolean>;
}

export declare class ToolbarV2 {
  constructor(options?: ToolbarV2Options);
  init(): void;
  destroy(): void;
  getSettings(): ToolbarV2Settings;
}

declare const Accessify: {
  ToolbarV2: typeof ToolbarV2;
};

export default Accessify;

declare global {
  interface Window {
    Accessify: typeof Accessify;
  }
}
