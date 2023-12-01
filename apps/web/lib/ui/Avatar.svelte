<script lang="ts">
  import type { Track } from "@amadeus-music/protocol";
  import { Image, Icon, tw } from "@amadeus-music/ui";

  let classes = "";
  export { classes as class };
  export let of:
    | {
        collection?: { tracks: Track[] };
        thumbnails?: (string | null)[];
        arts?: string[];
        id?: number;
      }
    | undefined = undefined;
  export let href: string | undefined = undefined;
  export let round = false;

  const size = 104;
</script>

<svelte:element
  this={href ? "a" : "div"}
  class={tw`grid shrink-0 grid-cols-2 gap-2 overflow-hidden shadow-lg contain-paint
  ${round ? "rounded-full" : "rounded-2xl"}
  ${
    href &&
    "outline outline-0 outline-highlight transition-[outline_transform] active:scale-95 hover:outline-8"
  } ${classes}`}
  {href}
  class:bg-highlight={Array.isArray(of) && !of.length}
  style:height="{size}px"
  style:width="{size}px"
>
  {#if of?.collection && !of.arts}
    {#each of.collection.tracks
      .filter((x) => x.album.arts?.length)
      .slice(0, 4) as { album: { thumbnails, arts } }, i}
      <Image thumbnail={thumbnails?.[0] || ""} src={arts?.[0] || ""} />
    {/each}
  {:else}
    <Image
      thumbnail={of ? of.thumbnails?.[0] || "" : undefined}
      src={of ? of.arts?.[0] || "" : undefined}
      {size}
    >
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
        style:filter="hue-rotate({of?.id || 0}deg)"
      >
        <Icon of={of && "year" in of ? "disk" : "person"} xl />
      </div>
    </Image>
  {/if}
</svelte:element>
