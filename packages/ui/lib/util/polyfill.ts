/**
 * A collection of polyfills to insure minimal compatibility.
 */

const scope = globalThis as any;

if (!("ResizeObserver" in scope)) {
  scope.ResizeObserver = function () {
    return { disconnect() {}, observe() {}, unobserve() {} };
  };
}

if (!("DragEvent" in scope)) {
  scope.DragEvent = globalThis.MouseEvent;
}

if (!("TouchEvent" in scope)) {
  scope.TouchEvent = function () {};
}

export {};
