const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  e + "/_app/immutable/entry/start.2b499dcb.js",
  e + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  e + "/_app/immutable/entry/app.c41e24fe.js",
  e + "/_app/immutable/nodes/0.d03ff961.js",
  e + "/_app/immutable/nodes/1.47dcc258.js",
  e + "/_app/immutable/nodes/10.a4b3b824.js",
  e + "/_app/immutable/nodes/11.6cbc55ab.js",
  e + "/_app/immutable/nodes/2.d7703fb7.js",
  e + "/_app/immutable/nodes/3.fda5f2ef.js",
  e + "/_app/immutable/nodes/4.c75177ad.js",
  e + "/_app/immutable/nodes/5.e7860f0d.js",
  e + "/_app/immutable/nodes/6.c847dca4.js",
  e + "/_app/immutable/nodes/7.686c0c0e.js",
  e + "/_app/immutable/nodes/8.7e6cfe4b.js",
  e + "/_app/immutable/nodes/9.a21f7fe0.js",
  e + "/_app/immutable/assets/Player.c0ee8b34.css",
  e + "/_app/immutable/assets/Spinner.90db3a8f.css",
  e + "/_app/immutable/chunks/Collection.e0f6f15c.js",
  e + "/_app/immutable/chunks/Input.858614b0.js",
  e + "/_app/immutable/chunks/Overview.56b2dd2f.js",
  e + "/_app/immutable/chunks/Player.d27cf9c5.js",
  e + "/_app/immutable/chunks/Spacer.057e2ac6.js",
  e + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.a6e64879.js",
  e + "/_app/immutable/chunks/Track.045956c1.js",
  e + "/_app/immutable/chunks/autoscroll.9b720227.js",
  e + "/_app/immutable/chunks/control.f5b05b5f.js",
  e + "/_app/immutable/chunks/index.0fc8bad8.js",
  e + "/_app/immutable/chunks/paths.36287d71.js",
  e + "/_app/immutable/chunks/scheduler.c5d52407.js",
  e + "/_app/immutable/chunks/singletons.f6125dcd.js",
  e + "/_app/immutable/chunks/stores.66837f07.js",
  e + "/_app/immutable/chunks/stream.80790bc7.js",
  e + "/_app/immutable/chunks/util.76effc52.js"
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
], o = "1698428970334", c = `cache-${o}`, m = [...u, ...b], p = self;
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
