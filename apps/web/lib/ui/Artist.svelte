<script lang="ts">
  import { Icon, Stack, Header, Text, Topbar } from "@amadeus-music/ui";
  import type { ArtistInfo, TrackInfo } from "@amadeus-music/protocol";
  import { format } from "@amadeus-music/util/string";
  import Tracks from "$lib/ui/Tracks.svelte";
  import Avatar from "./Avatar.svelte";

  export let selected = new Set<(typeof tracks)[number]>();
  export let info: ArtistInfo | undefined = undefined;
  export let tracks: TrackInfo[];
  $: time = format(tracks.reduce((a, b) => a + b.length, 0));
</script>

<Topbar title={info?.title || ""}>
  <Stack gap="lg" x center p>
    <Avatar round of={info} />
    <Stack gap>
      <Header loading={!info}>{info?.title}</Header>
      <Stack x gap="lg">
        <Text secondary loading={!tracks.length}>
          <Icon name="note" sm />
          {tracks.length}
        </Text>
        <Text secondary loading={!time}>
          <Icon name="clock" sm />
          {time}
        </Text>
      </Stack>
    </Stack>
  </Stack>
</Topbar>
<!-- /// TODO: albums -->

<Tracks {tracks} on:edit on:click on:action bind:selected>
  <slot name="action" slot="action" />
  <slot />
</Tracks>
