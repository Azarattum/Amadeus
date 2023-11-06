/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />
/// <reference lib="esnext" />
import { version, build, files } from "$service-worker";

/** Current cache version */
const current = `cache-${version}`;
/** Application & static assets */
const assets = [...build, ...files];
/** Service worker global scope */
const sw = self as unknown as ServiceWorkerGlobalScope;

/** Cache fetch calls on demand */
sw.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.method !== "GET") return;

  async function respond() {
    const cache = await caches.open(current);
    const { pathname, hash } = new URL(event.request.url);
    const params = new URLSearchParams(hash.slice(1)).get("cache");

    // Immediately serve application files
    if (assets.includes(pathname)) {
      const cached = await cache.match(pathname);
      if (cached) return cached;
    }
    // Handle caching on demand
    if (params) {
      /// TODO: do caching based on the `cache` params
    }

    return await fetch(event.request);
  }
  event.respondWith(respond());
});

/** Cache app on install */
sw.addEventListener("install", (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(current);
    await cache.addAll(assets);
  }
  event.waitUntil(addFilesToCache());
});

/** Invalidate old caches */
sw.addEventListener("activate", (event) => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (!key.startsWith("cache-")) continue;
      if (key !== current) await caches.delete(key);
    }
  }
  event.waitUntil(deleteOldCaches());
});
