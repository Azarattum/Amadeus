<script lang="ts">
  import type { Track } from "@amadeus-music/protocol";
  import { Icon, Image } from "@amadeus-music/ui";

  export let of:
    | {
        id?: number;
        arts?: string[];
        thumbnails?: (string | null)[];
        collection?: { tracks: Track[] };
      }
    | undefined = undefined;
  export let round = false;
  export let href: string | undefined = undefined;

  const size = 104;
</script>

<svelte:element
  this={href ? "a" : "div"}
  {href}
  style:width="{size}px"
  style:height="{size}px"
  class="grid shrink-0 grid-cols-2 gap-2 overflow-hidden shadow-lg contain-paint
  {round ? 'rounded-full' : 'rounded-2xl'}
  {href
    ? 'outline outline-0 outline-highlight transition-[outline_transform] active:scale-95 hover:outline-8'
    : ''}"
  class:bg-highlight={Array.isArray(of) && !of.length}
>
  {#if of?.collection && !of.arts}
    {#each of.collection.tracks
      .filter((x) => x.album.arts?.length)
      .slice(0, 4) as { album: { arts, thumbnails } }}
      <Image src={arts?.[0] || ""} thumbnail={thumbnails?.[0] || ""} />
    {/each}
  {:else}
    <Image
      {size}
      src={of ? of.arts?.[0] || "" : undefined}
      thumbnail={of ? of.thumbnails?.[0] || "" : undefined}
    >
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
        style:filter="hue-rotate({of?.id || 0}deg)"
      >
        <Icon name={of && "year" in of ? "disk" : "person"} xl />
      </div>
    </Image>
  {/if}
</svelte:element>
