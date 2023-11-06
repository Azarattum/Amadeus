/**
 * A collection of polyfills to insure minimal compatibility.
 */

const scope = globalThis as any;

if (!("DOMRect" in scope)) {
  scope.DOMRect = class {
    bottom: number;
    right: number;
    left: number;
    top: number;
    constructor(
      public x = 0,
      public y = 0,
      public width = 0,
      public height = 0,
    ) {
      this.top = y;
      this.bottom = y + height;
      this.left = x;
      this.right = x + width;
    }
    toJSON() {
      return JSON.stringify(this);
    }
  };
}

if (!("ResizeObserver" in scope)) {
  scope.ResizeObserver = function () {
    return { disconnect() {}, unobserve() {}, observe() {} };
  };
}

if (!("DragEvent" in scope)) {
  scope.DragEvent = globalThis.MouseEvent;
}

if (!("TouchEvent" in scope)) {
  scope.TouchEvent = function () {};
}

globalThis.addEventListener?.("touchstart", () => {}, false);

export {};
