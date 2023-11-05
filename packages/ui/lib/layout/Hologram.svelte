<script context="module" lang="ts">
  type Context = {
    active: Readable<string>;
    route: Readable<string>;
    root: Readable<string>;
    hash: Readable<string>;
  };

  function active() {
    return getContext<Context>("pages").active;
  }

  function route(at: string) {
    const context = getContext<Context>("pages");
    const route = derived(context.route, (x) => (x ? `${x}/${at}` : at));
    setContext<Context>("pages", { ...context, route });
    return { route, parent: context.route };
  }

  function link(to: string) {
    const context = getContext<Context>("pages");
    let nested = "";

    return derived(
      [context.root, context.route, context.active, context.hash],
      ([root, route, active, hash]) => {
        hash = hash && "#" + hash;
        const target = route ? `${route}/${to}${hash}` : to;

        if (!nested) nested = `${root}/${target}`;
        if (active.startsWith(target)) {
          nested = `${root}/${active}${hash}`;
          return `${root}/${target}`;
        } else {
          return nested;
        }
      },
    );
  }

  export { active, route, link };
</script>

<script lang="ts">
  import { derived, readable, type Readable } from "svelte/store";
  import { getContext, setContext } from "svelte";
  import { page } from "$app/stores";

  export let of: string;

  const pattern = `/[...${of}]`;
  const hash = derived(page, (x) => x.url.hash.slice(1));
  const root = derived(page, (x) => x.route.id?.replace(pattern, "") || "");
  const active = derived(page, (x) => x.params[of]?.replace(/\/$/, "") || "");

  setContext<Context>("pages", { route: readable(""), root, active, hash });
</script>

<slot page={$active} hash={$hash} root={$root} />
