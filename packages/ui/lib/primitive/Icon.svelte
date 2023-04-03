<script lang="ts" context="module">
  const icons = import.meta.glob("../icons/*.svg", { eager: true, as: "raw" });
</script>

<script lang="ts">
  export let name: string;
  export let xl = false;
  export let lg = false;
  export let sm = false;

  $: size = xl ? 44 : lg ? 32 : sm ? 16 : 24;
  $: source = icons[`../icons/${name}.svg`];
</script>

{#if source}
  <div
    style:width="{size}px"
    style:height="{size}px"
    class="inline-block shrink-0"
  >
    {@html source}
  </div>
{/if}
