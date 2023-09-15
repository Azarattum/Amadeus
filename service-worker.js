const a = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  a + "/_app/immutable/entry/start.403048da.js",
  a + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  a + "/_app/immutable/entry/app.e9f02e15.js",
  a + "/_app/immutable/nodes/0.35829ef9.js",
  a + "/_app/immutable/nodes/1.cb3ec366.js",
  a + "/_app/immutable/nodes/10.5e276b8b.js",
  a + "/_app/immutable/nodes/11.0e47e2ee.js",
  a + "/_app/immutable/nodes/2.497e5e11.js",
  a + "/_app/immutable/nodes/3.2aa08aaa.js",
  a + "/_app/immutable/nodes/4.e9b3aba6.js",
  a + "/_app/immutable/nodes/5.ce2fe09a.js",
  a + "/_app/immutable/nodes/6.1ce83989.js",
  a + "/_app/immutable/nodes/7.da826cca.js",
  a + "/_app/immutable/nodes/8.815791a1.js",
  a + "/_app/immutable/nodes/9.9c4a84ea.js",
  a + "/_app/immutable/assets/Player.c0ee8b34.css",
  a + "/_app/immutable/assets/Spinner.e3cd6353.css",
  a + "/_app/immutable/chunks/Collection.80a6433f.js",
  a + "/_app/immutable/chunks/Input.9f31e30a.js",
  a + "/_app/immutable/chunks/Overview.1ded8ffd.js",
  a + "/_app/immutable/chunks/Player.9458476b.js",
  a + "/_app/immutable/chunks/Spacer.98ca708d.js",
  a + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.c059ec09.js",
  a + "/_app/immutable/chunks/Track.23aa9abb.js",
  a + "/_app/immutable/chunks/autoscroll.f36ad9e7.js",
  a + "/_app/immutable/chunks/control.f5b05b5f.js",
  a + "/_app/immutable/chunks/index.84a1bd3e.js",
  a + "/_app/immutable/chunks/paths.8460f9e3.js",
  a + "/_app/immutable/chunks/singletons.f64675c0.js",
  a + "/_app/immutable/chunks/stores.dd7b98e4.js",
  a + "/_app/immutable/chunks/stream.0890742a.js",
  a + "/_app/immutable/chunks/util.f1fbddbb.js"
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
], o = "1694759544521", c = `cache-${o}`, m = [...u, ...b], p = self;
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
