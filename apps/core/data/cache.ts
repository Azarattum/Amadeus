const caches = new Map<string, { value: unknown; invalidator: Invalidator }>();

type Invalidator<T = unknown> = (value: T) => void;
interface Options<T = unknown> {
  /** Lifetime of the cache is milliseconds */
  lifetime: number;
  /** The invalidator is ran just before the eviction */
  invalidator: Invalidator<T>;
}

const defaults = {
  lifetime: 1000 * 60 * 60,
  invalidator: () => {},
} satisfies Options;

function cache(key: string): unknown | undefined;
function cache<T>(
  key: string,
  value: unknown,
  options?: Partial<Options<T>>
): void;
function cache(key: string, value?: unknown, options: Partial<Options> = {}) {
  if (value === undefined) return caches.get(key)?.value;
  const { lifetime, invalidator } = { ...defaults, ...options };
  setTimeout(() => invalidate(key), lifetime);
  caches.set(key, { value, invalidator });
}

function invalidate(key?: string) {
  if (!key) return caches.clear();
  const existing = caches.get(key);
  if (existing) existing.invalidator(existing.value);
  caches.delete(key);
}

export { cache, invalidate, caches };
