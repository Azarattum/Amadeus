import { type Point, position } from "../../internal/pointer";

export function autoscroll(
  node: HTMLElement,
  {
    trigger = "auto" as "always" | "auto" | "none",
    axis = "both" as "both" | "x" | "y",
    enabled = false,
    threshold = 64,
  } = {},
) {
  let bounds: DOMRect;
  const direction = { x: 0, y: 0 };
  const enable = () => toggle(true);
  const disable = () => toggle(false);

  function update({ x, y }: Point) {
    if (!enabled) return;
    let dx = 0;
    let dy = 0;

    if (x < bounds.left || x > bounds.right) return;
    if (y < bounds.top || y > bounds.bottom) return;
    if (axis !== "x") {
      if (y - bounds.top < threshold) {
        dy = -(bounds.top - y + threshold);
      } else if (y > bounds.bottom - threshold) {
        dy = y - bounds.bottom + threshold;
      }
    }
    if (axis !== "y") {
      if (x - bounds.left < threshold) {
        dx = -(bounds.left - x + threshold);
      } else if (x > bounds.right - threshold) {
        dx = x - bounds.right + threshold;
      }
    }
    dy /= threshold;
    dx /= threshold;

    const wasZero = !direction.x && !direction.y;
    const isNotZero = dx || dy;
    direction.x = ease(dx);
    direction.y = ease(dy);

    if (wasZero && isNotZero) scroll();
  }

  function ease(value: number) {
    if (!value) return 0;
    let temp = Math.abs(value);
    if (temp < 1) temp = (Math.cos(Math.PI * (temp + 1)) + 1) / 2;
    else temp = Math.log(temp) / 3 + 1;

    return temp * Math.sign(value);
  }

  function scroll() {
    let then = Date.now();
    const scroll = () => {
      if (!enabled) return;
      if (!direction.x && !direction.y) return;
      const now = Date.now();
      const elapsed = now - then;
      then = now;

      node.scrollBy(direction.x * elapsed, direction.y * elapsed);
      requestAnimationFrame(scroll);
    };
    requestAnimationFrame(scroll);
  }

  let unsubscribe = () => {};
  function toggle(state = enabled) {
    enabled = state || trigger === "always";
    if (enabled) {
      node.style.scrollBehavior = "auto";
      bounds = node.getBoundingClientRect();
      unsubscribe = position.subscribe(update);
    } else {
      node.style.scrollBehavior = "";
      direction.x = 0;
      direction.y = 0;
      unsubscribe();
    }
  }

  if (trigger === "auto") {
    addEventListener("dragstart", enable);
    addEventListener("dragend", disable);
  }
  toggle();

  return {
    destroy() {
      removeEventListener("dragstart", enable);
      removeEventListener("dragend", disable);
      trigger = "none";
      toggle(false);
    },
    update(config: { enabled: boolean }) {
      if (config.enabled != null) toggle(config.enabled);
    },
  };
}

declare global {
  namespace svelteHTML {
    interface HTMLAttributes {
      autoscroll?: boolean | "false" | "true" | null;
    }
  }
}
