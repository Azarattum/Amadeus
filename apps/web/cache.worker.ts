/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

self.addEventListener("fetch", ((event: FetchEvent) => {
  if (event.request.method !== "GET") return;
  const { hash } = new URL(event.request.url);
  const params = new URLSearchParams(hash.slice(1)).get("cache");
  if (!params) return;
  /// TODO: do caching based on the `cache` params
}) as any);
