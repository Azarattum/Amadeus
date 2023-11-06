import type { TransitionConfig } from "svelte/transition";
import { cubicOut } from "svelte/easing";

export function morph(
  node: HTMLElement,
  { reverse = false, target }: { reverse?: boolean; target: string },
): TransitionConfig {
  const from = document
    .querySelector(`[data-morph="${target}"`)
    ?.getBoundingClientRect();
  if (!from) return { duration: 0 };

  const to = node.getBoundingClientRect();
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const dw = from.width / to.width;
  const dh = from.height / to.height;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  return {
    css: (t: number, u: number) => {
      return reverse
        ? `
      transform-origin: top left;
      transform: ${transform} scale(${1 / (t + (1 - t) * dw)}, ${
        1 / (t + (1 - t) * dh)
      }) translate3d(${-u * dx}px,${-u * dy}px,0);`
        : `
      transform-origin: top left;
      transform: ${transform} translate3d(${u * dx}px,${u * dy}px,0) scale(${
        t + (1 - t) * dw
      }, ${t + (1 - t) * dh});
    `;
    },
    duration: Math.sqrt(distance) * 30,
    easing: cubicOut,
  };
}
