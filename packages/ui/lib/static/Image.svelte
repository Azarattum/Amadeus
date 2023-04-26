<script lang="ts" context="module">
  const canvas = globalThis.document?.createElement("canvas");
  const ctx = canvas?.getContext("2d");
  if (ctx) ctx.imageSmoothingQuality = "high";
  /// TODO: Do some actual persistent caching
  const cache = new Map<string, string>();
</script>

<script lang="ts">
  import { fade } from "svelte/transition";

  export let src: string;
  export let size = 48;
  export let alt = "";

  $: resized = cache.has(src) ? cache.get(src) : resize(desource(src));
  $: loaded = typeof resized === "string";
  $: Promise.resolve(resized).then(() => (loaded = true));

  function desource(src: string) {
    try {
      return JSON.parse(src)[0];
    } catch {}
    return src;
  }

  function resize(src: string) {
    return new Promise<string>((resolve) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = src;
      image.onload = () => {
        canvas.height = size * devicePixelRatio;
        canvas.width = size * devicePixelRatio;
        ctx?.drawImage(
          image,
          0,
          0,
          image.height,
          image.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
        const url = canvas.toDataURL("image/png");
        cache.set(src, url);
        resolve(url);
      };
    });
  }
</script>

<div
  class="overflow-hidden rounded bg-highlight-100"
  class:animate-pulse={!loaded}
  style:height="{size}px"
  style:width="{size}px"
>
  {#if typeof resized === "string"}
    <img src={resized} {alt} width="{size}px" height="{size}px" />
  {:else}
    {#await resized then src}
      <img in:fade {src} {alt} width="{size}px" height="{size}px" />
    {/await}
  {/if}
</div>
