<script lang="ts">
  // @ts-ignore Svelte 4 has no typings for `svelte/internal`
  import { comment, detach, insert_hydration, tick } from "svelte/internal";
  import { initRealm, type Realm } from "./Realm.svelte";
  import { getContext } from "svelte";

  export let name = "";

  const realm = getContext<Realm>("realm");
  if (!realm) throw new Error("A gateway should exists within a realm!");
  $: if (!realm[name]) realm[name] = initRealm();

  const target = eval("slots");
  if (import.meta.env.SSR) {
    target.default = () => `<!--<Gateway:${name}>-->`;
  } else {
    eval("$$scope = { ctx: [] }");
    if (!target.default) target.default = [];

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
        const claimed = nodes.splice(from, to - from + 1);
        detach(claimed.shift() as Node);
        detach(claimed.pop() as Node);
        for (const x of claimed) {
          (x as any).claim_order = meta.total_claimed;
          meta.total_claimed += 1;
        }

        realm[name].claim.forEach((x) => x(claimed));
        claimed.forEach(detach);
      },
      m: async (target: Node, anchor: Node) => {
        realm[name].mount.forEach((x) => x(target, anchor));
        const temp = comment("");
        insert_hydration(target, temp, anchor);
        await tick();
        realm[name].target = [temp.parentNode, temp.nextSibling];
        detach(temp);
      },
      d: (detaching: boolean) => {
        realm[name].destroy.forEach((x) => x(detaching));
        realm[name] = initRealm();
      },
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
