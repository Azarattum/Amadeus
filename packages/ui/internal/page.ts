import { readable } from "svelte/store";

export const hash = readable(
  globalThis.location?.hash.slice(1) || "",
  (set) => {
    const update = () => set(globalThis.location?.hash.slice(1) || "");
    globalThis.addEventListener?.("hashchange", update);
    return () => globalThis.removeEventListener?.("hashchange", update);
  }
);
