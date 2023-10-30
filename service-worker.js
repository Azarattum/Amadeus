const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  e + "/_app/immutable/entry/start.296b914f.js",
  e + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  e + "/_app/immutable/entry/app.8267a0d7.js",
  e + "/_app/immutable/nodes/0.fb1803f7.js",
  e + "/_app/immutable/nodes/1.5eb219f1.js",
  e + "/_app/immutable/nodes/10.e85ce788.js",
  e + "/_app/immutable/nodes/11.f0dcd33a.js",
  e + "/_app/immutable/nodes/2.d7703fb7.js",
  e + "/_app/immutable/nodes/3.5ec4fa77.js",
  e + "/_app/immutable/nodes/4.4870023c.js",
  e + "/_app/immutable/nodes/5.b00ccc90.js",
  e + "/_app/immutable/nodes/6.4f3f0d4f.js",
  e + "/_app/immutable/nodes/7.55667c80.js",
  e + "/_app/immutable/nodes/8.f9e1deb5.js",
  e + "/_app/immutable/nodes/9.f81c1788.js",
  e + "/_app/immutable/assets/Player.c0ee8b34.css",
  e + "/_app/immutable/assets/Spinner.90db3a8f.css",
  e + "/_app/immutable/chunks/Collection.7353ea94.js",
  e + "/_app/immutable/chunks/Input.d24fe833.js",
  e + "/_app/immutable/chunks/Overview.53f72cc3.js",
  e + "/_app/immutable/chunks/Player.450d424d.js",
  e + "/_app/immutable/chunks/Spacer.057e2ac6.js",
  e + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.9e9001e5.js",
  e + "/_app/immutable/chunks/Track.8877e3f0.js",
  e + "/_app/immutable/chunks/autoscroll.afada217.js",
  e + "/_app/immutable/chunks/control.f5b05b5f.js",
  e + "/_app/immutable/chunks/index.0fc8bad8.js",
  e + "/_app/immutable/chunks/paths.87873d95.js",
  e + "/_app/immutable/chunks/scheduler.c5d52407.js",
  e + "/_app/immutable/chunks/singletons.2326184b.js",
  e + "/_app/immutable/chunks/stores.3e925cf2.js",
  e + "/_app/immutable/chunks/stream.896947d6.js",
  e + "/_app/immutable/chunks/util.0bf65ded.js"
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
], b = "1698674124901", c = `cache-${b}`, m = [...u, ...o], p = self;
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
