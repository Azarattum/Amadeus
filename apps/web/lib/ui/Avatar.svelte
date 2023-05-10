<script lang="ts">
  import { Icon, Image } from "@amadeus-music/ui";

  export let of:
    | { art?: string; id?: number }
    | { album: { art?: string } }[]
    | undefined = undefined;
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
    {#each of
      .filter((x) => x.album.art && x.album.art !== "[]")
      .slice(0, 4) as { album: { art } }}
      <Image src={art} />
    {/each}
  {:else}
    <Image {size} src={of?.art}>
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
        style:filter="hue-rotate({of?.id || 0}deg)"
      >
        <Icon name={of && "year" in of ? "disk" : "person"} xl />
      </div>
    </Image>
  {/if}
</div>
