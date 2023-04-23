let observing = 0;
let observer: ResizeObserver | null = null;
const dispatch = (entries: ResizeObserverEntry[]) =>
  entries.forEach((entry) => {
    entry.target?.dispatchEvent(new CustomEvent("resize", { detail: entry }));
  });

export function resize(node: HTMLElement) {
  if (!observer) observer = new ResizeObserver(dispatch);
  observer.observe(node);
  observing += 1;
  return {
    destroy() {
      observer?.unobserve(node);
      observing -= 1;
      if (observing <= 0) {
        observer?.disconnect();
        observer = null;
      }
    },
  };
}

export type ResizeEvent = CustomEvent<ResizeObserverEntry>;

declare global {
  namespace svelteHTML {
    interface HTMLAttributes {
      "on:resize"?: (event: ResizeEvent) => void;
    }
  }
}
