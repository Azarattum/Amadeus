const observers = new Map<string, [IntersectionObserver, number]>();
const dispatch = (entries: IntersectionObserverEntry[]) =>
  entries.forEach((entry) => {
    entry.target?.dispatchEvent(
      new CustomEvent("intersect", { detail: entry }),
    );
    entry.target?.dispatchEvent(
      new CustomEvent(entry.isIntersecting ? "viewenter" : "viewleave", {
        detail: entry,
      }),
    );
  });

export function intersection(node: HTMLElement, threshold?: number[] | number) {
  const id = threshold?.toString() || "";
  const entry = observers.get(id) || [
    new IntersectionObserver(dispatch, { threshold }),
    0,
  ];
  if (!observers.has(id)) observers.set(id, entry);
  entry[0].observe(node);
  entry[1] += 1;
  return {
    destroy() {
      entry[0].unobserve(node);
      entry[1] -= 1;
      if (entry[1] <= 0) {
        entry[0].disconnect();
        observers.delete(id);
      }
    },
  };
}

export type IntersectionEvent = CustomEvent<IntersectionObserverEntry>;

declare global {
  namespace svelteHTML {
    interface HTMLAttributes {
      "on:intersect"?: (event: IntersectionEvent) => void;
      "on:viewenter"?: (event: IntersectionEvent) => void;
      "on:viewleave"?: (event: IntersectionEvent) => void;
    }
  }
}
