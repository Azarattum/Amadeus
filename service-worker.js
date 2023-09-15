const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  e + "/_app/immutable/entry/start.657648fe.js",
  e + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  e + "/_app/immutable/entry/app.194c21b2.js",
  e + "/_app/immutable/nodes/0.70a6b5e7.js",
  e + "/_app/immutable/nodes/1.69117e0f.js",
  e + "/_app/immutable/nodes/10.c465ae7b.js",
  e + "/_app/immutable/nodes/11.29a90cc6.js",
  e + "/_app/immutable/nodes/2.497e5e11.js",
  e + "/_app/immutable/nodes/3.34729a50.js",
  e + "/_app/immutable/nodes/4.f438ff74.js",
  e + "/_app/immutable/nodes/5.e1c15015.js",
  e + "/_app/immutable/nodes/6.2574887d.js",
  e + "/_app/immutable/nodes/7.2eefb3a7.js",
  e + "/_app/immutable/nodes/8.77dc15d8.js",
  e + "/_app/immutable/nodes/9.f8bb6c8a.js",
  e + "/_app/immutable/assets/Player.c0ee8b34.css",
  e + "/_app/immutable/assets/Spinner.e3cd6353.css",
  e + "/_app/immutable/chunks/Collection.625e9488.js",
  e + "/_app/immutable/chunks/Input.50b5d011.js",
  e + "/_app/immutable/chunks/Overview.c7d2c263.js",
  e + "/_app/immutable/chunks/Player.40039dd8.js",
  e + "/_app/immutable/chunks/Spacer.98ca708d.js",
  e + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.ed4cd0b7.js",
  e + "/_app/immutable/chunks/Track.6a86bc53.js",
  e + "/_app/immutable/chunks/autoscroll.e49cf2bd.js",
  e + "/_app/immutable/chunks/control.f5b05b5f.js",
  e + "/_app/immutable/chunks/index.84a1bd3e.js",
  e + "/_app/immutable/chunks/paths.b9f2ee4d.js",
  e + "/_app/immutable/chunks/singletons.3bf80531.js",
  e + "/_app/immutable/chunks/stores.a8d13ee6.js",
  e + "/_app/immutable/chunks/stream.d91359ab.js",
  e + "/_app/immutable/chunks/util.b427c67b.js"
], b = [
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
], o = "1694784118721", c = `cache-${o}`, m = [...u, ...b], p = self;
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
