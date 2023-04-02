<script lang="ts" context="module">
  const icons = import.meta.glob("../icons/*.svg", { eager: true, as: "raw" });
</script>

<script lang="ts">
  export let name: string;
  export let lg = false;
  export let sm = false;

  $: size = lg ? 32 : sm ? 16 : 24;
  $: source = icons[`../icons/${name}.svg`];
</script>

<div style:width="{size}px" style:height="{size}px" class="inline-block">
  {@html source}
</div>
