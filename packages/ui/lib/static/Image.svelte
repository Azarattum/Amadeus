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

  $: resized = cache.has(desource(src) + size)
    ? cache.get(desource(src) + size)
    : resize(desource(src));
  $: loaded = typeof resized === "string";
  $: Promise.resolve(resized).then(() => (loaded = true));

  function desource(src: string) {
    try {
      return JSON.parse(src)[0];
    } catch {}
    return src;
  }

  function resize(src: string) {
    if (!("Image" in globalThis)) return new Promise<string>(() => {});
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
        const url = canvas.toDataURL("image/webp");
        cache.set(src + size, url);
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
    <img
      {alt}
      src={resized}
      width="{size}px"
      height="{size}px"
      draggable="false"
    />
  {:else}
    {#await resized then src}
      <img
        {src}
        {alt}
        in:fade
        width="{size}px"
        height="{size}px"
        draggable="false"
      />
    {/await}
  {/if}
</div>
