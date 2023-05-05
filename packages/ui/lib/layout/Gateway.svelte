<script lang="ts">
  import { comment, detach, insert_hydration, tick } from "svelte/internal";
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
    let hydrating: Node[] = [];

    target.default[0] = () => ({
      l: (nodes: Node[]) => {
        // Find block of SSRed gateway nodes
        const from = findComment(nodes, `<Gateway:${name}>`, 0);
        const to = findComment(nodes, `</Gateway:${name}>`, from);
        if (from === to) return;
        const meta = ((nodes as any).claim_info ??= {
          total_claimed: 0,
          last_index: 0,
        });

        // Removed marker comments and set order
        hydrating = nodes.splice(from, to - from + 1);
        detach(hydrating.shift() as Node);
        detach(hydrating.pop() as Node);
        for (const x of hydrating) {
          (x as any).claim_order = meta.total_claimed;
          meta.total_claimed += 1;
        }
        realm[name].nodes = [...hydrating];
      },
      m: (target: Node, anchor: Node) => {
        // Create a temp element to remember mount position
        const temp = hydrating.length ? undefined : comment("");
        if (temp) hydrating.push(temp);
        // Hydrate all the SSR nodes
        hydrating.forEach((x) => insert_hydration(target, x, anchor));
        const last = hydrating[hydrating.length - 1];
        hydrating = [];

        tick().then(() => {
          // Save `anchor` and `target` for portal to render
          realm[name].anchor = last?.nextSibling;
          realm[name].target = target;
          if (temp) detach(last);
        });
      },
      d: () => (realm[name].target = undefined),
      c: () => {},
    });
  }

  function findComment(nodes: Node[], text: string, start: number) {
    for (let i = start; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node.nodeType === 8 && node.textContent?.trim() === text) return i;
    }
    return nodes.length;
  }
</script>

<slot />
