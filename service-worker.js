const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  e + "/_app/immutable/entry/start.b6b1e116.js",
  e + "/_app/immutable/assets/crsqlite.0980e00c.wasm",
  e + "/_app/immutable/entry/app.929b67a2.js",
  e + "/_app/immutable/nodes/0.2d38d4b8.js",
  e + "/_app/immutable/nodes/1.6550643e.js",
  e + "/_app/immutable/nodes/10.102fcdc3.js",
  e + "/_app/immutable/nodes/11.dc399da6.js",
  e + "/_app/immutable/nodes/2.d7703fb7.js",
  e + "/_app/immutable/nodes/3.8fff3891.js",
  e + "/_app/immutable/nodes/4.d0e51d3e.js",
  e + "/_app/immutable/nodes/5.5134bbfb.js",
  e + "/_app/immutable/nodes/6.1dec6bd3.js",
  e + "/_app/immutable/nodes/7.d71d65f4.js",
  e + "/_app/immutable/nodes/8.241fa2bd.js",
  e + "/_app/immutable/nodes/9.45331d93.js",
  e + "/_app/immutable/assets/Player.c0ee8b34.css",
  e + "/_app/immutable/assets/Spinner.64f8cddf.css",
  e + "/_app/immutable/chunks/Collection.6c50a7c9.js",
  e + "/_app/immutable/chunks/Input.6264ebb4.js",
  e + "/_app/immutable/chunks/Overview.83de2f51.js",
  e + "/_app/immutable/chunks/Player.cc859eb1.js",
  e + "/_app/immutable/chunks/Spacer.717899da.js",
  e + "/_app/immutable/chunks/Spinner.svelte_svelte_type_style_lang.23bdde97.js",
  e + "/_app/immutable/chunks/Track.1c0e7761.js",
  e + "/_app/immutable/chunks/autoscroll.af753c76.js",
  e + "/_app/immutable/chunks/control.f5b05b5f.js",
  e + "/_app/immutable/chunks/index.3432bd78.js",
  e + "/_app/immutable/chunks/paths.b199e526.js",
  e + "/_app/immutable/chunks/scheduler.8f775f3a.js",
  e + "/_app/immutable/chunks/singletons.60e91733.js",
  e + "/_app/immutable/chunks/stores.b178a123.js",
  e + "/_app/immutable/chunks/stream.1ce412d1.js",
  e + "/_app/immutable/chunks/util.df4c29c7.js"
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
], d = "1703248498550", c = `cache-${d}`, m = [...u, ...b], p = self;
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
