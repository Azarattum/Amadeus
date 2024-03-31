<script lang="ts">
  import { type Classes, tw } from "../../internal/tailwind";

  let classes: Classes = "";
  export { classes as class };
  export let src: string | undefined | null = undefined;
  export let thumbnail: string | undefined | null = src;
  export let size = 48;
  export let alt = "";

  $: state =
    src === "" || src === null
      ? "error"
      : ("loading" as "loading" | "error" | "ok");

  let image: HTMLImageElement;
</script>

<div
  class={tw`overflow-hidden bg-highlight-100
    ${size > 200 ? "rounded-2xl" : "rounded"} ${classes}`}
  class:animate-pulse={state === "loading"}
  style:height="{size}px"
  style:width="{size}px"
>
  {#if src && state !== "error"}
    <img
      class="transition-opacity duration-500
        {image && !image.complete && state !== 'ok'
        ? 'opacity-0'
        : 'opacity-100'}"
      src={size < 100 / globalThis.devicePixelRatio ? thumbnail : src}
      crossorigin="anonymous"
      height="{size}px"
      draggable="false"
      width="{size}px"
      {alt}
      on:error={() => (state = "error")}
      on:load={() => (state = "ok")}
      bind:this={image}
    />
  {:else if state === "error"}
    <slot />
  {/if}
</div>
