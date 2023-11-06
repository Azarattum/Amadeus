import { unlock, lock } from "../../internal/touch";

/**
 * Polyfills drag events to make them isomorphic
 * on all devices.
 */
export function drag(
  node: HTMLElement,
  trigger = "touchstart" as "touchstart" | "hold",
) {
  function draggable(target: HTMLElement | null) {
    do {
      if (target?.draggable) return target;
      target = target?.parentElement || null;
    } while (target);
    return null;
  }

  function simulate(event: Event) {
    const target = draggable(event.target as HTMLElement);
    if (!target) return;
    lock();
    event.preventDefault();
    target.dispatchEvent(new DragEvent("dragstart", { bubbles: true }));
  }

  function overwrite(event: DragEvent) {
    event.preventDefault();
    addEventListener("pointercancel", finish);
    addEventListener("pointerup", finish);
  }

  function finish() {
    unlock();
    removeEventListener("pointercancel", finish);
    removeEventListener("pointerup", finish);
    node.dispatchEvent(new DragEvent("dragend", { bubbles: true }));
  }

  node.addEventListener(trigger, simulate);
  node.addEventListener("dragstart", overwrite);
  return {
    destroy() {
      node.removeEventListener(trigger, simulate);
      node.removeEventListener("dragstart", overwrite);
    },
  };
}
