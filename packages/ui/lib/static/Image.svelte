<script lang="ts">
  import { type Classes, tw } from "../../internal/tailwind";

  let classes: Classes = "";
  export { classes as class };
  export let src: string | undefined | null = undefined;
  export let thumbnail: string | undefined | null = src;
  export let cache: string | true = "1d";
  export let size = 48;
  export let alt = "";

  $: resolution = size * globalThis.devicePixelRatio;
  $: data = resolution < 100 ? thumbnail : src;
  $: url = `${data}#cache=${cache === true ? "infinity" : cache}&resize=${resolution}`;
  $: loading = data === undefined;
  $: fallback = !data;
</script>

{#if fallback}
  <div
    class={tw`bg-highlight-100 contain-strict ${loading && "animate-pulse"} ${classes}`}
    style:height="{size}px"
    style:width="{size}px"
  >
    {#if !loading}
      <slot />
    {/if}
  </div>
{:else}
  {#key data}
    <img
      class={tw`bg-highlight-100 object-cover ${classes}`}
      crossorigin="anonymous"
      draggable="false"
      src={url}
      {alt}
      on:error={() => (fallback = true)}
      style:height="{size}px"
      style:width="{size}px"
    />
  {/key}
{/if}
