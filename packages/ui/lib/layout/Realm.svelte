<script lang="ts" context="module">
  export type Realm = Record<string, ReturnType<typeof initRealm>>;
  export const initRealm = () => ({
    ssr: "",
    claimed: new Set<string>(),
    mounted: new Set<string>(),
    claim: new Set<(nodes?: Node[]) => void>(),
    destroy: new Set<(detaching: boolean) => void>(),
    mount: new Set<(target: Node, anchor?: Node | null) => void>(),
    target: undefined as [Node | null, Node | null] | undefined,
  });
</script>

<script lang="ts">
  import { setContext } from "svelte";

  const realm: Realm = {};
  setContext("realm", realm);
  if (import.meta.env.SSR) {
    const target = eval("slots");
    let html: string = target.default ? target.default({}) : "";
    for (const [key, value] of Object.entries(realm)) {
      html = html.replace(
        `<!--<Gateway:${key}>-->`,
        `<!--<Gateway:${key}>-->` + value.ssr + `<!--</Gateway:${key}>-->`
      );
    }
    target.default = () => html;
  }
</script>

<slot />
