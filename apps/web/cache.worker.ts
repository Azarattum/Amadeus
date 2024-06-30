/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />
/// <reference lib="esnext" />
import { version, build, files } from "$service-worker";
import { parse } from "@amadeus-music/util/time";

/** Custom header that controls cache lifetime */
const cacheHeader = "X-Cache-Until";
/** Current cache version */
const current = `cache-${version}`;
/** Application & static assets */
const assets = [...build, ...files];
/** Service worker global scope */
const sw = self as unknown as ServiceWorkerGlobalScope;

/** Cache fetch calls on demand */
sw.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  if (request.method !== "GET") return;

  async function respond() {
    const cache = await caches.open(current);
    const { pathname, hash } = new URL(request.url);
    const params = new URLSearchParams(hash.slice(1));

    function network() {
      return fetch(request).then((response) => {
        if (params.has("cache")) {
          resize(response, params.get("resize")).then((body) => {
            const age = parse(params.get("cache"));
            const headers = new Headers(response.headers);
            headers.set(cacheHeader, (Date.now() + age).toString());
            cache.put(request, new Response(body, { ...response, headers }));
          });
        }

        return response;
      });
    }

    // Immediately serve application files
    if (assets.includes(pathname)) {
      const cached = await cache.match(pathname);
      if (cached) return cached;
    }
    // Handle explicit caching requests
    if (params.has("cache")) {
      const cached = await cache.match(request);
      if (cached) {
        const expires = parseFloat(cached.headers.get(cacheHeader) || "0");
        if (expires > Date.now()) return cached;
        cache.delete(request);
      }
    }

    return network();
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

async function resize(response: Response, size?: string | null) {
  if (!size || !("OffscreenCanvas" in self)) return response.clone().body;

  const [width, height = width] = size.split("x").map((x) => parseInt(x));
  const bitmap = await response.clone().blob().then(createImageBitmap);

  const canvas = new self.OffscreenCanvas(width, height);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  const type = response.headers.get("Content-Type") || "image/jpeg";
  return canvas.convertToBlob({ type });
}
