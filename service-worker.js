const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  e + "/_app/immutable/entry/start.c7b173be.js",
  e + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  e + "/_app/immutable/entry/app.a974ca73.js",
  e + "/_app/immutable/nodes/0.b18aa578.js",
  e + "/_app/immutable/nodes/1.6e4b5739.js",
  e + "/_app/immutable/nodes/10.c19505d8.js",
  e + "/_app/immutable/nodes/11.57edc8c2.js",
  e + "/_app/immutable/nodes/2.497e5e11.js",
  e + "/_app/immutable/nodes/3.5971e598.js",
  e + "/_app/immutable/nodes/4.bc1ec59c.js",
  e + "/_app/immutable/nodes/5.38086123.js",
  e + "/_app/immutable/nodes/6.0256f24f.js",
  e + "/_app/immutable/nodes/7.a4271117.js",
  e + "/_app/immutable/nodes/8.3e36cf3e.js",
  e + "/_app/immutable/nodes/9.93eeb14d.js",
  e + "/_app/immutable/assets/Player.c0ee8b34.css",
  e + "/_app/immutable/assets/Spinner.e3cd6353.css",
  e + "/_app/immutable/chunks/Collection.6f83e498.js",
  e + "/_app/immutable/chunks/Input.e6fe1247.js",
  e + "/_app/immutable/chunks/Overview.8d8086df.js",
  e + "/_app/immutable/chunks/Player.a8648dcc.js",
  e + "/_app/immutable/chunks/Spacer.98ca708d.js",
  e + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.4c7447fd.js",
  e + "/_app/immutable/chunks/Track.1a081857.js",
  e + "/_app/immutable/chunks/autoscroll.d8b19599.js",
  e + "/_app/immutable/chunks/control.f5b05b5f.js",
  e + "/_app/immutable/chunks/index.84a1bd3e.js",
  e + "/_app/immutable/chunks/paths.e6cb63f4.js",
  e + "/_app/immutable/chunks/singletons.42d71294.js",
  e + "/_app/immutable/chunks/stores.b8e53b39.js",
  e + "/_app/immutable/chunks/stream.01793de6.js",
  e + "/_app/immutable/chunks/util.cf2ee4e3.js"
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
], b = "1694852893998", c = `cache-${b}`, m = [...u, ...o], p = self;
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
