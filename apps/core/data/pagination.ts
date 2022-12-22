import { debounce, lock } from "@amadeus-music/util/throttle";
import type { Unique } from "@amadeus-music/protocol";
import { combine } from "@amadeus-music/util/object";
import { identify } from "./identity";

function page<T extends Record<string, any>>(
  number: number,
  groups: string[],
  completed: Set<number>,
  options: PaginationOptions<T>
) {
  const progress = groups.map(() => new Set());
  const map = new Map<string, T>();
  const size = options.page;
  const items: T[] = [];

  const params = { compare: options.compare, map, identify, convert, merge };

  return {
    number,
    append(id: number, batch: T[]) {
      if (this.satisfied(id)) {
        return progress.map((_, i) => (i === id ? batch : []));
      }

      batch.forEach((x) => progress[id].add(identify(x)));
      combine(items, batch, params);
      const overshoot = items.splice(size);
      return progress.map((x) => overshoot.filter((y) => x.has(identify(y))));
    },
    satisfied(id: number) {
      return progress[id].size >= size || completed.has(id);
    },
    get items() {
      return items;
    },
    get progress() {
      const part = 1 / progress.length;
      return progress.reduce(
        (acc, x, id) =>
          acc + (this.satisfied(id) ? part : part * (x.size / size)),
        0
      );
    },
  };
}

function pages<T extends Record<string, any>>(
  groups: string[],
  options: PaginationOptions<T>
) {
  const completed = new Set<number>();
  const pages = [page(0, groups, completed, options)];
  let selected = 0;

  const { resolve, wait } = lock();
  const create = (number: number) => page(number, groups, completed, options);
  const last = () => pages.findIndex((x) => x.progress < 1);
  const refresh = debounce(() => {
    options.update?.(
      pages[selected].items as Unique<T>[],
      pages[selected].progress,
      pages[selected].number
    );
  }, 1);

  return {
    async append(id: number, batch: T[], number = last()) {
      if (!batch.length) return;
      if (!pages[number]) pages[number] = create(number);
      pages[number].append(id, batch).forEach((batch, id) => {
        this.append(id, batch, number + 1);
      });

      if (number === selected) refresh();
      while (pages[selected].satisfied(id)) await wait();
    },
    next() {
      if (
        completed.size >= groups.length &&
        !pages[selected + 1]?.items.length
      ) {
        return;
      }
      selected++;
      if (!pages[selected]) pages[selected] = create(selected);
      refresh();
      if (pages[selected].progress < 1) resolve();
    },
    prev() {
      if (selected <= 0) return;
      selected--;
      if (!pages[selected]) pages[selected] = create(selected);
      refresh();
      if (pages[selected].progress < 1) resolve();
    },
    complete(id: number) {
      const changed = !pages[selected].satisfied(id);
      completed.add(id);
      if (changed) refresh();
    },
    get current() {
      return pages[selected];
    },
  };
}

function convert<T extends Record<string, any>>(target: T) {
  const copy = { ...target, id: identify(target) };
  for (const key in copy) if (Array.isArray(copy[key])) copy[key].sort();
  return copy;
}

function merge<T extends Record<string, any>>(target: T, source: T) {
  function caseEntropy(text: string) {
    let small = 0;
    let big = 0;
    const lower = text.toLowerCase();
    const upper = text.toUpperCase();
    for (let i = 0; i < text.length; i++) {
      if (lower[i] !== text[i]) big++;
      if (upper[i] !== text[i]) small++;
    }

    const all = big + small;
    return 1 - (Math.abs(all / 2 - small) + Math.abs(all / 2 - big)) / all;
  }

  for (const key in target) {
    const a = target[key] as any;
    const b = source[key] as any;
    let c = a;

    if (typeof a !== typeof b) continue;
    if (typeof a === "string") c = caseEntropy(a) >= caseEntropy(b) ? a : b;
    if (Array.isArray(a) && Array.isArray(b)) {
      const both = new Set(...a, ...b);
      c = [...both].sort();
    } else if (typeof a === "object") c = merge(a, b);
    target[key] = c;
  }

  for (const key in source) {
    if (!(key in target)) target[key] = source[key];
  }
}

type PaginationOptions<T> = {
  page: number;
  invalidate?: () => void;
  compare: (a: T, b: T) => number;
  update?: (items: Unique<T>[], progress: number, page: number) => void;
};

export { pages, type PaginationOptions };
