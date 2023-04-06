<script lang="ts">
  import type { Realm } from "./Realm.svelte";
  import { getContext } from "svelte";

  export let name = "";

  const realm = getContext<Realm>("realm");
  if (!realm) throw new Error("A gateway should exists within a realm!");
  if (!realm[name]) realm[name] = { unique: new Set(), ssr: "" };

  const target = eval("slots");
  if (import.meta.env.SSR) {
    target.default = () => `<!--<Gateway:${name}>-->`;
  } else {
    eval("$$scope = { ctx: [] }");
    if (!target.default) target.default = [];
    target.default[0] = () => ({
      m: (..._: any[]) => (realm[name].target ??= _),
      d: () => (realm[name].target = undefined),
      c: () => {},
      l: () => {},
    });
  }
</script>

{#await import.meta.env.SSR ? null : Promise.resolve() then _}
  <slot />
{/await}
