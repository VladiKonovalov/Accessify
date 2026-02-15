/**
 * Toolbar V2 — Cursor highlight (reading guide circle)
 * Fixed circle that follows the pointer when "Cursor" is ON.
 * pointer-events: none; z-index above toolbar so it stays visible in front.
 */

export class CursorHighlight {
  constructor() {
    this.el = null;
    this.raf = null;
    this.x = 0;
    this.y = 0;
  }

  mount() {
    if (this.el) return;
    this.el = document.createElement('div');
    this.el.className = 'accessify-toolbar-v2-cursor-circle';
    this.el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.el);
    this._boundMove = this._onMove.bind(this);
    window.addEventListener('mousemove', this._boundMove, { passive: true });
  }

  unmount() {
    if (!this.el) return;
    window.removeEventListener('mousemove', this._boundMove);
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  setVisible(visible) {
    if (!this.el) return;
    this.el.style.display = visible ? 'block' : 'none';
  }

  _onMove(e) {
    this.x = e.clientX;
    this.y = e.clientY;
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = null;
      if (this.el) {
        this.el.style.left = this.x + 'px';
        this.el.style.top = this.y + 'px';
      }
    });
  }
}
