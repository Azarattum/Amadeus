<script lang="ts">
  import { Image } from "@amadeus-music/ui";

  export let of: { art?: string } | { album: { art?: string } }[] | undefined =
    undefined;
  export let round = false;

  const size = 104;
</script>

<div
  style:width="{size}px"
  style:height="{size}px"
  class="grid shrink-0 grid-cols-2 gap-2 overflow-hidden shadow-lg contain-paint
  {round ? 'rounded-full' : 'rounded-2xl'}"
  class:bg-highlight={Array.isArray(of) && !of.length}
>
  {#if Array.isArray(of)}
    {#each of.filter((x) => x.album.art).slice(0, 4) as { album: { art } }}
      <Image src={art} />
    {/each}
  {:else}
    <Image {size} src={of?.art} />
  {/if}
</div>
