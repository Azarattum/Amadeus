<script lang="ts">
  import { type Classes, Image, Morph, Icon, tw } from "@amadeus-music/ui";
  import type { Playlist, Artist, Album } from "@amadeus-music/protocol";
  import type { Either } from "@amadeus-music/ui/internal/types";
  import { nully } from "@amadeus-music/util/string";
  import { ok } from "$lib/util/props";

  type $$Props = Either<{
    album: Omit<Album, "artists"> | true;
    playlist: Playlist | true;
    artist: Artist | true;
  }> & {
    marker?: boolean;
    class?: Classes;
    morph?: string;
    href?: string;
  } & Either<{
      lg: boolean;
      md: boolean;
    }>;

  let classes: Classes = "";
  export { classes as class };
  export let album: Omit<Album, "artists"> | true | undefined = undefined;
  export let playlist: Playlist | true | undefined = undefined;
  export let artist: Artist | true | undefined = undefined;
  export let morph: string | undefined = undefined;
  export let marker = false;
  export let lg = false;
  export let md = false;
  export let href = "";

  $: size = lg ? 320 : md ? 104 : 48;
  $: upsize = lg ? { xxl: true } : md ? { xl: true } : {};
  $: downsize = lg ? { md: true } : md ? {} : {};

  $: media = ok(artist) || ok(album);
</script>

{#if href}
  <a {href}><svelte:self {...$$props} href="" /></a>
{:else}
  {#if media}
    {@const rounded = artist ? "rounded-full" : "rounded-relative"}
    {@const thumbnail = media?.thumbnails?.[0] || null}
    {@const src = media?.arts?.[0] || null}
    <Morph key={morph} {marker}>
      <Image class={tw`${rounded} ${classes}`} {thumbnail} {size} {src}>
        <Icon
          of="person"
          class="flex size-full items-center justify-center bg-[linear-gradient(to_right,#fb7185,#f87171)] text-white hue-rotate-[var(--hue)]"
          --hue="{media.id % 360}deg"
          {...upsize}
        />
      </Image>
    </Morph>
  {:else if artist || album}
    {@const rounded = artist ? "rounded-full" : "rounded-relative"}
    <Morph key={morph} {marker}>
      <Image class={tw`${rounded} ${classes}`} {size} />
    </Morph>
  {/if}

  {#if playlist && typeof playlist === "object"}
    <div
      class={tw`flex aspect-square flex-wrap place-content-between ${classes}`}
      style:height="{size}px"
      style:width="{size}px"
    >
      {#each (playlist.collection?.tracks || []).slice(0, 4) as track, i}
        <svelte:self
          morph={nully`${morph}-${i}`}
          album={track.album}
          {marker}
          {...downsize}
        />
      {/each}
    </div>
  {:else if playlist}
    <Morph key={morph} {marker}>
      <Image class="rounded-relative" {size} />
    </Morph>
  {/if}
{/if}
