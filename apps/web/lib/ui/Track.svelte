<script lang="ts">
  import { Image, Text, When, Card, Icon } from "@amadeus-music/ui";
  import type { Track } from "@amadeus-music/protocol";

  export let sm = false;
  export let progress = 0;
  export let selected: boolean | "passive" = false;
  export let track: Track | undefined = undefined;

  $: [primary = undefined, ...sub] = track?.title.split("(") || [];
  $: secondary = sub.length ? "(" + sub.join("(") : "";
</script>

<Card sm flat flow={!sm} interactive on:contextmenu on:click {selected}>
  <Image
    src={track ? track.album.arts?.[0] || "" : undefined}
    thumbnail={track ? track.album.thumbnails?.[0] || "" : undefined}
    slot="before"
  >
    <div
      class="flex h-full w-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
      style:filter="hue-rotate({track?.id || 0}deg)"
    >
      <Icon name="note" />
    </div>
  </Image>
  <Text accent loading={!track}>
    {primary}
    <Text secondary>{secondary}</Text>
  </Text>
  <Text secondary sm loading={!track}>
    {track?.artists.map((x) => x.title).join(", ")}
  </Text>
  {#if !sm}
    <When lg>
      <Text secondary sm loading={!track}>{track?.album.title}</Text>
    </When>
  {/if}
  <slot slot="after" />
  <div
    class="absolute bottom-0 left-0 h-0.5 w-full origin-left transform-gpu bg-highlight-200 transition-transform duration-1000"
    style:transform="scaleX({progress})"
  />
</Card>
