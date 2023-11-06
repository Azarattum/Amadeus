export function hold(
  node: HTMLElement,
  { duration = 300, mouse = false, touch = true }: HoldOptions = {},
) {
  function detectHold(event: TouchEvent | MouseEvent) {
    const timeout = setTimeout(() => {
      cancel();
      const Event = event instanceof TouchEvent ? TouchEvent : MouseEvent;
      event.target?.dispatchEvent(new Event("hold", event as EventInit));
    }, duration);
    const cancel = () => {
      clearTimeout(timeout);
      if (touch) {
        node.removeEventListener("touchcancel", cancel);
        node.removeEventListener("touchmove", cancel);
        node.removeEventListener("touchend", cancel);
      }
      if (mouse) {
        node.removeEventListener("mousemove", cancel);
        node.removeEventListener("mouseup", cancel);
      }
    };

    if (touch) {
      node.addEventListener("touchcancel", cancel, { once: true });
      node.addEventListener("touchend", cancel, { once: true });
      node.addEventListener("touchmove", cancel, {
        passive: true,
        once: true,
      });
    }
    if (mouse) {
      node.addEventListener("mousemove", cancel, { once: true });
      node.addEventListener("mouseup", cancel, { once: true });
    }
  }

  if (touch) {
    node.addEventListener("touchstart", detectHold, { passive: true });
  }
  if (mouse) {
    node.addEventListener("mousedown", detectHold);
  }

  return {
    destroy() {
      node.removeEventListener("touchstart", detectHold);
      node.removeEventListener("mousedown", detectHold);
    },
  };
}

interface HoldOptions {
  duration?: number;
  touch?: boolean;
  mouse?: boolean;
}

declare global {
  namespace svelteHTML {
    interface HTMLAttributes {
      "on:hold"?: (event: TouchEvent | MouseEvent) => void;
    }
  }
}
