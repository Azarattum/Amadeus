<script context="module" lang="ts">
  export type Realm = Record<string, ReturnType<typeof initRealm>>;
  export const initRealm = () => ({
    mount: new Set<(target: Node, anchor?: Node | null) => void>(),
    target: undefined as [Node | null, Node | null] | undefined,
    destroy: new Set<(detaching: boolean) => void>(),
    claim: new Set<(nodes?: Node[]) => void>(),
    claimed: new Set<string>(),
    mounted: new Set<string>(),
    ssr: "",
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
        `<!--<Gateway:${key}>-->` + value.ssr + `<!--</Gateway:${key}>-->`,
      );
    }
    target.default = () => html;
  }
</script>

<slot />
