const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  e + "/_app/immutable/entry/start.656deb2f.js",
  e + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  e + "/_app/immutable/entry/app.4852c4b2.js",
  e + "/_app/immutable/nodes/0.7cbca88c.js",
  e + "/_app/immutable/nodes/1.daf52a1d.js",
  e + "/_app/immutable/nodes/10.9ed385cf.js",
  e + "/_app/immutable/nodes/11.60146c8b.js",
  e + "/_app/immutable/nodes/2.d7703fb7.js",
  e + "/_app/immutable/nodes/3.4e525b33.js",
  e + "/_app/immutable/nodes/4.d2771201.js",
  e + "/_app/immutable/nodes/5.d9aae6b5.js",
  e + "/_app/immutable/nodes/6.75649e12.js",
  e + "/_app/immutable/nodes/7.37cb6891.js",
  e + "/_app/immutable/nodes/8.27b70b7d.js",
  e + "/_app/immutable/nodes/9.479e2518.js",
  e + "/_app/immutable/assets/Player.c0ee8b34.css",
  e + "/_app/immutable/assets/Spinner.90db3a8f.css",
  e + "/_app/immutable/chunks/Collection.c47024fe.js",
  e + "/_app/immutable/chunks/Input.a23dace0.js",
  e + "/_app/immutable/chunks/Overview.e4d9805b.js",
  e + "/_app/immutable/chunks/Player.8accf692.js",
  e + "/_app/immutable/chunks/Spacer.057e2ac6.js",
  e + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.44f1e953.js",
  e + "/_app/immutable/chunks/Track.e3d02d5e.js",
  e + "/_app/immutable/chunks/autoscroll.17efa45e.js",
  e + "/_app/immutable/chunks/control.f5b05b5f.js",
  e + "/_app/immutable/chunks/index.0fc8bad8.js",
  e + "/_app/immutable/chunks/paths.a52d509b.js",
  e + "/_app/immutable/chunks/scheduler.c5d52407.js",
  e + "/_app/immutable/chunks/singletons.965b7b29.js",
  e + "/_app/immutable/chunks/stores.9c02c87e.js",
  e + "/_app/immutable/chunks/stream.dc65f62e.js",
  e + "/_app/immutable/chunks/util.f1750cb8.js"
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
], o = "1698426178709", c = `cache-${o}`, m = [...u, ...b], p = self;
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
