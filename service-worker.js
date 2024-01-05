const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  e + "/_app/immutable/entry/start.03179055.js",
  e + "/_app/immutable/assets/crsqlite.52890b09.wasm",
  e + "/_app/immutable/entry/app.5c6bd2b0.js",
  e + "/_app/immutable/nodes/0.a3bd8319.js",
  e + "/_app/immutable/nodes/1.5e3b78fb.js",
  e + "/_app/immutable/nodes/10.4906efd3.js",
  e + "/_app/immutable/nodes/11.c76e89e8.js",
  e + "/_app/immutable/nodes/2.d7703fb7.js",
  e + "/_app/immutable/nodes/3.22d1602c.js",
  e + "/_app/immutable/nodes/4.216ceda7.js",
  e + "/_app/immutable/nodes/5.8d8fe787.js",
  e + "/_app/immutable/nodes/6.d43464fa.js",
  e + "/_app/immutable/nodes/7.854bf251.js",
  e + "/_app/immutable/nodes/8.a1dc7845.js",
  e + "/_app/immutable/nodes/9.cfbac714.js",
  e + "/_app/immutable/assets/Player.c0ee8b34.css",
  e + "/_app/immutable/assets/Spinner.64f8cddf.css",
  e + "/_app/immutable/chunks/Collection.7b9f2030.js",
  e + "/_app/immutable/chunks/Input.e2885cd3.js",
  e + "/_app/immutable/chunks/Overview.33f93d5c.js",
  e + "/_app/immutable/chunks/Player.ad1ead1b.js",
  e + "/_app/immutable/chunks/Spacer.717899da.js",
  e + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.24c9e146.js",
  e + "/_app/immutable/chunks/Track.ebb2f0bf.js",
  e + "/_app/immutable/chunks/autoscroll.35565e81.js",
  e + "/_app/immutable/chunks/control.f5b05b5f.js",
  e + "/_app/immutable/chunks/index.3432bd78.js",
  e + "/_app/immutable/chunks/paths.efb1cef9.js",
  e + "/_app/immutable/chunks/scheduler.8f775f3a.js",
  e + "/_app/immutable/chunks/singletons.4d4e9649.js",
  e + "/_app/immutable/chunks/stores.20c8bb4c.js",
  e + "/_app/immutable/chunks/stream.d6a8f9f9.js",
  e + "/_app/immutable/chunks/util.382538a3.js"
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
], o = "1704471543642", c = `cache-${o}`, m = [...u, ...b], p = self;
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
