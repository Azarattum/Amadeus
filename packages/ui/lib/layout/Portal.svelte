<script lang="ts">
  import { initRealm, type Realm } from "./Realm.svelte";
  import { getContext } from "svelte";

  export let to = "";
  export let unique = "";

  const realm = getContext<Realm>("realm");
  if (!realm) throw new Error("A portal should exists within a realm!");
  if (!realm[to]) realm[to] = initRealm();
  $: if (!realm[to]) realm[to] = initRealm();

  const target = eval("slots");
  if (import.meta.env.SSR) {
    const slot = target.default ? target.default({}) : "";
    if (!realm[to].mounted.has(unique)) {
      if (unique) realm[to].mounted.add(unique);
      realm[to].ssr += slot;
    }
    target.default = undefined;
  } else if (target.default) {
    const [original] = target.default;
    target.default[0] = (..._: any) => {
      const instance = original(..._);
      const context = realm[to];
      let mounted = true;
      let created = true;

      function claim(nodes?: Node[]) {
        if (!nodes || context.claimed.has(unique)) return (created = false);
        instance.l(nodes);
        if (unique) context.claimed.add(unique);
      }

      function mount(target: Node | null, anchor?: Node | null) {
        if (context.mounted.has(unique)) return (mounted = false);
        if (created) instance.m(target, anchor);
        if (unique) context.mounted.add(unique);
      }

      function destroy(detaching: boolean) {
        if (mounted) context.mounted.delete(unique);
        if (created) context.claimed.delete(unique);
        if (mounted) instance.d(detaching);
        context.claim.delete(claim);
        context.mount.delete(mount);
        context.destroy.delete(destroy);
      }

      context.claim.add(claim);
      context.mount.add(mount);
      context.destroy.add(destroy);
      return {
        ...instance,
        d: destroy,
        l: () => {},
        m: () => context.target && mount.apply(null, context.target),
      };
    };
  }
</script>

{#key to}
  <slot />
{/key}
