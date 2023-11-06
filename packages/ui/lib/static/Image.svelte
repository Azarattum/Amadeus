<script lang="ts">
  import { onMount } from "svelte";

  export let thumbnail: string | undefined | null = undefined;
  export let src: string | undefined | null = undefined;
  export let size = 48;
  export let alt = "";

  $: state =
    src === "" || src === null
      ? "error"
      : ("loading" as "loading" | "error" | "ok");

  let image: HTMLImageElement;
  onMount(() => (image?.complete && (image.style.opacity = "1"), false));
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
      src={size < 100 / devicePixelRatio ? thumbnail : src}
      class="opacity-0 transition-opacity duration-500"
      height="{size}px"
      draggable="false"
      width="{size}px"
      loading="lazy"
      {alt}
      class:opacity-100={state === "ok"}
      on:error={() => (state = "error")}
      on:load={() => (state = "ok")}
      bind:this={image}
    />
  {:else if state === "error"}
    <slot />
  {/if}
</div>
