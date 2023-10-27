const a = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  a + "/_app/immutable/entry/start.b9cd9e38.js",
  a + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  a + "/_app/immutable/entry/app.9d9c0a93.js",
  a + "/_app/immutable/nodes/0.cbc55941.js",
  a + "/_app/immutable/nodes/1.06d18f5a.js",
  a + "/_app/immutable/nodes/10.80c3496a.js",
  a + "/_app/immutable/nodes/11.d4be291c.js",
  a + "/_app/immutable/nodes/2.d7703fb7.js",
  a + "/_app/immutable/nodes/3.a2d56806.js",
  a + "/_app/immutable/nodes/4.4b2bb55b.js",
  a + "/_app/immutable/nodes/5.b392221d.js",
  a + "/_app/immutable/nodes/6.b697f6cf.js",
  a + "/_app/immutable/nodes/7.10d8f192.js",
  a + "/_app/immutable/nodes/8.68a00b4f.js",
  a + "/_app/immutable/nodes/9.eed820af.js",
  a + "/_app/immutable/assets/Player.c0ee8b34.css",
  a + "/_app/immutable/assets/Spinner.90db3a8f.css",
  a + "/_app/immutable/chunks/Collection.87f3fbef.js",
  a + "/_app/immutable/chunks/Input.93c089c1.js",
  a + "/_app/immutable/chunks/Overview.7963755d.js",
  a + "/_app/immutable/chunks/Player.0622288d.js",
  a + "/_app/immutable/chunks/Spacer.057e2ac6.js",
  a + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.0ac53beb.js",
  a + "/_app/immutable/chunks/Track.f0cfe286.js",
  a + "/_app/immutable/chunks/autoscroll.1210d3ac.js",
  a + "/_app/immutable/chunks/control.f5b05b5f.js",
  a + "/_app/immutable/chunks/index.0fc8bad8.js",
  a + "/_app/immutable/chunks/paths.a7e1f1aa.js",
  a + "/_app/immutable/chunks/scheduler.c5d52407.js",
  a + "/_app/immutable/chunks/singletons.f13287bc.js",
  a + "/_app/immutable/chunks/stores.71a7623e.js",
  a + "/_app/immutable/chunks/stream.534f3b9f.js",
  a + "/_app/immutable/chunks/util.40a5174d.js"
], b = [
  a + "/CNAME",
  a + "/images/favicon.png",
  a + "/images/logo-180.webp",
  a + "/images/logo-512.webp",
  a + "/images/logo.svg",
  a + "/images/splash-5.webp",
  a + "/images/splash-8.webp",
  a + "/images/splash-plus.webp",
  a + "/images/splash-x.webp",
  a + "/manifest.json"
], o = "1698420785192", c = `cache-${o}`, m = [...u, ...b], p = self;
p.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET")
    return;
  async function t() {
    const s = await caches.open(c), { hash: l, pathname: n } = new URL(e.request.url);
    if (new URLSearchParams(l.slice(1)).get("cache"), m.includes(n)) {
      const i = await s.match(n);
      if (i)
        return i;
    }
    return await fetch(e.request);
  }
  e.respondWith(t());
});
p.addEventListener("install", (e) => {
  async function t() {
    await (await caches.open(c)).addAll(m);
  }
  e.waitUntil(t());
});
p.addEventListener("activate", (e) => {
  async function t() {
    for (const s of await caches.keys())
      s.startsWith("cache-") && s !== c && await caches.delete(s);
  }
  e.waitUntil(t());
});
