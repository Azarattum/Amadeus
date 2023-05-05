<script lang="ts" context="module">
  export type Realm = Record<
    string,
    {
      anchor?: Node | null;
      unique: Set<string>;
      nodes: Node[];
      target?: Node;
      ssr: string;
    }
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
      html = html.replace(
        `<!--<Gateway:${key}>-->`,
        `<!--<Gateway:${key}>-->` + value.ssr + `<!--</Gateway:${key}>-->`
      );
    }
    target.default = () => html;
  }
</script>

<slot />
