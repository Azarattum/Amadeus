<script lang="ts">
  import { Image, Text, When, Card, Icon } from "@amadeus-music/ui";
  import type { TrackInfo } from "@amadeus-music/protocol";

  export let sm = false;
  export let selected: boolean | "passive" = false;
  export let track: (TrackInfo & { id?: number }) | undefined = undefined;
</script>

<Card sm flat flow={!sm} interactive on:contextmenu on:click {selected}>
  <Image src={track?.album.art} slot="before">
    <div
      class="flex h-full w-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
      style:filter="hue-rotate({track?.id || 0}deg)"
    >
      <Icon name="note" />
    </div>
  </Image>
  <Text accent loading={!track}>
    {track?.title}
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
</Card>
