<script lang="ts">
  import { Image, Text, When, Card } from "@amadeus-music/ui";
  import type { TrackInfo } from "@amadeus-music/protocol";

  export let sm = false;
  export let track: TrackInfo;
  export let selected: boolean | "passive" = false;
</script>

<Card sm flat flow={!sm} interactive on:contextmenu on:click {selected}>
  <Image src={track.album.art} slot="before" />
  <Text accent>{track.title}</Text>
  <Text secondary sm>{track.artists.map((x) => x.title).join(", ")}</Text>
  {#if !sm}
    <When lg><Text secondary sm>{track.album.title}</Text></When>
  {/if}
  <slot slot="after" />
</Card>
