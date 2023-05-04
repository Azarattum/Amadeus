<script lang="ts">
  import type { Realm } from "./Realm.svelte";
  import { getContext } from "svelte";

  export let name = "";

  const realm = getContext<Realm>("realm");
  if (!realm) throw new Error("A gateway should exists within a realm!");
  if (!realm[name]) realm[name] = { unique: new Set(), ssr: "", nodes: [] };

  const target = eval("slots");
  if (import.meta.env.SSR) {
    target.default = () => `<!--<Gateway:${name}>-->`;
  } else {
    eval("$$scope = { ctx: [] }");
    if (!target.default) target.default = [];
    target.default[0] = () => ({
      l: (nodes: any) => ((realm[name].nodes = [...nodes]), (nodes.length = 0)),
      m: (target: Node) => (realm[name].target ??= target),
      d: () => (realm[name].target = undefined),
      c: () => {},
    });
  }
</script>

<div class="contents"><slot /></div>
