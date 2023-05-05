<script lang="ts">
  import type { Realm } from "./Realm.svelte";
  import { getContext, tick } from "svelte";

  export let to = "";
  export let unique = "";

  const realm = getContext<Realm>("realm");
  if (!realm) throw new Error("A portal should exists within a realm!");
  if (!realm[to]) realm[to] = { unique: new Set(), ssr: "", nodes: [] };

  const target = eval("slots");
  if (import.meta.env.SSR) {
    const slot = target.default ? target.default({}) : "";
    if (!realm[to].unique.has(unique)) {
      if (unique) realm[to].unique.add(unique);
      realm[to].ssr += slot;
    }
    target.default = undefined;
  } else if (target.default) {
    let mounted: string | null = null;
    const [original] = target.default;
    target.default[0] = (..._: any) => {
      const instance = original(..._);
      return {
        ...instance,
        l() {},
        async m(..._: any) {
          if (!realm[to]) return;
          // Skip unique nodes
          if (realm[to].unique.has(unique)) return;
          if (unique) realm[to].unique.add(unique), (mounted = to);
          // Claim SSRed nodes from the gateway
          instance.l(realm[to].nodes);
          const temp = realm[to].nodes[0];
          await tick().then(tick);
          if (!realm[to].target) return;
          // Mount current instance
          instance.m(realm[to].target, temp || realm[to].anchor);
        },
        d(detaching: any) {
          if (mounted != null) realm[mounted].unique.delete(unique);
          instance.d(detaching);
        },
      };
    };
  }
</script>

{#key to}
  <slot />
{/key}
