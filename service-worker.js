self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET")
    return;
  const { hash: r } = new URL(e.request.url);
  new URLSearchParams(r.slice(1)).get("cache");
});
