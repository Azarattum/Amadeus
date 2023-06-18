const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  e + "/_app/immutable/entry/start.ce9b72fa.js",
  e + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  e + "/_app/immutable/entry/app.5ec30f37.js",
  e + "/_app/immutable/nodes/0.849e1f54.js",
  e + "/_app/immutable/nodes/1.e45340d3.js",
  e + "/_app/immutable/nodes/10.7b124ae7.js",
  e + "/_app/immutable/nodes/11.0fd7a5a3.js",
  e + "/_app/immutable/nodes/2.497e5e11.js",
  e + "/_app/immutable/nodes/3.d29e1c1f.js",
  e + "/_app/immutable/nodes/4.9280f1f8.js",
  e + "/_app/immutable/nodes/5.d4f5388d.js",
  e + "/_app/immutable/nodes/6.912fe3a6.js",
  e + "/_app/immutable/nodes/7.b6fe6fc8.js",
  e + "/_app/immutable/nodes/8.c21a8a66.js",
  e + "/_app/immutable/nodes/9.6820c7d1.js",
  e + "/_app/immutable/assets/Player.c0ee8b34.css",
  e + "/_app/immutable/assets/Spinner.e3cd6353.css",
  e + "/_app/immutable/chunks/Collection.0764a713.js",
  e + "/_app/immutable/chunks/Input.66097ce7.js",
  e + "/_app/immutable/chunks/Overview.0cec3efa.js",
  e + "/_app/immutable/chunks/Player.f344efcc.js",
  e + "/_app/immutable/chunks/Spacer.98ca708d.js",
  e + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.1007239d.js",
  e + "/_app/immutable/chunks/Track.f4dc3669.js",
  e + "/_app/immutable/chunks/autoscroll.33fd421b.js",
  e + "/_app/immutable/chunks/control.f5b05b5f.js",
  e + "/_app/immutable/chunks/index.84a1bd3e.js",
  e + "/_app/immutable/chunks/paths.9124caa8.js",
  e + "/_app/immutable/chunks/singletons.0780fce8.js",
  e + "/_app/immutable/chunks/stores.1d34bc11.js",
  e + "/_app/immutable/chunks/stream.7b84773f.js",
  e + "/_app/immutable/chunks/util.245348a2.js"
], o = [
  e + "/CNAME",
  e + "/images/favicon.png",
  e + "/images/logo-180.webp",
  e + "/images/logo-512.webp",
  e + "/images/logo.svg",
  e + "/images/splash-5.webp",
  e + "/images/splash-8.webp",
  e + "/images/splash-plus.webp",
  e + "/images/splash-x.webp",
  e + "/manifest.json"
], b = "1687077198082", c = `cache-${b}`, m = [...u, ...o], p = self;
p.addEventListener("fetch", (a) => {
  if (a.request.method !== "GET")
    return;
  async function t() {
    const s = await caches.open(c), { hash: l, pathname: n } = new URL(a.request.url);
    if (new URLSearchParams(l.slice(1)).get("cache"), m.includes(n)) {
      const i = await s.match(n);
      if (i)
        return i;
    }
    return await fetch(a.request);
  }
  a.respondWith(t());
});
p.addEventListener("install", (a) => {
  async function t() {
    await (await caches.open(c)).addAll(m);
  }
  a.waitUntil(t());
});
p.addEventListener("activate", (a) => {
  async function t() {
    for (const s of await caches.keys())
      s.startsWith("cache-") && s !== c && await caches.delete(s);
  }
  a.waitUntil(t());
});
