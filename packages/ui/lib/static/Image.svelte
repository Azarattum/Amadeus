<script lang="ts">
  import { onMount } from "svelte";

  export let thumbnail: string | null | undefined = undefined;
  export let src: string | null | undefined = undefined;
  export let size = 48;
  export let alt = "";

  $: state =
    src === "" || src === null
      ? "error"
      : ("loading" as "loading" | "ok" | "error");

  let image: HTMLImageElement;
  onMount(() => image?.complete && (image.style.opacity = "1"));
</script>

<div
  class="overflow-hidden {size > 200
    ? 'rounded-2xl'
    : 'rounded'} bg-highlight-100"
  class:animate-pulse={state === "loading"}
  style:height="{size}px"
  style:width="{size}px"
>
  {#if src && state !== "error"}
    <img
      {alt}
      src={size < 100 / devicePixelRatio ? thumbnail : src}
      class="opacity-0 transition-opacity duration-500"
      class:opacity-100={state === "ok"}
      loading="lazy"
      width="{size}px"
      height="{size}px"
      draggable="false"
      bind:this={image}
      on:load={() => (state = "ok")}
      on:error={() => (state = "error")}
    />
  {:else if state === "error"}
    <slot />
  {/if}
</div>
