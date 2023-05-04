<script lang="ts" context="module">
  export type Realm = Record<
    string,
    { unique: Set<string>; ssr: string; target?: Node; nodes: Node[] }
  >;
</script>

<script lang="ts">
  import { setContext } from "svelte";

  const realm: Realm = {};
  setContext("realm", realm);
  if (import.meta.env.SSR) {
    const target = eval("slots");
    let html: string = target.default ? target.default({}) : "";
    for (const [key, value] of Object.entries(realm)) {
      html = html.replace(`<!--<Gateway:${key}>-->`, value.ssr);
    }
    target.default = () => html;
  }
</script>

<slot />
